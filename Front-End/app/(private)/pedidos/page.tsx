"use client";
import React, { useEffect, useState, useCallback } from "react";
import { FiPlus, FiEye, FiCheckCircle, FiXCircle, FiClock, FiTrash2 } from "react-icons/fi";
import { salesApi, customersApi, batchesApi } from "../../../lib/api";
import { Venda, Cliente, Lote, ItemVenda } from "../../../types";
import { PageHeader } from "../../../components/ui/PageHeader";
import { SearchInput } from "../../../components/ui/SearchInput";
import { DataTable } from "../../../components/ui/DataTable";
import { Modal } from "../../../components/ui/Modal";
import { FormField } from "../../../components/ui/FormField";
import { useToast } from "../../../components/ui/Toast";
import { Badge, BadgeVariant } from "../../../components/ui/Badge";

export default function Pedidos() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [filtered, setFiltered] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVenda, setCurrentVenda] = useState<Partial<Venda>>({ itens: [] });
  const [newItem, setNewItem] = useState<Partial<ItemVenda>>({ quantidade: 1, valor_total: 0 });
  
  const { success, error } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [vendasData, clientesData, lotesData] = await Promise.all([
        salesApi.list(),
        customersApi.list(),
        batchesApi.list()
      ]);
      setVendas(vendasData);
      setFiltered(vendasData);
      setClientes(clientesData);
      setLotes(lotesData);
    } catch (err) {
      error((err as Error).message || "Erro ao carregar dados de vendas");
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
    const filtered = vendas.filter(
      (v) =>
        v.numero.toLowerCase().includes(term) ||
        (v.cliente_nome && v.cliente_nome.toLowerCase().includes(term)) ||
        v.status.toLowerCase().includes(term)
    );
    setFiltered(filtered);
  };

  const calculateTotal = (itens: ItemVenda[]) => {
    return itens.reduce((acc, item) => acc + Number(item.valor_total), 0);
  };

  const handleOpenModal = (venda?: Venda) => {
    if (venda) {
      setCurrentVenda(venda);
      setIsEditing(true);
    } else {
      setCurrentVenda({ 
        numero: `PED-${Math.floor(Math.random() * 10000)}`, 
        status: "Em andamento",
        itens: []
      });
      setNewItem({ quantidade: 1, valor_total: 0 });
      setIsEditing(false);
    }
    setModalOpen(true);
  };

  const handleAddItem = () => {
    if (!newItem.lote_id || !newItem.quantidade || !newItem.valor_total) {
      error("Preencha todos os campos do item");
      return;
    }
    const lote = lotes.find(l => l.id === Number(newItem.lote_id));
    if (!lote) return;

    if (newItem.quantidade > lote.quantidade) {
      error(`Quantidade solicitada excede o estoque disponível (${lote.quantidade})`);
      return;
    }

    const item: ItemVenda = {
      id: Math.random(), // Temporary ID for UI
      lote_id: Number(newItem.lote_id),
      quantidade: Number(newItem.quantidade),
      valor_total: Number(newItem.valor_total)
    };

    setCurrentVenda({
      ...currentVenda,
      itens: [...(currentVenda.itens || []), item]
    });
    setNewItem({ quantidade: 1, valor_total: 0 });
  };

  const handleRemoveItem = (index: number) => {
    const newItens = [...(currentVenda.itens || [])];
    newItens.splice(index, 1);
    setCurrentVenda({ ...currentVenda, itens: newItens });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVenda.cliente_id) {
      error("Selecione um cliente");
      return;
    }
    if (!currentVenda.itens || currentVenda.itens.length === 0) {
      error("Adicione pelo menos um item ao pedido");
      return;
    }

    try {
      if (isEditing) {
        await salesApi.update(currentVenda.id!, { status: currentVenda.status });
        success("Status do pedido atualizado");
      } else {
        await salesApi.create({
          numero: currentVenda.numero,
          cliente_id: currentVenda.cliente_id,
          status: currentVenda.status,
          info_adicionais: currentVenda.info_adicionais,
          itens: currentVenda.itens.map(i => ({
            lote_id: i.lote_id,
            quantidade: i.quantidade,
            valor_total: i.valor_total
          }))
        });
        success("Pedido cadastrado com sucesso");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      error((err as Error).message || "Erro ao salvar pedido");
    }
  };

  const getStatusBadge = (status: string) => {
    let variant: BadgeVariant = "gray";
    let icon = null;

    switch (status.toLowerCase()) {
      case "em andamento":
        variant = "blue";
        icon = <FiClock />;
        break;
      case "entregue":
        variant = "green";
        icon = <FiCheckCircle />;
        break;
      case "cancelado":
        variant = "red";
        icon = <FiXCircle />;
        break;
    }

    return <Badge variant={variant} icon={icon}>{status}</Badge>;
  };

  const columns = [
    {
      key: "numero",
      header: "Pedido",
      sortable: true,
      render: (v: Venda) => <span style={{ fontWeight: 600 }}>{v.numero}</span>
    },
    {
      key: "cliente",
      header: "Cliente",
      sortable: true,
      render: (v: Venda) => v.cliente_nome || "Desconhecido"
    },
    {
      key: "itens",
      header: "Itens",
      render: (v: Venda) => (
        <span style={{ color: "var(--text-muted)" }}>
          {v.itens?.length || 0} {(v.itens?.length || 0) === 1 ? 'item' : 'itens'}
        </span>
      )
    },
    {
      key: "valor",
      header: "Valor Total",
      render: (v: Venda) => (
        <span style={{ fontWeight: 600, color: "var(--green-400)" }}>
          R$ {calculateTotal(v.itens).toFixed(2)}
        </span>
      )
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (v: Venda) => getStatusBadge(v.status)
    },
    {
      key: "actions",
      header: "Ações",
      render: (v: Venda) => (
        <button className="btn btn-ghost btn-sm" onClick={() => handleOpenModal(v)}>
          <FiEye size={14} /> Ver Detalhes
        </button>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <PageHeader 
        title="Pedidos de Venda" 
        subtitle="Gerencie as vendas, expedição e faturamento da produção."
        action={
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <FiPlus size={16} /> Novo Pedido
          </button>
        }
      />

      <div className="card">
        <div style={{ marginBottom: "20px" }}>
          <SearchInput placeholder="Buscar por número ou cliente..." onSearch={handleSearch} />
        </div>

        <DataTable 
          data={filtered} 
          columns={columns} 
          keyExtractor={(v) => v.id} 
          isLoading={loading}
          itemsPerPage={8}
          emptyMessage="Nenhum pedido encontrado."
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? `Detalhes do Pedido ${currentVenda.numero}` : "Novo Pedido de Venda"}
        width="lg"
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Header Info */}
          <div className="grid-2">
            <FormField
              label="Número do Pedido"
              disabled
              value={currentVenda.numero || ""}
            />
            <FormField
              label="Status"
              as="select"
              value={currentVenda.status || "Em andamento"}
              onChange={(e) => setCurrentVenda({ ...currentVenda, status: e.target.value })}
              options={[
                { value: "Em andamento", label: "Em andamento" },
                { value: "Entregue", label: "Entregue" },
                { value: "Cancelado", label: "Cancelado" },
              ]}
            />
          </div>

          <FormField
            label="Cliente"
            as="select"
            disabled={isEditing}
            required
            value={currentVenda.cliente_id || ""}
            onChange={(e) => setCurrentVenda({ ...currentVenda, cliente_id: Number(e.target.value) })}
            options={[
              { value: "", label: "Selecione o cliente..." },
              ...clientes.map(c => ({ value: c.id, label: c.nome }))
            ]}
          />

          {/* Items Section */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>Itens do Pedido</h3>
            
            {/* Table of current items */}
            {currentVenda.itens && currentVenda.itens.length > 0 ? (
              <div className="table-wrapper" style={{ marginBottom: "16px" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Produto/Lote</th>
                      <th>Quantidade</th>
                      <th>Valor (R$)</th>
                      {!isEditing && <th>Ações</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {currentVenda.itens.map((item, idx) => {
                      const lote = lotes.find(l => l.id === item.lote_id);
                      return (
                        <tr key={idx}>
                          <td>{lote ? `${lote.produto_nome} (Lote #${lote.id})` : `Lote #${item.lote_id}`}</td>
                          <td>{item.quantidade}</td>
                          <td>R$ {Number(item.valor_total).toFixed(2)}</td>
                          {!isEditing && (
                            <td>
                              <button type="button" className="btn btn-ghost btn-xs" style={{ color: "var(--red-400)" }} onClick={() => handleRemoveItem(idx)}>
                                <FiTrash2 />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2} style={{ textAlign: "right", fontWeight: 600, padding: "12px 16px" }}>Total do Pedido:</td>
                      <td colSpan={isEditing ? 1 : 2} style={{ fontWeight: 700, color: "var(--green-400)", padding: "12px 16px" }}>
                        R$ {calculateTotal(currentVenda.itens).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "32px 16px", marginBottom: "16px" }}>
                Nenhum item adicionado ao pedido.
              </div>
            )}

            {/* Add new item form (only when creating) */}
            {!isEditing && (
              <div style={{ background: "var(--bg-card)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", color: "var(--text-secondary)" }}>Adicionar Produto</h4>
                <div className="grid-3" style={{ alignItems: "end" }}>
                  <FormField
                    label="Lote Disponível"
                    as="select"
                    value={newItem.lote_id || ""}
                    onChange={(e) => setNewItem({ ...newItem, lote_id: Number(e.target.value) })}
                    options={[
                      { value: "", label: "Selecione o lote..." },
                      ...lotes.filter(l => l.status === "disponível" && l.quantidade > 0).map(l => ({ value: l.id, label: `${l.produto_nome} (Lote #${l.id}) - Qtd: ${l.quantidade}` }))
                    ]}
                  />
                  <FormField
                    label="Quantidade"
                    type="number"
                    min="1"
                    value={newItem.quantidade || ""}
                    onChange={(e) => setNewItem({ ...newItem, quantidade: Number(e.target.value) })}
                  />
                  <FormField
                    label="Valor Total (R$)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.valor_total || ""}
                    onChange={(e) => setNewItem({ ...newItem, valor_total: Number(e.target.value) })}
                  />
                </div>
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: "12px" }} onClick={handleAddItem}>
                  <FiPlus /> Adicionar Item
                </button>
              </div>
            )}
          </div>

          <FormField
            label="Observações"
            as="textarea"
            disabled={isEditing}
            value={currentVenda.info_adicionais || ""}
            onChange={(e) => setCurrentVenda({ ...currentVenda, info_adicionais: e.target.value })}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Fechar
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? "Atualizar Status" : "Criar Pedido"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
