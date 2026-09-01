"use client";
import React, { useEffect, useState, useCallback } from "react";
import { FiUserCheck, FiUserX, FiShield, FiUser } from "react-icons/fi";
import { usersApi } from "../../../lib/api";
import { UsuarioResponse } from "../../../types";
import { PageHeader } from "../../../components/ui/PageHeader";
import { SearchInput } from "../../../components/ui/SearchInput";
import { DataTable } from "../../../components/ui/DataTable";
import { useToast } from "../../../components/ui/Toast";
import { Badge } from "../../../components/ui/Badge";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [filtered, setFiltered] = useState<UsuarioResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { success, error } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersApi.list();
      setUsuarios(data);
      applyFilters(data, searchTerm, statusFilter);
    } catch (err) {
      error((err as Error).message || "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, [error, searchTerm, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const applyFilters = (list: UsuarioResponse[], search: string, status: string) => {
    const term = search.toLowerCase();
    const filteredList = list.filter((u) => {
      const matchSearch = 
        u.nome.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.id_usuario.toLowerCase().includes(term);
        
      const matchStatus = status === "todos" || u.status.toLowerCase() === status;
      return matchSearch && matchStatus;
    });
    setFiltered(filteredList);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters(usuarios, value, statusFilter);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    applyFilters(usuarios, searchTerm, status);
  };

  const toggleStatus = async (user: UsuarioResponse) => {
    const newStatus = user.status === "ativo" ? "inativo" : "ativo";
    try {
      await usersApi.updateStatus(user.id_usuario, newStatus);
      success(`Usuário ${user.nome} marcado como ${newStatus}`);
      fetchData();
    } catch (err) {
      error((err as Error).message || "Erro ao alterar status do usuário");
    }
  };

  const columns = [
    {
      key: "nome",
      header: "Usuário",
      sortable: true,
      render: (u: UsuarioResponse) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "var(--bg-hover)", color: "var(--green-400)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "14px", flexShrink: 0
          }}>
            {u.nome.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{u.nome}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{u.email}</div>
          </div>
        </div>
      )
    },
    {
      key: "id_usuario",
      header: "ID Acesso",
      render: (u: UsuarioResponse) => <span style={{ fontFamily: "monospace", fontSize: "13px" }}>{u.id_usuario}</span>
    },
    {
      key: "role",
      header: "Nível de Acesso",
      render: (u: UsuarioResponse) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {u.is_admin ? <FiShield color="var(--green-500)" /> : <FiUser color="var(--blue-500)" />}
          {u.is_admin ? "Administrador" : "Técnico / Operador"}
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (u: UsuarioResponse) => (
        <Badge variant={u.status === "ativo" ? "green" : "red"}>
          {u.status}
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Controle de Acesso",
      render: (u: UsuarioResponse) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button 
            className="btn btn-ghost btn-sm" 
            style={{ color: u.status === "ativo" ? "var(--red-400)" : "var(--green-500)" }} 
            onClick={() => toggleStatus(u)}
          >
            {u.status === "ativo" ? <><FiUserX size={14} /> Inativar Acesso</> : <><FiUserCheck size={14} /> Reativar Acesso</>}
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <PageHeader 
        title="Gestão de Usuários" 
        subtitle="Controle o acesso de administradores e técnicos do sistema."
      />

      <div className="card">
        <div style={{ marginBottom: "20px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1 1 300px" }}>
            <SearchInput placeholder="Buscar por nome, email ou ID..." onSearch={handleSearch} />
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
          keyExtractor={(u) => u.id_usuario} 
          isLoading={loading}
          itemsPerPage={10}
          emptyMessage="Nenhum usuário encontrado."
        />
      </div>
    </div>
  );
}
