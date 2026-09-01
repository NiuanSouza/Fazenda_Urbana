"use client";
import React, { useEffect, useState } from "react";
import { FiUser, FiShield, FiKey, FiLock, FiMail } from "react-icons/fi";
import { authApi } from "../../../lib/api";
import { UsuarioResponse } from "../../../types";
import { PageHeader } from "../../../components/ui/PageHeader";
import { FormField } from "../../../components/ui/FormField";

export default function Perfil() {
  const [user, setUser] = useState<UsuarioResponse | null>(null);

  useEffect(() => {
    authApi.me().then(setUser).catch(console.error);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <PageHeader 
        title="Meu Perfil" 
        subtitle="Gerencie suas informações pessoais e configurações de segurança."
      />

      <div className="grid-2">
        {/* Informações Pessoais */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "var(--green-100)", color: "var(--green-600)" }}>
              <FiUser size={20} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600 }}>Informações Pessoais</h3>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ 
              width: "80px", height: "80px", borderRadius: "50%", 
              backgroundColor: "var(--green-500)", color: "white", 
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "32px", fontWeight: 600, marginBottom: "16px"
            }}>
              {user?.nome?.charAt(0).toUpperCase() || "U"}
            </div>
            <button className="btn btn-outline" style={{ fontSize: "12px", padding: "6px 12px" }}>
              Alterar Foto
            </button>
          </div>

          <FormField label="Nome Completo" value={user?.nome || ""} disabled />
          
          <div style={{ position: "relative" }}>
            <FormField label="E-mail" value={user?.email || ""} disabled />
            <FiMail size={16} color="var(--text-muted)" style={{ position: "absolute", right: "12px", top: "36px" }} />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span className="form-label">Cargo / Permissões</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {user?.is_admin ? (
                <span className="badge badge-purple" style={{ padding: "6px 12px", fontSize: "13px" }}>Administrador Global</span>
              ) : (
                user?.funcionalidades?.map((f, i) => (
                  <span key={i} className="badge badge-green" style={{ padding: "6px 12px", fontSize: "13px" }}>{f}</span>
                ))
              )}
            </div>
          </div>
          
          <button className="btn btn-primary" style={{ marginTop: "12px", width: "100%" }}>
            Salvar Alterações
          </button>
        </div>

        {/* Segurança */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
              <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "var(--yellow-100)", color: "var(--yellow-600)" }}>
                <FiShield size={20} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Segurança da Conta</h3>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ padding: "8px", backgroundColor: "var(--bg-secondary)", borderRadius: "50%" }}>
                    <FiKey size={18} color="var(--text-secondary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: "14px" }}>Senha</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Última alteração há 3 meses</div>
                  </div>
                </div>
                <button className="btn btn-outline" style={{ fontSize: "13px", padding: "6px 12px" }}>
                  Alterar
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ padding: "8px", backgroundColor: "var(--bg-secondary)", borderRadius: "50%" }}>
                    <FiLock size={18} color="var(--text-secondary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: "14px" }}>Autenticação em 2 Fatores (2FA)</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Não configurado</div>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ fontSize: "13px", padding: "6px 12px" }}>
                  Configurar
                </button>
              </div>
            </div>
          </div>
          
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px", borderColor: "var(--red-200)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--red-500)" }}>Zona de Perigo</h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
              Ações irreversíveis relacionadas à sua conta.
            </p>
            <button className="btn" style={{ backgroundColor: "var(--red-50)", color: "var(--red-600)", border: "1px solid var(--red-200)", alignSelf: "flex-start" }}>
              Desativar Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
