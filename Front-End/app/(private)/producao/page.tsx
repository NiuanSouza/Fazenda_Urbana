"use client";
import React, { useEffect, useState, useCallback } from "react";
import { FiPlus, FiEdit2, FiActivity, FiBox } from "react-icons/fi";
import { productionApi, productsApi } from "../../../lib/api";
import { Producao, Produto } from "../../../types";
import { PageHeader } from "../../../components/ui/PageHeader";
import { SearchInput } from "../../../components/ui/SearchInput";
import { DataTable } from "../../../components/ui/DataTable";
import { Modal } from "../../../components/ui/Modal";
import { FormField } from "../../../components/ui/FormField";
import { useToast } from "../../../components/ui/Toast";
import { Badge } from "../../../components/ui/Badge";
import { format } from "date-fns";

export default function ProducaoPage() {
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [filtered, setFiltered] = useState<Producao[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProducao, setCurrentProducao] = useState<Partial<Producao>>({ insumos: [] });
  
  const { success, error } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodData, produtosData] = await Promise.all([
        productionApi.list(),
        productsApi.list()
      ]);
      setProducoes(prodData);
      setFiltered(prodData);
      setProdutos(produtosData);
    } catch (err) {
      error((err as Error).message || "Erro ao carregar dados de produção");
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
    const filtered = producoes.filter(
      (p) =>
        p.produto_nome.toLowerCase().includes(term) ||
        p.status.toLowerCase().includes(term) ||
        String(p.id).includes(term)
    );
    setFiltered(filtered);
  };

  const handleOpenModal = (producao?: Producao) => {
    if (producao) {
      setCurrentProducao(producao);
      setIsEditing(true);
    } else {
      setCurrentProducao({ 
        status: "Planejada",
        data_inicio: new Date().toISOString().split('T')[0],
        insumos: [] 
      });
      setIsEditing(false);
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProducao.produto_nome) {
      error("Selecione um produto para iniciar a produção");
      return;
    }

    try {
      if (isEditing) {
        await productionApi.update(currentProducao.id!, { 
          status: currentProducao.status,
          data_fim: currentProducao.status === "Completa" ? new Date().toISOString() : currentProducao.data_fim
        });
        success("Status da produção atualizado");
      } else {
        await productionApi.create({
          produto_nome: currentProducao.produto_nome,
          data_inicio: currentProducao.data_inicio,
          status: currentProducao.status,
          insumos: currentProducao.insumos
        });
        success("Nova produção registrada com sucesso");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      error((err as Error).message || "Erro ao salvar produção");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "ativa":
      case "em andamento":
        return <Badge variant="blue" icon={<FiActivity />}>{status}</Badge>;
      case "completa":
      case "concluída":
        return <Badge variant="green">{status}</Badge>;
      case "cancelada":
        return <Badge variant="red">{status}</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  const columns = [
    {
      key: "id",
      header: "Lote Prod.",
      sortable: true,
      render: (p: Producao) => <span style={{ fontWeight: 600 }}>#{p.id}</span>
    },
    {
      key: "produto",
      header: "Produto Cultivado",
      sortable: true,
      render: (p: Producao) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "4px", background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green-400)" }}>
            <FiBox size={14} />
          </div>
          <span style={{ fontWeight: 600 }}>{p.produto_nome}</span>
        </div>
      )
    },
    {
      key: "datas",
      header: "Período",
      render: (p: Producao) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "13px" }}>
          <span style={{ color: "var(--text-secondary)" }}>
            Início: {format(new Date(p.data_inicio), "dd/MM/yyyy")}
          </span>
          {p.data_fim && (
            <span style={{ color: "var(--text-muted)" }}>
              Fim: {format(new Date(p.data_fim), "dd/MM/yyyy")}
            </span>
          )}
        </div>
      )
    },
    {
      key: "insumos",
      header: "Insumos Utilizados",
      render: (p: Producao) => (
        <span style={{ color: "var(--text-muted)" }}>
          {p.insumos?.length || 0} itens consumidos
        </span>
      )
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (p: Producao) => getStatusBadge(p.status)
    },
    {
      key: "actions",
      header: "Ações",
      render: (p: Producao) => (
        <button className="btn btn-ghost btn-sm" onClick={() => handleOpenModal(p)}>
          <FiEdit2 size={14} /> Gerenciar
        </button>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <PageHeader 
        title="Controle de Produção" 
        subtitle="Acompanhe o ciclo de cultivo, desde o plantio até a colheita."
        action={
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <FiPlus size={16} /> Nova Produção
          </button>
        }
      />

      <div className="card">
        <div style={{ marginBottom: "20px" }}>
          <SearchInput placeholder="Buscar por produto ou lote..." onSearch={handleSearch} />
        </div>

        <DataTable 
          data={filtered} 
          columns={columns} 
          keyExtractor={(p) => p.id} 
          isLoading={loading}
          itemsPerPage={8}
          emptyMessage="Nenhuma produção registrada."
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? `Gerenciar Produção #${currentProducao.id}` : "Registrar Nova Produção"}
        width="md"
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {!isEditing ? (
            <>
              <FormField
                label="Produto a Cultivar"
                as="select"
                required
                value={currentProducao.produto_nome || ""}
                onChange={(e) => setCurrentProducao({ ...currentProducao, produto_nome: e.target.value })}
                options={[
                  { value: "", label: "Selecione o produto..." },
                  ...produtos.map(p => ({ value: p.nome_produto, label: p.nome_produto }))
                ]}
              />
              <FormField
                label="Data de Início"
                type="date"
                required
                value={currentProducao.data_inicio ? String(currentProducao.data_inicio).split('T')[0] : ""}
                onChange={(e) => setCurrentProducao({ ...currentProducao, data_inicio: e.target.value })}
              />
              
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "8px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                  A seleção de insumos utilizados deve ser feita durante a criação. Na edição, apenas o status pode ser alterado.
                </p>
                {/* Aqui idealmente haveria uma lista dinâmica de insumos semelhante ao pedido de venda */}
                {/* Para manter simples nesta refatoração, deixamos como está na API original */}
              </div>
            </>
          ) : (
            <FormField
              label="Status da Produção"
              as="select"
              required
              value={currentProducao.status || ""}
              onChange={(e) => setCurrentProducao({ ...currentProducao, status: e.target.value })}
              options={[
                { value: "Planejada", label: "Planejada" },
                { value: "Ativa", label: "Em Cultivo (Ativa)" },
                { value: "Completa", label: "Colheita Concluída (Completa)" },
                { value: "Cancelada", label: "Cancelada / Perdida" },
              ]}
            />
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? "Atualizar Status" : "Iniciar Produção"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
