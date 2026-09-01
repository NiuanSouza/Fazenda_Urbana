"use client";
import React, { useEffect, useState } from "react";
import { FiSave, FiAlertCircle } from "react-icons/fi";
import { PageHeader } from "../../../../components/ui/PageHeader";
import { FormField } from "../../../../components/ui/FormField";
import { sensorsApi } from "../../../../lib/api";
import { Sensor } from "../../../../types";

export default function LeiturasManuais() {
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [sensorId, setSensorId] = useState("");
  const [valor, setValor] = useState("");
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    sensorsApi.list()
      .then(setSensores)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    
    // Simulação do salvamento da leitura manual para complementar a calibração
    setTimeout(() => {
      setSuccess("Leitura manual enviada com sucesso para análise!");
      setValor("");
      setObservacao("");
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <PageHeader 
        title="Lançamento de Leituras Manuais" 
        subtitle="Insira as medições feitas em campo para calibração do modelo IoT."
      />

      <div className="card" style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}>
        <div style={{ background: "var(--blue-50)", color: "var(--blue-600)", padding: "16px", borderRadius: "8px", marginBottom: "24px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <FiAlertCircle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
          <p style={{ fontSize: "14px", lineHeight: 1.5 }}>
            <strong>Aviso de Calibração:</strong> Utilize este formulário para informar leituras de qualidade (laboratório ou equipamento portátil de precisão). Os modelos de Machine Learning darão peso extra a esses registros.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <FormField
            label="Selecione o Sensor"
            as="select"
            value={sensorId}
            onChange={(e) => setSensorId(e.target.value)}
            required
            options={[
              { value: "", label: "Selecione um sensor..." },
              ...sensores.map(s => ({ value: s.id, label: `${s.nome} (${s.tipo})` }))
            ]}
          />

          <FormField
            label="Valor Medido"
            type="number"
            step="0.01"
            required
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Ex: 24.5"
          />

          <FormField
            label="Observações da Coleta (Opcional)"
            as="textarea"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Alguma anomalia notada visualmente no momento da coleta?"
          />

          {success && (
            <div style={{ padding: "12px", background: "var(--green-50)", color: "var(--green-600)", borderRadius: "8px", fontSize: "14px", fontWeight: 500 }}>
              {success}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || !sensorId || !valor}
            style={{ marginTop: "8px", padding: "12px", fontSize: "16px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
          >
            <FiSave />
            {loading ? "Registrando..." : "Registrar Leitura Qualificada"}
          </button>
        </form>
      </div>
    </div>
  );
}
