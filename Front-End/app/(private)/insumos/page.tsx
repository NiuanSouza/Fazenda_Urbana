"use client";
import React, { useEffect, useState, useCallback } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiAlertCircle, FiClock } from "react-icons/fi";
import { inputsApi, suppliersApi } from "../../../lib/api";
import { Insumo, Fornecedor } from "../../../types";
import { PageHeader } from "../../../components/ui/PageHeader";
import { SearchInput } from "../../../components/ui/SearchInput";
import { DataTable } from "../../../components/ui/DataTable";
import { Modal } from "../../../components/ui/Modal";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { FormField } from "../../../components/ui/FormField";
import { useToast } from "../../../components/ui/Toast";
import { Badge } from "../../../components/ui/Badge";
import { format } from "date-fns";

export default function Insumos() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [filtered, setFiltered] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [currentInsumo, setCurrentInsumo] = useState<Partial<Insumo>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [toDelete, setToDelete] = useState<number | null>(null);
  
  const { success, error } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [insData, fornData] = await Promise.all([
        inputsApi.list(),
        suppliersApi.list()
      ]);
      setInsumos(insData);
      setFiltered(insData);
      setFornecedores(fornData);
    } catch (err) {
      error((err as Error).message || "Erro ao carregar insumos");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleSearch = (value: string) => {
    const term = value.toLowerCase();
    const filtered = insumos.filter(
      (i) =>
        i.nome_insumo.toLowerCase().includes(term) ||
        (i.fornecedor_nome && i.fornecedor_nome.toLowerCase().includes(term))
    );
    setFiltered(filtered);
  };

  const handleOpenModal = (insumo?: Insumo) => {
    if (insumo) {
      setCurrentInsumo(insumo);
      setIsEditing(true);
    } else {
      setCurrentInsumo({ quantidade_insumo: 0 });
      setIsEditing(false);
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await inputsApi.update(currentInsumo.id!, currentInsumo);
        success("Insumo atualizado com sucesso");
      } else {
        await inputsApi.create(currentInsumo);
        success("Insumo cadastrado com sucesso");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      error((err as Error).message || "Erro ao salvar insumo");
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await inputsApi.delete(toDelete);
      success("Insumo removido com sucesso");
      fetchData();
    } catch (err) {
      error((err as Error).message || "Erro ao remover insumo");
    }
  };

  const renderValidadeBadge = (status: string, data?: string) => {
    if (status.toLowerCase() === "vencido") {
      return <Badge variant="red" icon={<FiAlertCircle />}>Vencido</Badge>;
    }
    if (status.toLowerCase() === "esgotado") {
      return <Badge variant="gray">Esgotado</Badge>;
    }
    
    // Check if close to expiring (within 30 days)
    if (data) {
      const validadeDate = new Date(data);
      const today = new Date();
      const diffTime = Math.abs(validadeDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays <= 30 && validadeDate >= today) {
        return <Badge variant="yellow" icon={<FiClock />}>Vence em {diffDays}d</Badge>;
      }
    }
    
    return <Badge variant="green">Disponível</Badge>;
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      render: (i: Insumo) => <span style={{ color: "var(--text-muted)" }}>#{i.id}</span>
    },
    {
      key: "nome_insumo",
      header: "Nome do Insumo",
      sortable: true,
      render: (i: Insumo) => (
        <div style={{ fontWeight: 600 }}>{i.nome_insumo}</div>
      )
    },
    {
      key: "quantidade_insumo",
      header: "Quantidade",
      sortable: true,
      render: (i: Insumo) => {
        const isLow = i.quantidade_insumo <= 10 && i.quantidade_insumo > 0;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: 600, color: isLow ? "var(--yellow-400)" : i.quantidade_insumo === 0 ? "var(--red-400)" : "inherit" }}>
              {i.quantidade_insumo}
            </span>
            {isLow && <span style={{ fontSize: "11px", color: "var(--yellow-400)" }}>Baixo</span>}
          </div>
        );
      }
    },
    {
      key: "fornecedor",
      header: "Fornecedor",
      render: (i: Insumo) => i.fornecedor_nome || <span style={{ color: "var(--text-muted)" }}>Desconhecido</span>
    },
    {
      key: "validade",
      header: "Status / Validade",
      sortable: true,
      render: (i: Insumo) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
          {renderValidadeBadge(i.validade, i.data_validade)}
          {i.data_validade && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{format(new Date(i.data_validade), "dd/MM/yyyy")}</span>}
        </div>
      )
    },
    {
      key: "actions",
      header: "Ações",
      render: (i: Insumo) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => handleOpenModal(i)}>
            <FiEdit2 size={14} /> Editar
          </button>
          <button className="btn btn-ghost btn-sm" style={{ color: "var(--red-400)" }} onClick={() => { setToDelete(i.id); setConfirmOpen(true); }}>
            <FiTrash2 size={14} /> Excluir
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <PageHeader 
        title="Insumos" 
        subtitle="Controle de estoque de sementes, fertilizantes e materiais."
        action={
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <FiPlus size={16} /> Novo Insumo
          </button>
        }
      />

      <div className="card">
        <div style={{ marginBottom: "20px" }}>
          <SearchInput placeholder="Buscar insumos..." onSearch={handleSearch} />
        </div>

        <DataTable 
          data={filtered} 
          columns={columns} 
          keyExtractor={(i) => i.id} 
          isLoading={loading}
          itemsPerPage={8}
          emptyMessage="Nenhum insumo encontrado."
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? "Editar Insumo" : "Novo Insumo"}
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <FormField
            label="Nome do Insumo"
            required
            value={currentInsumo.nome_insumo || ""}
            onChange={(e) => setCurrentInsumo({ ...currentInsumo, nome_insumo: e.target.value })}
          />

          <div className="grid-2">
            <FormField
              label="Quantidade"
              type="number"
              required
              min="0"
              value={currentInsumo.quantidade_insumo || 0}
              onChange={(e) => setCurrentInsumo({ ...currentInsumo, quantidade_insumo: parseInt(e.target.value) })}
            />
            <FormField
              label="Data de Validade (Opcional)"
              type="date"
              value={currentInsumo.data_validade ? String(currentInsumo.data_validade).split('T')[0] : ""}
              onChange={(e) => setCurrentInsumo({ ...currentInsumo, data_validade: e.target.value || undefined })}
            />
          </div>

          <FormField
            label="Fornecedor"
            as="select"
            required
            value={currentInsumo.fornecedor_cnpj || ""}
            onChange={(e) => setCurrentInsumo({ ...currentInsumo, fornecedor_cnpj: e.target.value })}
            options={[
              { value: "", label: "Selecione um fornecedor..." },
              ...fornecedores.map(f => ({ value: f.cnpj, label: f.nome }))
            ]}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? "Salvar Alterações" : "Cadastrar"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Remover Insumo"
        message="Tem certeza que deseja remover este insumo do estoque? Se ele foi usado em alguma produção, isso pode causar inconsistências de histórico."
        confirmText="Remover"
      />
    </div>
  );
}
