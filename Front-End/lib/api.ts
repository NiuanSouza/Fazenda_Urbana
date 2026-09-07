import {
  Cliente,
  ConsumoEnergia,
  DashboardStats,
  EventoIrrigacao,
  Fornecedor,
  Insumo,
  Lote,
  Notificacao,
  Producao,
  Produto,
  Sensor,
  SensorReading,
  UsuarioResponse,
  Venda,
  ZonaIrrigacao,
} from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fazendaId = typeof window !== "undefined" ? localStorage.getItem("fazenda_ativa_id") : null;
  if (fazendaId) {
    headers["X-Fazenda-Id"] = fazendaId;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    if (typeof window !== "undefined" && window.location.pathname !== "/" && !window.location.pathname.includes("/login")) {
      window.location.href = "/";
    }
  }

  if (!response.ok) {
    let errorMessage = "Erro na requisição";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = response.statusText;
    }
    throw new ApiError(errorMessage, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const authApi = {
  login: (payload: Record<string, unknown>) => apiFetch<{ access_token: string }>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => apiFetch<UsuarioResponse>("/auth/me"),
};

export const fazendasApi = {
  list: () => apiFetch<any[]>("/fazendas/"),
};

export const dashboardApi = {
  stats: () => apiFetch<DashboardStats>("/dashboard/stats"),
};

export const suppliersApi = {
  list: () => apiFetch<Fornecedor[]>("/suppliers/"),
  get: (cnpj: string) => apiFetch<Fornecedor>(`/suppliers/${encodeURIComponent(cnpj)}`),
  create: (data: Record<string, unknown>) => apiFetch<Fornecedor>("/suppliers/", { method: "POST", body: JSON.stringify(data) }),
  update: (cnpj: string, data: Record<string, unknown>) => apiFetch<Fornecedor>(`/suppliers/${encodeURIComponent(cnpj)}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (cnpj: string) => apiFetch<void>(`/suppliers/${encodeURIComponent(cnpj)}`, { method: "DELETE" }),
};

export const inputsApi = {
  list: () => apiFetch<Insumo[]>("/inputs/"),
  get: (id: number) => apiFetch<Insumo>(`/inputs/${id}`),
  create: (data: Record<string, unknown>) => apiFetch<Insumo>("/inputs/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) => apiFetch<Insumo>(`/inputs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch<void>(`/inputs/${id}`, { method: "DELETE" }),
};

export const productsApi = {
  list: () => apiFetch<Produto[]>("/products/"),
  create: (data: Record<string, unknown>) => apiFetch<Produto>("/products/", { method: "POST", body: JSON.stringify(data) }),
};

export const batchesApi = {
  list: () => apiFetch<Lote[]>("/batches/"),
  create: (data: Record<string, unknown>) => apiFetch<Lote>("/batches/", { method: "POST", body: JSON.stringify(data) }),
};

export const customersApi = {
  list: () => apiFetch<Cliente[]>("/customers/"),
  create: (data: Record<string, unknown>) => apiFetch<Cliente>("/customers/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) => apiFetch<Cliente>(`/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch<void>(`/customers/${id}`, { method: "DELETE" }),
};

export const salesApi = {
  list: () => apiFetch<Venda[]>("/sales/"),
  create: (data: Record<string, unknown>) => apiFetch<Venda>("/sales/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) => apiFetch<Venda>(`/sales/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch<void>(`/sales/${id}`, { method: "DELETE" }),
};

export const productionApi = {
  list: () => apiFetch<Producao[]>("/production/"),
  create: (data: Record<string, unknown>) => apiFetch<Producao>("/production/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) => apiFetch<Producao>(`/production/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

export const notificationsApi = {
  list: () => apiFetch<Notificacao[]>("/notifications/"),
  sync: () => apiFetch<{message: string}>("/notifications/sync", { method: "POST" }),
  updateStatus: (id: number, status: string) => apiFetch<Notificacao>(`/notifications/${id}/status`, { 
    method: "PATCH", 
    body: JSON.stringify({ status }) 
  }),
  executeAction: (id: number) => apiFetch<Notificacao>(`/notifications/${id}/action`, { method: "POST" }),
};

export const sensorsApi = {
  list: () => apiFetch<Sensor[]>("/sensors/"),
  readings: (sensorId: number) => apiFetch<SensorReading[]>(`/sensors/${sensorId}/leituras`),
};

export const irrigationApi = {
  zones: () => apiFetch<ZonaIrrigacao[]>("/irrigation/zones"),
  events: () => apiFetch<EventoIrrigacao[]>("/irrigation/events"),
};

export const energyApi = {
  list: () => apiFetch<ConsumoEnergia[]>("/energy/"),
};

export const analyticsApi = {
  anomalies: () => apiFetch<any>("/analytics/anomalies"),
  correlation: () => apiFetch<any>("/analytics/correlation"),
};

export const usersApi = {
  list: () => apiFetch<UsuarioResponse[]>("/users/"),
  updateStatus: (id: string, status: string) => apiFetch<UsuarioResponse>(`/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
