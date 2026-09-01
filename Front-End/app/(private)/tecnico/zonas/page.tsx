"use client";
import React, { useEffect, useState } from "react";
import { FiMap, FiPlus, FiSettings, FiTrash2 } from "react-icons/fi";
import { PageHeader } from "../../../../components/ui/PageHeader";
import { irrigationApi } from "../../../../lib/api";
import { ZonaIrrigacao } from "../../../../types";

export default function ZonasIrrigacao() {
  const [zonas, setZonas] = useState<ZonaIrrigacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchZonas = () => {
    setLoading(true);
    irrigationApi.zones()
      .then(setZonas)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchZonas();
  }, []);

  if (loading) return <div>Carregando zonas...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <PageHeader 
        title="Zonas de Irrigação" 
        subtitle="Configure os setores da fazenda e gerencie as áreas de plantio."
        action={
          <button className="btn btn-primary" onClick={() => alert("Implementar modal de criação")}>
            <FiPlus /> Nova Zona
          </button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
        {zonas.map(zona => (
          <div key={zona.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ padding: "12px", backgroundColor: "var(--blue-50)", borderRadius: "12px" }}>
                  <FiMap size={24} color="var(--blue-500)" />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600 }}>{zona.nome}</h3>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {zona.tipo_sistema} • {zona.area_m2} m²
                  </div>
                </div>
              </div>
              <span className={`badge ${zona.status === 'Ativa' ? 'badge-green' : 'badge-gray'}`}>
                {zona.status}
              </span>
            </div>
            
            <div style={{ marginTop: "12px", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "12px" }}>
                <FiSettings /> Editar
              </button>
              <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "12px", color: "var(--red-500)", borderColor: "var(--red-200)" }}>
                <FiTrash2 /> Excluir
              </button>
            </div>
          </div>
        ))}
        {zonas.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px", color: "var(--text-muted)", backgroundColor: "var(--bg-secondary)", borderRadius: "12px" }}>
            Nenhuma zona de irrigação configurada.
          </div>
        )}
      </div>
    </div>
  );
}
