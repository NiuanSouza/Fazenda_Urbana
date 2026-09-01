"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FiAlertCircle, FiInfo, FiCheckCircle } from "react-icons/fi";
import { notificationsApi } from "../../../lib/api";
import { Notificacao } from "../../../types";
import { PageHeader } from "../../../components/ui/PageHeader";
import { SkeletonLoader } from "../../../components/ui/SkeletonLoader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useToast } from "../../../components/ui/Toast";

export default function Notificacoes() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todas");
  const { success, error } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      await notificationsApi.sync();
      const data = await notificationsApi.list();
      setNotificacoes(data);
    } catch (err) {
      error((err as Error).message || "Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleAction = async (id: number, acao: string) => {
    try {
      await notificationsApi.executeAction(id);
      success("Ação executada com sucesso!");
      if (acao === "SOLICITAR_COMPRA") {
        router.push("/fornecedores");
      } else {
        fetchData();
      }
    } catch (err) {
      error("Erro ao executar ação");
    }
  };

  const handleIgnore = async (id: number) => {
    try {
      await notificationsApi.updateStatus(id, "ignorada");
      success("Notificação ignorada.");
      fetchData();
    } catch (err) {
      error("Erro ao ignorar notificação");
    }
  };

  const renderActionButtons = (n: Notificacao) => {
    if (!n.acao_requerida) return null;

    switch (n.acao_requerida) {
      case "DESCARTAR_INSUMO":
      case "DESCARTAR_LOTE":
        return (
          <>
            <button className="btn btn-danger" onClick={() => handleAction(n.id, n.acao_requerida!)}>
              Descartar
            </button>
            <button className="btn btn-ghost" onClick={() => handleIgnore(n.id)}>Ignorar</button>
          </>
        );
      case "SOLICITAR_COMPRA":
        return (
          <>
            <button className="btn btn-primary" onClick={() => handleAction(n.id, n.acao_requerida!)}>
              Comprar / Solicitar
            </button>
            <button className="btn btn-ghost" onClick={() => handleIgnore(n.id)}>Ignorar</button>
          </>
        );
      case "MARCAR_VENCIDO":
      case "MARCAR_VENCIDO_LOTE":
        return (
          <>
            <button className="btn btn-primary" onClick={() => handleAction(n.id, n.acao_requerida!)}>
              Marcar como Vencido
            </button>
            <button className="btn btn-ghost" onClick={() => handleIgnore(n.id)}>Ignorar</button>
          </>
        );
      case "CONCLUIR_PRODUCAO":
        return (
          <>
            <button className="btn btn-primary" onClick={() => handleAction(n.id, n.acao_requerida!)}>
              Concluir Produção
            </button>
            <button className="btn btn-ghost" onClick={() => handleIgnore(n.id)}>Ignorar</button>
          </>
        );
      default:
        return (
          <button className="btn btn-ghost" onClick={() => handleIgnore(n.id)}>Marcar como lida</button>
        );
    }
  };

  const filteredNotificacoes = notificacoes.filter(n => {
    if (filter === "todas") return true;
    if (filter === "critico" && n.tipo === "critico") return true;
    if (filter === "alerta" && n.tipo === "alerta") return true;
    return false;
  });

  const getIcon = (tipo: string) => {
    if (tipo === "critico") {
      return <FiAlertCircle size={20} color="var(--red-400)" />;
    }
    if (tipo === "alerta") {
      return <FiAlertCircle size={20} color="var(--yellow-600)" />;
    }
    return <FiInfo size={20} color="var(--blue-400)" />;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <PageHeader 
        title="Notificações e Alertas" 
        subtitle="Fique por dentro do que acontece na sua fazenda e tome ações rápidas."
      />

      <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
        <button 
          className={`btn ${filter === "todas" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setFilter("todas")}
        >
          Todas
        </button>
        <button 
          className={`btn ${filter === "critico" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setFilter("critico")}
        >
          Críticas
        </button>
        <button 
          className={`btn ${filter === "alerta" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setFilter("alerta")}
        >
          Alertas
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {loading ? (
          <>
            <SkeletonLoader height="120px" />
            <SkeletonLoader height="120px" />
          </>
        ) : filteredNotificacoes.length > 0 ? (
          filteredNotificacoes.map((n) => (
            <div key={n.id} className="card" style={{ display: "flex", alignItems: "flex-start", gap: "16px", padding: "20px" }}>
              <div style={{ 
                width: "48px", height: "48px", borderRadius: "50%", 
                background: n.tipo === "critico" ? "var(--red-bg)" : n.tipo === "alerta" ? "var(--yellow-bg)" : "var(--blue-bg)", 
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                {getIcon(n.tipo)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <h4 style={{ fontWeight: 600, fontSize: "16px", color: "var(--text-primary)" }}>{n.titulo}</h4>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", background: "var(--bg-hover)", padding: "2px 8px", borderRadius: "4px" }}>
                    {n.data_criacao.substring(0, 10)}
                  </span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5", marginBottom: "16px" }}>
                  {n.mensagem}
                </p>
                <div style={{ display: "flex", gap: "12px" }}>
                  {renderActionButtons(n)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState 
            icon={<FiCheckCircle />}
            title="Tudo tranquilo por aqui!"
            description="Você não tem notificações pendentes. Ótimo trabalho!"
          />
        )}
      </div>
    </div>
  );
}
