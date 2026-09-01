"use client";
import React, { useEffect, useState } from "react";
import { FiActivity, FiThermometer, FiDroplet, FiSun, FiWind } from "react-icons/fi";
import { PageHeader } from "../../../../components/ui/PageHeader";
import { sensorsApi, productionApi, analyticsApi } from "../../../../lib/api";
import { Sensor, Producao } from "../../../../types";

export default function TecnicoDashboard() {
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      sensorsApi.list(),
      productionApi.list(),
      analyticsApi.anomalies()
    ])
    .then(([sensorsData, prodData, anomaliesData]) => {
      setSensores(sensorsData);
      setProducoes(prodData.filter(p => p.status === "Ativa"));
      setAnomalies(anomaliesData.anomalies || []);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const getSensorIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'temperatura': return <FiThermometer size={24} color="var(--red-500)" />;
      case 'umidade': return <FiDroplet size={24} color="var(--blue-500)" />;
      case 'luminosidade': return <FiSun size={24} color="var(--yellow-500)" />;
      default: return <FiWind size={24} color="var(--green-500)" />;
    }
  };

  if (loading) return <div>Carregando painel do técnico...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <PageHeader 
        title="Painel Operacional (Técnico)" 
        subtitle="Monitoramento de estufas, sensores e produções ativas em tempo real."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
        {sensores.map(sensor => (
          <div key={sensor.id} className="card" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ padding: "12px", backgroundColor: "var(--bg-secondary)", borderRadius: "12px" }}>
              {getSensorIcon(sensor.tipo)}
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>{sensor.nome}</div>
              <div style={{ fontSize: "24px", fontWeight: 700 }}>
                {sensor.ultima_leitura ? sensor.ultima_leitura.toFixed(1) : "--"} {sensor.unidade}
              </div>
              <div style={{ fontSize: "12px", color: sensor.status === 'online' ? "var(--green-500)" : "var(--red-500)" }}>
                {sensor.status.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: "16px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <FiActivity color="var(--green-500)" />
          Produções Ativas
        </h3>
        {producoes.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Nenhuma produção ativa no momento.</p>
        ) : (
          <table className="table" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px" }}>Produto</th>
                <th style={{ padding: "12px" }}>Início</th>
                <th style={{ padding: "12px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {producoes.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px", fontWeight: 500 }}>{p.produto_nome}</td>
                  <td style={{ padding: "12px" }}>{new Date(p.data_inicio).toLocaleDateString()}</td>
                  <td style={{ padding: "12px" }}>
                    <span className="badge badge-green">{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Seção de Anomalias IoT (Pandas Z-Score) */}
      <div className="card" style={{ marginTop: "16px", borderLeft: "4px solid var(--red-500)" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: "var(--red-600)" }}>
          <FiActivity />
          Anomalias Detectadas (IoT Analytics)
        </h3>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
          O motor de inteligência identificou comportamentos atípicos (Z-Score &gt; 2.5) com base no histórico de variação dos sensores nas últimas semanas.
        </p>

        {anomalies.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", background: "var(--bg-secondary)", borderRadius: "8px", color: "var(--text-muted)" }}>
            Nenhuma anomalia crítica detectada recentemente pelo modelo preditivo.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                  <th style={{ padding: "12px", fontSize: "13px" }}>Data/Hora</th>
                  <th style={{ padding: "12px", fontSize: "13px" }}>Sensor</th>
                  <th style={{ padding: "12px", fontSize: "13px" }}>Valor Lido</th>
                  <th style={{ padding: "12px", fontSize: "13px" }}>Média Móvel Esperada</th>
                  <th style={{ padding: "12px", fontSize: "13px" }}>Z-Score (Gravidade)</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((anom, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px", fontSize: "14px" }}>
                      {new Date(anom.data_hora).toLocaleString()}
                    </td>
                    <td style={{ padding: "12px", fontSize: "14px", fontWeight: 500 }}>
                      {anom.sensor_nome}
                    </td>
                    <td style={{ padding: "12px", fontSize: "14px", color: "var(--red-500)", fontWeight: 600 }}>
                      {anom.valor_anomalo}
                    </td>
                    <td style={{ padding: "12px", fontSize: "14px", color: "var(--text-muted)" }}>
                      ~{anom.media_esperada}
                    </td>
                    <td style={{ padding: "12px", fontSize: "14px" }}>
                      <span className="badge" style={{ background: "var(--red-100)", color: "var(--red-700)" }}>
                        {anom.z_score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
