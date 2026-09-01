"use client";
import React, { useEffect, useState } from "react";
import { FiSettings, FiBell, FiMoon, FiSun, FiDatabase, FiMonitor, FiGlobe, FiLayout, FiActivity } from "react-icons/fi";
import { authApi } from "../../../lib/api";
import { UsuarioResponse } from "../../../types";
import { PageHeader } from "../../../components/ui/PageHeader";
import { useTheme } from "../../../hooks/useTheme";

export default function Configuracoes() {
  const [user, setUser] = useState<UsuarioResponse | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    authApi.me().then(setUser).catch(console.error);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <PageHeader 
        title="Configurações do Sistema" 
        subtitle="Gerencie preferências gerais, aparência e notificações do ambiente."
      />

      <div className="grid-2">
        {/* Preferências */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
              <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "var(--blue-100)", color: "var(--blue-600)" }}>
                <FiMonitor size={20} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Aparência e Interface</h3>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ padding: "8px", backgroundColor: "var(--bg-secondary)", borderRadius: "50%" }}>
                  {theme === "dark" ? <FiMoon size={18} color="var(--blue-500)" /> : <FiSun size={18} color="var(--yellow-500)" />}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "14px" }}>Tema do Sistema</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Atualmente no modo {theme === "dark" ? "Escuro" : "Claro"}</div>
                </div>
              </div>
              <button className="btn btn-outline" onClick={toggleTheme} style={{ fontSize: "13px", padding: "6px 12px" }}>
                {theme === "dark" ? "Mudar para Claro" : "Mudar para Escuro"}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", border: "1px solid var(--border)", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ padding: "8px", backgroundColor: "var(--bg-secondary)", borderRadius: "50%" }}>
                  <FiLayout size={18} color="var(--text-secondary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "14px" }}>Densidade da Interface</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Espaçamento entre os elementos</div>
                </div>
              </div>
              <select className="form-input" style={{ width: "auto", padding: "6px 12px", height: "32px", fontSize: "13px" }} defaultValue="padrao">
                <option value="compacta">Compacta</option>
                <option value="padrao">Padrão</option>
                <option value="confortavel">Confortável</option>
              </select>
            </div>
          </div>

          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
              <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "var(--purple-100)", color: "var(--purple-600)" }}>
                <FiBell size={20} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Notificações e Alertas</h3>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "14px" }}>Alertas Críticos de Produção</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Umidade, temperatura, falhas</div>
                </div>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px" }}>
                <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ 
                  position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, 
                  backgroundColor: "var(--green-500)", borderRadius: "24px", transition: "0.4s"
                }}>
                  <span style={{ 
                    position: "absolute", height: "18px", width: "18px", left: "22px", bottom: "3px", 
                    backgroundColor: "white", borderRadius: "50%", transition: "0.4s"
                  }}></span>
                </span>
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "14px" }}>Resumo Diário (E-mail)</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Receber relatório de vendas e insumos</div>
                </div>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px" }}>
                <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ 
                  position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, 
                  backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "24px", transition: "0.4s"
                }}>
                  <span style={{ 
                    position: "absolute", height: "18px", width: "18px", left: "2px", bottom: "2px", 
                    backgroundColor: "var(--text-muted)", borderRadius: "50%", transition: "0.4s"
                  }}></span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Sobre o Sistema */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
              <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "var(--green-100)", color: "var(--green-600)" }}>
                <FiGlobe size={20} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Localização e Formatos</h3>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="form-label">Idioma do Sistema</label>
                <select className="form-input">
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (United States)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Fuso Horário</label>
                <select className="form-input">
                  <option value="America/Sao_Paulo">Horário de Brasília (GMT-03:00)</option>
                  <option value="America/Manaus">Horário de Manaus (GMT-04:00)</option>
                  <option value="America/Rio_Branco">Horário do Acre (GMT-05:00)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
              <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "var(--text-primary)", color: "var(--bg-primary)" }}>
                <FiDatabase size={20} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Sobre o Sistema</h3>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", backgroundColor: "var(--bg-secondary)", borderRadius: "8px" }}>
              <div style={{ 
                width: "48px", height: "48px", borderRadius: "12px", 
                backgroundColor: "var(--green-500)", color: "white", 
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", fontWeight: 700
              }}>
                GC
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "16px" }}>Green City OS</div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Plataforma de Gestão de Fazenda Urbana</div>
              </div>
            </div>

            <div style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><FiLayout size={14} /> Versão Frontend:</span>
                <span style={{ fontWeight: 600 }}>3.0.0 (React 19 / Next.js)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><FiActivity size={14} /> Versão Backend:</span>
                <span style={{ fontWeight: 600 }}>3.0.0 (FastAPI)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><FiSettings size={14} /> Ambiente:</span>
                <span style={{ fontWeight: 600, color: "var(--green-500)" }}>Produção</span>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button className="btn btn-outline" style={{ flex: 1, fontSize: "12px" }}>Termos de Uso</button>
              <button className="btn btn-outline" style={{ flex: 1, fontSize: "12px" }}>Privacidade</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
