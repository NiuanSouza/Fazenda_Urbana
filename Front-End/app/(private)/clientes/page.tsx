"use client";
import React, { useEffect, useState, useCallback } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiMail, FiPhone } from "react-icons/fi";
import { customersApi } from "../../../lib/api";
import { Cliente } from "../../../types";
import { PageHeader } from "../../../components/ui/PageHeader";
import { SearchInput } from "../../../components/ui/SearchInput";
import { DataTable } from "../../../components/ui/DataTable";
import { Modal } from "../../../components/ui/Modal";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { FormField } from "../../../components/ui/FormField";
import { useToast } from "../../../components/ui/Toast";
import { Badge } from "../../../components/ui/Badge";

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtered, setFiltered] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [currentCliente, setCurrentCliente] = useState<Partial<Cliente>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [toDelete, setToDelete] = useState<number | null>(null);
  
  const { success, error } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await customersApi.list();
      setClientes(data);
      setFiltered(data);
    } catch (err) {
      error((err as Error).message || "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const applyFilters = useCallback((clientesList: Cliente[], search: string, status: string) => {
    const term = search.toLowerCase();
    const filteredList = clientesList.filter((c) => {
      const matchSearch = 
        c.nome.toLowerCase().includes(term) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.cpf && c.cpf.includes(term)) ||
        (c.cnpj && c.cnpj.includes(term));
      
      const matchStatus = status === "todos" || c.status.toLowerCase() === status;
      return matchSearch && matchStatus;
    });
    setFiltered(filteredList);
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters(clientes, value, statusFilter);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    applyFilters(clientes, searchTerm, status);
  };

  const formatCpfCnpj = (value: string, isCpf: boolean) => {
    if (!value) return "";
    const clean = value.replace(/\D/g, "");
    if (isCpf) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
  };

  const handleOpenModal = (cliente?: Cliente) => {
    if (cliente) {
      setCurrentCliente(cliente);
      setIsEditing(true);
    } else {
      setCurrentCliente({ status: "ativo", tipo: "Físico" });
      setIsEditing(false);
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await customersApi.update(currentCliente.id!, currentCliente);
        success("Cliente atualizado com sucesso");
      } else {
        await customersApi.create(currentCliente);
        success("Cliente cadastrado com sucesso");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      error((err as Error).message || "Erro ao salvar cliente");
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await customersApi.delete(toDelete);
      success("Cliente removido com sucesso");
      fetchData();
    } catch (err) {
      error((err as Error).message || "Erro ao remover cliente");
    }
  };

  const columns = [
    {
      key: "nome",
      header: "Cliente",
      sortable: true,
      render: (c: Cliente) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "var(--bg-hover)", color: "var(--green-400)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "14px", flexShrink: 0
          }}>
            {c.nome.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{c.nome}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>
              {c.tipo === "Físico" ? `CPF: ${formatCpfCnpj(c.cpf || "", true)}` : `CNPJ: ${formatCpfCnpj(c.cnpj || "", false)}`}
            </div>
          </div>
        </div>
      )
    },
    {
      key: "contato",
      header: "Contato",
      render: (c: Cliente) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {c.email && <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}><FiMail size={12} /> {c.email}</div>}
          {c.telefone1 && <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}><FiPhone size={12} /> {c.telefone1}</div>}
        </div>
      )
    },
    {
      key: "local",
      header: "Localidade",
      render: (c: Cliente) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <FiMapPin size={14} color="var(--text-muted)" />
          {c.cidade ? `${c.cidade}-${c.estado}` : "Não informado"}
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (c: Cliente) => (
        <Badge variant={c.status === "ativo" ? "green" : "red"}>
          {c.status}
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Ações",
      render: (c: Cliente) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => handleOpenModal(c)}>
            <FiEdit2 size={14} /> Editar
          </button>
          <button className="btn btn-ghost btn-sm" style={{ color: "var(--red-400)" }} onClick={() => { setToDelete(c.id); setConfirmOpen(true); }}>
            <FiTrash2 size={14} /> Excluir
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <PageHeader 
        title="Clientes" 
        subtitle="Gerencie compradores (restaurantes, mercados e consumidores finais)."
        action={
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <FiPlus size={16} /> Novo Cliente
          </button>
        }
      />

      <div className="card">
        <div style={{ marginBottom: "20px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1 1 300px" }}>
            <SearchInput placeholder="Buscar por nome, CPF/CNPJ ou email..." onSearch={handleSearch} />
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
          keyExtractor={(c) => c.id} 
          isLoading={loading}
          itemsPerPage={8}
          emptyMessage="Nenhum cliente encontrado."
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? "Editar Cliente" : "Novo Cliente"}
        width="md"
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <FormField
            label="Nome Completo / Razão Social"
            required
            value={currentCliente.nome || ""}
            onChange={(e) => setCurrentCliente({ ...currentCliente, nome: e.target.value })}
          />

          <div className="grid-2">
            <FormField
              label="Tipo Pessoa"
              as="select"
              value={currentCliente.tipo || "Físico"}
              onChange={(e) => setCurrentCliente({ ...currentCliente, tipo: e.target.value, cpf: "", cnpj: "" })}
              options={[
                { value: "Físico", label: "Pessoa Física (PF)" },
                { value: "Jurídico", label: "Pessoa Jurídica (PJ)" },
              ]}
            />
            {currentCliente.tipo === "Físico" ? (
              <FormField
                label="CPF"
                required
                value={currentCliente.cpf || ""}
                onChange={(e) => setCurrentCliente({ ...currentCliente, cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            ) : (
              <FormField
                label="CNPJ"
                required
                value={currentCliente.cnpj || ""}
                onChange={(e) => setCurrentCliente({ ...currentCliente, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            )}
          </div>

          <div className="grid-2">
            <FormField
              label="Email"
              type="email"
              value={currentCliente.email || ""}
              onChange={(e) => setCurrentCliente({ ...currentCliente, email: e.target.value })}
            />
            <FormField
              label="Telefone Principal"
              value={currentCliente.telefone1 || ""}
              onChange={(e) => setCurrentCliente({ ...currentCliente, telefone1: e.target.value })}
            />
          </div>

          <div className="grid-3">
            <FormField
              label="Cidade"
              value={currentCliente.cidade || ""}
              onChange={(e) => setCurrentCliente({ ...currentCliente, cidade: e.target.value })}
            />
            <FormField
              label="Estado (UF)"
              value={currentCliente.estado || ""}
              onChange={(e) => setCurrentCliente({ ...currentCliente, estado: e.target.value })}
            />
            <FormField
              label="Status"
              as="select"
              value={currentCliente.status || "ativo"}
              onChange={(e) => setCurrentCliente({ ...currentCliente, status: e.target.value })}
              options={[
                { value: "ativo", label: "Ativo" },
                { value: "inativo", label: "Inativo" },
              ]}
            />
          </div>

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
        title="Remover Cliente"
        message="Tem certeza que deseja remover este cliente? Se ele possui vendas registradas, a remoção pode não ser permitida pelo sistema."
        confirmText="Remover"
      />
    </div>
  );
}
