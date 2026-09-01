"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FiHome, 
  FiUsers, 
  FiBox, 
  FiSettings, 
  FiLogOut, 
  FiTruck, 
  FiShoppingCart,
  FiActivity,
  FiBell,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiMap,
  FiThermometer
}
from "react-icons/fi";
import { useEffect, useState } from "react";
import { authApi, dashboardApi } from "../../lib/api";
import { UsuarioResponse } from "../../types";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useFazenda } from "../../contexts/FazendaContext";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<UsuarioResponse | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const { fazendas, fazendaAtiva, setFazendaAtiva } = useFazenda();

  useEffect(() => {
    authApi.me().then(setUser).catch(console.error);
    dashboardApi.stats()
      .then(s => setAlertCount(s.alertas_criticos || 0))
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const navItems = [
    { name: "Painel", href: "/dashboard", icon: <FiHome size={20} />, requires: "Admin" },
    { name: "Painel Técnico", href: "/tecnico/dashboard", icon: <FiActivity size={20} />, requires: "Operador" },
    { name: "Config. Setores", href: "/tecnico/zonas", icon: <FiMap size={20} />, requires: "Operador" },
    { name: "Leituras Manuais", href: "/tecnico/leituras", icon: <FiThermometer size={20} />, requires: "Operador" },
    { name: "Produção", href: "/producao", icon: <FiActivity size={20} />, requires: "Produção" },
    { name: "Insumos", href: "/insumos", icon: <FiBox size={20} />, requires: "Produção" },
    { name: "Fornecedores", href: "/fornecedores", icon: <FiTruck size={20} />, requires: "Fornecedores" },
    { name: "Clientes", href: "/clientes", icon: <FiUsers size={20} />, requires: "Vendas" },
    { name: "Vendas", href: "/pedidos", icon: <FiShoppingCart size={20} />, requires: "Vendas" },
    { name: "Usuários", href: "/usuarios", icon: <FiUsers size={20} />, requires: "Admin" },
    { name: "Notificações", href: "/notificacoes", icon: <FiBell size={20} /> },
    { name: "Meu Perfil", href: "/perfil", icon: <FiUser size={20} /> },
    { name: "Configurações", href: "/configuracaoes", icon: <FiSettings size={20} /> },
  ];

  const visibleNavItems = navItems.filter(
    (item) => {
      // Se for admin global ou admin da fazenda, vê tudo
      if (user?.is_admin || fazendaAtiva?.role === "Admin") return true;
      // Para as outras roles, restringe o acesso (técnico/operador não vê Vendas, Fornecedores, etc)
      if (fazendaAtiva?.role === "Operador") {
        return ["Painel Técnico", "Config. Setores", "Leituras Manuais", "Produção", "Insumos", "Notificações", "Meu Perfil"].includes(item.name);
      }
      return !item.requires || user?.funcionalidades.includes(item.requires);
    }
  );

  return (
    <>
      <div 
        className={`${styles.sidebarOverlay} ${isOpen ? styles.open : ""}`} 
        onClick={onClose} 
      />
      <aside 
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""} ${isOpen ? styles.mobileOpen : ""}`}
      >
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>GC</div>
            {!collapsed && <span className={styles.logoText}>Green City</span>}
          </div>
          <button 
            className={styles.collapseBtn} 
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        {!collapsed && fazendas.length > 0 && (
          <div style={{ padding: "0 16px 16px 16px" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Fazenda Atual
            </div>
            <select 
              value={fazendaAtiva?.id || ""} 
              onChange={(e) => {
                const f = fazendas.find(f => f.id === Number(e.target.value));
                if (f) setFazendaAtiva(f);
              }}
              style={{ 
                width: "100%", padding: "8px", borderRadius: "8px", 
                backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)",
                color: "var(--text-primary)", fontSize: "13px", fontWeight: 500, outline: "none", cursor: "pointer"
              }}
            >
              {fazendas.map(f => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>
        )}

        <nav className={styles.nav}>
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                onClick={() => window.innerWidth <= 768 && onClose()}
                title={collapsed ? item.name : undefined}
              >
                <div className={styles.navIconWrapper}>
                  {item.icon}
                  {item.name === "Notificações" && alertCount > 0 && (
                    <span className={styles.navBadge}></span>
                  )}
                </div>
                {!collapsed && <span className={styles.navText}>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          {!collapsed && user && (
            <Link href="/perfil" className={styles.userInfo} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={styles.avatar}>{user.nome.charAt(0).toUpperCase()}</div>
              <div>
                <div className={styles.userName}>{user.nome.split(" ")[0]}</div>
                <div className={styles.userRole}>{user.is_admin ? "Admin" : "Operador"}</div>
              </div>
            </Link>
          )}
          <div className={styles.footerActions}>
            <ThemeToggle />
            <button 
              className={styles.logoutBtn} 
              onClick={handleLogout}
              title={collapsed ? "Sair" : undefined}
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
