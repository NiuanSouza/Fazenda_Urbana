"use client";
import React, { useEffect, useState, useCallback } from "react";
import { 
  FiActivity, 
  FiDollarSign, 
  FiAlertTriangle,
  FiDroplet,
  FiSun
} from "react-icons/fi";
import { dashboardApi } from "../../../lib/api";
import { DashboardStats } from "../../../types";
import { PageHeader } from "../../../components/ui/PageHeader";
import { StatsCard } from "../../../components/ui/StatsCard";
import { AreaChart, BarChart, PieChart } from "../../../components/ui/Chart";
import { SkeletonLoader } from "../../../components/ui/SkeletonLoader";
import { useToast } from "../../../components/ui/Toast";
import { Badge } from "../../../components/ui/Badge";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.stats();
      setStats(data);
    } catch (err) {
      error((err as Error).message || "Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [fetchStats]);

  if (loading || !stats) {
    return (
      <div>
        <PageHeader title="Painel de Controle" subtitle="Carregando dados da fazenda..." />
        <div className="grid-4" style={{ marginBottom: "24px" }}>
          {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} height="120px" />)}
        </div>
        <div className="grid-2" style={{ marginBottom: "24px" }}>
          <SkeletonLoader height="360px" />
          <SkeletonLoader height="360px" />
        </div>
      </div>
    );
  }

  // Format pie chart data
  const pieData = Object.entries(stats.producoes_por_status).map(([key, value]) => ({
    name: key,
    value: value
  }));

  // Estrutura básica para diferentes dashboards:
  // TODO: Obter role do usuário logado via Context/API (ex: 'admin', 'operador')
  const userRole: string = "admin"; // Mock temporário

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <PageHeader 
        title={`Painel de Controle - Visão ${userRole === 'admin' ? 'Administrativa' : 'Operacional'}`} 
        subtitle="Visão geral e inteligência da sua produção agrícola" 
      />

      {userRole === "operador" && (
        <div className="card" style={{ background: "var(--yellow-bg)", border: "1px solid var(--yellow-border)", color: "var(--yellow)", padding: "12px", borderRadius: "8px" }}>
           <strong>Modo Operador:</strong> Funcionalidades financeiras estão restritas nesta visualização.
        </div>
      )}

      {/* Row 1: Quick Stats */}
      <div className="grid-4">
        <StatsCard 
          title="Produções Ativas" 
          value={stats.total_producoes_ativas} 
          icon={<FiActivity />} 
          highlightColor="green"
        />
        <StatsCard 
          title="Receita (Mês)" 
          value={`R$ ${stats.vendas_mensal.length > 0 ? stats.vendas_mensal[stats.vendas_mensal.length - 1].valor.toFixed(2) : '0.00'}`} 
          icon={<FiDollarSign />} 
          highlightColor="blue"
        />
        <StatsCard 
          title="Consumo de Água (Hoje)" 
          value={`${stats.irrigacao.volume_hoje_litros} L`} 
          icon={<FiDroplet />} 
          highlightColor="blue"
        />
        <StatsCard 
          title="Alertas Críticos" 
          value={stats.alertas_criticos} 
          icon={<FiAlertTriangle />} 
          highlightColor={stats.alertas_criticos > 0 ? "red" : "gray"}
        />
      </div>

      {/* Row 2: Main Charts */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px" }}>Produção Mensal (Inícios)</h3>
          <AreaChart data={stats.producao_mensal} dataKey="count" xAxisKey="mes" />
        </div>
        <div className="card">
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px" }}>Receita Mensal</h3>
          <BarChart data={stats.vendas_mensal} />
        </div>
      </div>

      {/* Row 3: Summaries & Sensors */}
      <div className="grid-3">
        <div className="card">
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px" }}>Status das Produções</h3>
          <PieChart data={pieData} height={250} />
        </div>

        <div className="card">
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px" }}>Top Produtos em Estoque</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {stats.top_produtos.length > 0 ? (
              stats.top_produtos.map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: i < stats.top_produtos.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ fontWeight: 500 }}>{p.nome}</span>
                  <Badge variant="blue">{p.quantidade} un</Badge>
                </div>
              ))
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>Nenhum produto em estoque.</span>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px" }}>Infraestrutura IoT</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-hover)", color: "var(--green-400)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FiActivity />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 500 }}>Sensores Conectados</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{stats.sensores.online} de {stats.sensores.total} online</div>
                </div>
              </div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--blue-bg)", color: "var(--blue-400)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FiDroplet />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 500 }}>Zonas de Irrigação</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{stats.irrigacao.total_zonas} áreas controladas</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--yellow-bg)", color: "var(--yellow-400)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FiSun />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 500 }}>Geração Solar Hoje</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{stats.energia.geracao_solar_hoje_kwh} kWh</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
