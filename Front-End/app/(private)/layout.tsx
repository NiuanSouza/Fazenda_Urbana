"use client";
import React from "react";
import { Sidebar } from "../../components/Sidebar";
import { FiMenu } from "react-icons/fi";
import { ToastProvider } from "../../components/ui/Toast";
import { FazendaProvider } from "../../contexts/FazendaContext";
import styles from "./Layout.module.css";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <FazendaProvider>
      <ToastProvider>
        <div className={styles.layout}>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className={styles.main}>
            <button 
              className={styles.mobileMenuBtn} 
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir Menu"
            >
              <FiMenu size={24} />
            </button>
            <div className={styles.content}>
              {children}
            </div>
          </div>
        </div>
      </ToastProvider>
    </FazendaProvider>
  );
}
