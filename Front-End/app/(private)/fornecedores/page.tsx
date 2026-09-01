"use client";
import React, { useEffect, useState, useCallback } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiMail, FiPhone } from "react-icons/fi";
import { suppliersApi } from "../../../lib/api";
import { Fornecedor } from "../../../types";
import { PageHeader } from "../../../components/ui/PageHeader";
import { SearchInput } from "../../../components/ui/SearchInput";
import { DataTable } from "../../../components/ui/DataTable";
import { Modal } from "../../../components/ui/Modal";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { FormField } from "../../../components/ui/FormField";
import { useToast } from "../../../components/ui/Toast";
import { Badge } from "../../../components/ui/Badge";

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [filtered, setFiltered] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [currentFornecedor, setCurrentFornecedor] = useState<Partial<Fornecedor>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  
  const { success, error } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await suppliersApi.list();
      setFornecedores(data);
      setFiltered(data);
    } catch (err) {
      error((err as Error).message || "Erro ao carregar fornecedores");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const applyFilters = useCallback((list: Fornecedor[], search: string, status: string) => {
    const term = search.toLowerCase();
    const filteredList = list.filter((f) => {
      const matchSearch = 
        f.nome.toLowerCase().includes(term) ||
        f.cnpj.includes(term) ||
        (f.email && f.email.toLowerCase().includes(term));
        
      const matchStatus = status === "todos" || (f.status || "ativo").toLowerCase() === status;
      return matchSearch && matchStatus;
    });
    setFiltered(filteredList);
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters(fornecedores, value, statusFilter);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    applyFilters(fornecedores, searchTerm, status);
  };

  const formatCnpj = (value: string) => {
    if (!value) return "";
    const clean = value.replace(/\D/g, "");
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  const handleOpenModal = (forn?: Fornecedor) => {
    if (forn) {
      setCurrentFornecedor(forn);
      setIsEditing(true);
    } else {
      setCurrentFornecedor({ status: "ativo" });
      setIsEditing(false);
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await suppliersApi.update(currentFornecedor.cnpj!, currentFornecedor);
        success("Fornecedor atualizado com sucesso");
      } else {
        await suppliersApi.create(currentFornecedor);
        success("Fornecedor cadastrado com sucesso");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      error((err as Error).message || "Erro ao salvar fornecedor");
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await suppliersApi.delete(toDelete);
      success("Fornecedor removido com sucesso");
      fetchData();
    } catch (err) {
      error((err as Error).message || "Erro ao remover fornecedor");
    }
  };

  const columns = [
    {
      key: "cnpj",
      header: "CNPJ",
      sortable: true,
      render: (f: Fornecedor) => <span style={{ fontFamily: "monospace", fontSize: "13px" }}>{formatCnpj(f.cnpj)}</span>
    },
    {
      key: "nome",
      header: "Nome Fantasia",
      sortable: true,
      render: (f: Fornecedor) => (
        <div>
          <div style={{ fontWeight: 600 }}>{f.nome}</div>
          {f.tipo && <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{f.tipo}</div>}
        </div>
      )
    },
    {
      key: "contato",
      header: "Contato",
      render: (f: Fornecedor) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {f.email && <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}><FiMail size={12} /> {f.email}</div>}
          {f.telefone1 && <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}><FiPhone size={12} /> {f.telefone1}</div>}
        </div>
      )
    },
    {
      key: "local",
      header: "Localidade",
      render: (f: Fornecedor) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <FiMapPin size={14} color="var(--text-muted)" />
          {f.cidade ? `${f.cidade}-${f.estado}` : "Não informado"}
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (f: Fornecedor) => (
        <Badge variant={f.status === "ativo" ? "green" : "red"}>
          {f.status}
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Ações",
      render: (f: Fornecedor) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => handleOpenModal(f)}>
            <FiEdit2 size={14} /> Editar
          </button>
          <button className="btn btn-ghost btn-sm" style={{ color: "var(--red-400)" }} onClick={() => { setToDelete(f.cnpj); setConfirmOpen(true); }}>
            <FiTrash2 size={14} /> Excluir
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <PageHeader 
        title="Fornecedores" 
        subtitle="Gerencie seus parceiros e distribuidores de insumos."
        action={
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <FiPlus size={16} /> Novo Fornecedor
          </button>
        }
      />

      <div className="card">
        <div style={{ marginBottom: "20px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1 1 300px" }}>
            <SearchInput placeholder="Buscar por nome, CNPJ ou email..." onSearch={handleSearch} />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            style={{ 
              padding: "10px", 
              borderRadius: "8px", 
              border: "1px solid var(--border)", 
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
              outline: "none"
            }}
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>

        <DataTable 
          data={filtered} 
          columns={columns} 
          keyExtractor={(f) => f.cnpj} 
          isLoading={loading}
          itemsPerPage={8}
          emptyMessage="Nenhum fornecedor encontrado."
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? "Editar Fornecedor" : "Novo Fornecedor"}
        width="lg"
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="grid-2">
            <FormField
              label="CNPJ"
              required
              disabled={isEditing}
              value={currentFornecedor.cnpj || ""}
              onChange={(e) => setCurrentFornecedor({ ...currentFornecedor, cnpj: e.target.value })}
              placeholder="00.000.000/0000-00"
            />
            <FormField
              label="Nome Fantasia"
              required
              value={currentFornecedor.nome || ""}
              onChange={(e) => setCurrentFornecedor({ ...currentFornecedor, nome: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <FormField
              label="Razão Social"
              value={currentFornecedor.razao_social || ""}
              onChange={(e) => setCurrentFornecedor({ ...currentFornecedor, razao_social: e.target.value })}
            />
            <FormField
              label="Tipo de Fornecedor"
              as="select"
              value={currentFornecedor.tipo || ""}
              onChange={(e) => setCurrentFornecedor({ ...currentFornecedor, tipo: e.target.value })}
              options={[
                { value: "", label: "Selecione..." },
                { value: "Sementes", label: "Sementes" },
                { value: "Fertilizantes", label: "Fertilizantes" },
                { value: "Ferramentas", label: "Ferramentas" },
                { value: "Serviços", label: "Serviços" },
              ]}
            />
          </div>

          <div className="grid-2">
            <FormField
              label="Email"
              type="email"
              value={currentFornecedor.email || ""}
              onChange={(e) => setCurrentFornecedor({ ...currentFornecedor, email: e.target.value })}
            />
            <FormField
              label="Telefone Principal"
              value={currentFornecedor.telefone1 || ""}
              onChange={(e) => setCurrentFornecedor({ ...currentFornecedor, telefone1: e.target.value })}
            />
          </div>

          <div className="grid-3">
            <FormField
              label="Cidade"
              value={currentFornecedor.cidade || ""}
              onChange={(e) => setCurrentFornecedor({ ...currentFornecedor, cidade: e.target.value })}
            />
            <FormField
              label="Estado (UF)"
              value={currentFornecedor.estado || ""}
              onChange={(e) => setCurrentFornecedor({ ...currentFornecedor, estado: e.target.value })}
            />
            <FormField
              label="Status"
              as="select"
              value={currentFornecedor.status || "ativo"}
              onChange={(e) => setCurrentFornecedor({ ...currentFornecedor, status: e.target.value })}
              options={[
                { value: "ativo", label: "Ativo" },
                { value: "inativo", label: "Inativo" },
              ]}
            />
          </div>

          <FormField
            label="Informações Adicionais"
            as="textarea"
            value={currentFornecedor.inf_adicionais || ""}
            onChange={(e) => setCurrentFornecedor({ ...currentFornecedor, inf_adicionais: e.target.value })}
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
        title="Remover Fornecedor"
        message="Tem certeza que deseja remover este fornecedor? Esta ação não pode ser desfeita e pode afetar insumos vinculados."
        confirmText="Remover"
      />
    </div>
  );
}
