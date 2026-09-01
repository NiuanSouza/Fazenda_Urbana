"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../lib/api";
import { FormField } from "../components/ui/FormField";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@green.com");
  const [senha, setSenha] = useState("Troca123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const resp = await authApi.login({ login: email, senha });
      localStorage.setItem("token", resp.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message || "E-mail ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      background: "linear-gradient(135deg, #f4fdf4 0%, #e8f5e9 100%)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Elementos decorativos */}
      <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "40vw", height: "40vw", background: "rgba(76, 175, 80, 0.05)", borderRadius: "50%", zIndex: 0 }}></div>
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "50vw", height: "50vw", background: "rgba(76, 175, 80, 0.05)", borderRadius: "50%", zIndex: 0 }}></div>
      
      <div style={{ 
        position: "relative", 
        zIndex: 10, 
        width: "100%", 
        maxWidth: "900px", 
        margin: "auto", 
        padding: "var(--space-6)",
        display: "flex",
        gap: "var(--space-6)",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap"
      }}>
        
        {/* Lado Esquerdo: Mensagem de Demonstração */}
        <div style={{ flex: "1 1 300px", color: "var(--text-primary)" }}>
          <h2 style={{ fontSize: "2.4rem", color: "var(--green-starbucks)", marginBottom: "var(--space-3)" }}>
            Bem-vindo à demonstração
          </h2>
          <p style={{ fontSize: "1.6rem", color: "var(--text-secondary)", marginBottom: "var(--space-4)", lineHeight: 1.6 }}>
            Este sistema é um ambiente público de teste e demonstração do SaaS <strong>Green City</strong>. Toda vez que o sistema é iniciado, <strong>o banco de dados é completamente resetado</strong> e todos os dados criados durante o uso são excluídos.
          </p>
          
          <div style={{ background: "rgba(255, 255, 255, 0.8)", padding: "var(--space-4)", borderRadius: "var(--radius-card)", border: "1px solid var(--border)", backdropFilter: "blur(5px)" }}>
            <h3 style={{ fontSize: "1.6rem", marginBottom: "var(--space-2)", color: "var(--text-primary)" }}>Contas de Acesso:</h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", fontSize: "1.4rem", color: "var(--text-secondary)" }}>
              <li style={{ padding: "8px", background: "var(--bg-primary)", borderRadius: "4px" }}>
                <strong>Admin Total:</strong><br/> admin@green.com
              </li>
              <li style={{ padding: "8px", background: "var(--bg-primary)", borderRadius: "4px" }}>
                <strong>Painel Técnico:</strong><br/> tecnico@green.com
              </li>
              <li style={{ padding: "8px", background: "var(--bg-primary)", borderRadius: "4px" }}>
                <strong>Senha Padrão:</strong><br/> Troca123
              </li>
            </ul>
          </div>
        </div>

        {/* Lado Direito: Formulário */}
        <div className="card" style={{ flex: "1 1 400px", maxWidth: "480px", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.6)", background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--space-5)" }}>
            <div style={{ 
              width: "64px", height: "64px", margin: "0 auto var(--space-3)", 
              background: "var(--green-accent)", 
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-white)", fontSize: "24px", fontWeight: 700
            }}>
              GC
            </div>
            <h1 className="page-title" style={{ marginBottom: "var(--space-1)" }}>Green City</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.6rem" }}>Acesse para gerenciar sua fazenda.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {error && (
              <div style={{ background: "var(--red-bg)", color: "var(--red)", padding: "12px", borderRadius: "var(--radius-sm)", fontSize: "1.4rem", border: "1px solid var(--red-border)" }}>
                {error}
              </div>
            )}
            
            <FormField
              label="E-mail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu endereço de e-mail"
            />
            
            <div style={{ position: "relative" }}>
              <FormField
                label="Senha"
                type={showPassword ? "text" : "password"}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: "absolute", right: "12px", top: "38px", 
                  background: "transparent", border: "none", cursor: "pointer", 
                  color: "var(--green-accent)", fontSize: "1.2rem", fontWeight: 600 
                }}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1.4rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)", cursor: "pointer", fontWeight: 600 }}>
                <input type="checkbox" style={{ accentColor: "var(--green-accent)", width: "16px", height: "16px" }} /> Lembrar de mim
              </label>
              <a href="#" style={{ color: "var(--green-accent)", fontWeight: 600, textDecoration: "underline" }}>Esqueceu a senha?</a>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: "100%", padding: "14px 24px", marginTop: "var(--space-2)", fontSize: "1.6rem" }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
