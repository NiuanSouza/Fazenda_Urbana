"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fazendasApi, authApi } from "../lib/api";
import { UsuarioResponse } from "../types";

interface Fazenda {
  id: number;
  nome: string;
  cnpj: string;
  endereco: string;
  role: string;
}

interface FazendaContextData {
  fazendas: Fazenda[];
  fazendaAtiva: Fazenda | null;
  setFazendaAtiva: (fazenda: Fazenda) => void;
  isLoading: boolean;
}

const FazendaContext = createContext<FazendaContextData>({} as FazendaContextData);

export function FazendaProvider({ children }: { children: ReactNode }) {
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [fazendaAtiva, setFazendaAtivaState] = useState<Fazenda | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only load fazendas if we have a token
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    const loadFazendas = async () => {
      try {
        const data = await fazendasApi.list();
        setFazendas(data);

        // Try to recover the active fazenda from local storage
        const savedFazendaId = localStorage.getItem("fazenda_ativa_id");
        if (savedFazendaId && data.find((f: Fazenda) => f.id === Number(savedFazendaId))) {
          const f = data.find((f: Fazenda) => f.id === Number(savedFazendaId));
          setFazendaAtivaState(f);
        } else if (data.length > 0) {
          // Fallback to the first one
          setFazendaAtivaState(data[0]);
          localStorage.setItem("fazenda_ativa_id", data[0].id.toString());
        }
      } catch (err) {
        console.error("Erro ao carregar fazendas:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFazendas();
  }, []);

  const setFazendaAtiva = (fazenda: Fazenda) => {
    setFazendaAtivaState(fazenda);
    localStorage.setItem("fazenda_ativa_id", fazenda.id.toString());
    // Reload the page to reset state across all components
    window.location.reload();
  };

  return (
    <FazendaContext.Provider value={{ fazendas, fazendaAtiva, setFazendaAtiva, isLoading }}>
      {children}
    </FazendaContext.Provider>
  );
}

export function useFazenda() {
  return useContext(FazendaContext);
}
