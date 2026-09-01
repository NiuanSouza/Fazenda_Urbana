/* All shared TypeScript interfaces for the Fazenda Urbana frontend */

export interface UsuarioResponse {
  id_usuario: string;
  nome: string;
  email: string;
  status: string;
  is_admin: boolean;
  funcionalidades: string[];
}

export interface Fornecedor {
  cnpj: string;
  nome: string;
  razao_social?: string;
  telefone1?: string;
  telefone2?: string;
  email?: string;
  status: string;
  tipo?: string;
  inf_adicionais?: string;
  endereco?: string;
  numero_endereco?: number;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  cep?: string;
}

export interface Insumo {
  id: number;
  nome_insumo: string;
  quantidade_insumo: number;
  validade: string;
  data_validade?: string;
  fornecedor_cnpj: string;
  fornecedor_nome?: string;
}

export interface Produto {
  id: number;
  nome_produto: string;
  categoria?: string;
}

export interface Lote {
  id: number;
  produto_id: number;
  produto_nome?: string;
  quantidade: number;
  producao_id?: number;
  status: string;
  data_validade?: string;
}

export interface Cliente {
  id: number;
  nome: string;
  telefone1?: string;
  email?: string;
  cnpj?: string;
  cpf?: string;
  tipo: string;
  status: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface ItemVenda {
  id: number;
  lote_id: number;
  quantidade: number;
  valor_total: number;
}

export interface Venda {
  id: number;
  numero: string;
  info_adicionais?: string;
  cliente_id: number;
  cliente_nome?: string;
  status: string;
  itens: ItemVenda[];
}

export interface Producao {
  id: number;
  data_inicio: string;
  data_fim?: string;
  produto_nome: string;
  status: string;
  insumos: { insumo_id: number; nome: string; quantidade: number }[];
}

export interface Notificacao {
  id: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  entidade: string;
  entidade_id?: number;
  acao_requerida?: string;
  status: "pendente" | "lida" | "resolvida" | "ignorada";
  data_criacao: string;
  data_resolucao?: string;
}

export interface SensorReading {
  id: number;
  sensor_id: number;
  valor: number;
  data_hora: string;
}

export interface Sensor {
  id: number;
  nome: string;
  tipo: string;
  localizacao?: string;
  unidade?: string;
  status: string;
  data_instalacao?: string;
  ultima_leitura?: number;
  ultima_leitura_hora?: string;
  total_leituras: number;
}

export interface ZonaIrrigacao {
  id: number;
  nome: string;
  tipo_sistema?: string;
  area_m2: number;
  status: string;
  total_eventos: number;
  volume_total_litros: number;
  ultimo_evento?: string;
}

export interface EventoIrrigacao {
  id: number;
  zona_id: number;
  zona_nome?: string;
  data_inicio: string;
  data_fim?: string;
  volume_litros: number;
  tipo: string;
}

export interface ConsumoEnergia {
  id: number;
  data: string;
  consumo_kwh: number;
  custo_reais?: number;
  fonte: string;
}

export interface DashboardStats {
  total_producoes_ativas: number;
  total_fornecedores: number;
  total_clientes: number;
  total_vendas_andamento: number;
  total_insumos: number;
  total_insumos_criticos: number;
  total_lotes_disponiveis: number;
  receita_total: number;
  alertas_criticos: number;
  producoes_por_status: Record<string, number>;
  vendas_por_status: Record<string, number>;
  producao_mensal: { mes: string; count: number }[];
  vendas_mensal: { mes: string; valor: number }[];
  insumos_por_fornecedor: { fornecedor: string; count: number }[];
  top_produtos: { nome: string; quantidade: number }[];
  sensores: { total: number; online: number };
  irrigacao: { total_zonas: number; volume_hoje_litros: number; volume_semana_litros: number };
  energia: { consumo_rede_hoje_kwh: number; geracao_solar_hoje_kwh: number };
}
