from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, EmailStr

from app.models import (
    StatusGeral,
    StatusIrrigacao,
    StatusLote,
    StatusNotificacao,
    StatusProducao,
    StatusSensor,
    StatusVenda,
    TipoCliente,
    TipoIrrigacao,
    TipoSensor,
    ValidadeInsumo,
)


# --------------------------------------------------------------------------- #
# Auth                                                                          #
# --------------------------------------------------------------------------- #


class LoginRequest(BaseModel):
    login: str  # email ou id_usuario
    senha: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UsuarioResponse(BaseModel):
    id_usuario: str
    nome: str
    email: str
    status: StatusGeral
    is_admin: bool
    funcionalidades: list[str] = []

    class Config:
        from_attributes = True


# --------------------------------------------------------------------------- #
# Fornecedor                                                                    #
# --------------------------------------------------------------------------- #


class FornecedorBase(BaseModel):
    cnpj: str
    nome: str
    razao_social: Optional[str] = None
    telefone1: Optional[str] = None
    telefone2: Optional[str] = None
    email: Optional[str] = None
    status: StatusGeral = StatusGeral.ativo
    tipo: Optional[str] = None
    inf_adicionais: Optional[str] = None
    endereco: Optional[str] = None
    numero_endereco: Optional[int] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    pais: str = "Brasil"
    cep: Optional[str] = None


class FornecedorCreate(FornecedorBase):
    pass


class FornecedorUpdate(BaseModel):
    nome: Optional[str] = None
    razao_social: Optional[str] = None
    telefone1: Optional[str] = None
    telefone2: Optional[str] = None
    email: Optional[str] = None
    status: Optional[StatusGeral] = None
    tipo: Optional[str] = None
    inf_adicionais: Optional[str] = None
    endereco: Optional[str] = None
    numero_endereco: Optional[int] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    pais: Optional[str] = None
    cep: Optional[str] = None


class FornecedorResponse(FornecedorBase):
    class Config:
        from_attributes = True


# --------------------------------------------------------------------------- #
# Insumo                                                                        #
# --------------------------------------------------------------------------- #


class InsumoBase(BaseModel):
    nome_insumo: str
    quantidade_insumo: int = 0
    validade: ValidadeInsumo = ValidadeInsumo.disponivel
    data_validade: Optional[date] = None
    fornecedor_cnpj: str


class InsumoCreate(InsumoBase):
    pass


class InsumoUpdate(BaseModel):
    nome_insumo: Optional[str] = None
    quantidade_insumo: Optional[int] = None
    validade: Optional[ValidadeInsumo] = None
    data_validade: Optional[date] = None
    fornecedor_cnpj: Optional[str] = None


class InsumoResponse(InsumoBase):
    id: int
    fornecedor_nome: Optional[str] = None

    class Config:
        from_attributes = True


# --------------------------------------------------------------------------- #
# Produto                                                                       #
# --------------------------------------------------------------------------- #


class ProdutoBase(BaseModel):
    nome_produto: str
    categoria: Optional[str] = None


class ProdutoCreate(ProdutoBase):
    pass


class ProdutoUpdate(BaseModel):
    nome_produto: Optional[str] = None
    categoria: Optional[str] = None


class ProdutoResponse(ProdutoBase):
    id: int

    class Config:
        from_attributes = True


# --------------------------------------------------------------------------- #
# Lote                                                                          #
# --------------------------------------------------------------------------- #


class LoteBase(BaseModel):
    produto_id: int
    quantidade: int
    producao_id: Optional[int] = None
    status: StatusLote = StatusLote.disponivel
    data_validade: Optional[date] = None


class LoteCreate(LoteBase):
    pass


class LoteUpdate(BaseModel):
    quantidade: Optional[int] = None
    status: Optional[StatusLote] = None
    data_validade: Optional[date] = None


class LoteResponse(LoteBase):
    id: int
    produto_nome: Optional[str] = None

    class Config:
        from_attributes = True


# --------------------------------------------------------------------------- #
# Producao                                                                      #
# --------------------------------------------------------------------------- #


class InsumoProducaoIn(BaseModel):
    insumo_id: int
    quantidade: int


class ProducaoCreate(BaseModel):
    data_inicio: date
    data_fim: Optional[date] = None
    produto_nome: str
    insumos: list[InsumoProducaoIn] = []


class ProducaoUpdate(BaseModel):
    data_fim: Optional[date] = None
    produto_nome: Optional[str] = None
    status: Optional[StatusProducao] = None


class ProducaoResponse(BaseModel):
    id: int
    data_inicio: date
    data_fim: Optional[date] = None
    produto_nome: str
    status: StatusProducao
    insumos: list[dict] = []

    class Config:
        from_attributes = True


# --------------------------------------------------------------------------- #
# Cliente                                                                       #
# --------------------------------------------------------------------------- #


class ClienteBase(BaseModel):
    nome: str
    telefone1: Optional[str] = None
    telefone2: Optional[str] = None
    cnpj: Optional[str] = None
    cpf: Optional[str] = None
    ie: Optional[str] = None
    email: Optional[str] = None
    numero_endereco: Optional[int] = None
    nome_endereco: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None
    tipo: TipoCliente = TipoCliente.fisico
    status: StatusGeral = StatusGeral.ativo


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    nome: Optional[str] = None
    telefone1: Optional[str] = None
    telefone2: Optional[str] = None
    cnpj: Optional[str] = None
    cpf: Optional[str] = None
    email: Optional[str] = None
    cep: Optional[str] = None
    status: Optional[StatusGeral] = None
    tipo: Optional[TipoCliente] = None


class ClienteResponse(ClienteBase):
    id: int

    class Config:
        from_attributes = True


# --------------------------------------------------------------------------- #
# Venda                                                                         #
# --------------------------------------------------------------------------- #


class ItemVendaIn(BaseModel):
    lote_id: int
    quantidade: int
    valor_total: Decimal


class VendaCreate(BaseModel):
    numero: str
    info_adicionais: Optional[str] = None
    cliente_id: int
    itens: list[ItemVendaIn]


class VendaUpdate(BaseModel):
    status: Optional[StatusVenda] = None
    info_adicionais: Optional[str] = None


class ItemVendaResponse(BaseModel):
    id: int
    lote_id: int
    quantidade: int
    valor_total: Decimal

    class Config:
        from_attributes = True


class VendaResponse(BaseModel):
    id: int
    numero: str
    info_adicionais: Optional[str] = None
    cliente_id: Optional[int] = None
    cliente_nome: Optional[str] = None
    status: StatusVenda
    itens: list[ItemVendaResponse] = []

    class Config:
        from_attributes = True


# --------------------------------------------------------------------------- #
# Notificação                                                                   #
# --------------------------------------------------------------------------- #


class NotificacaoUpdate(BaseModel):
    status: StatusNotificacao


class NotificacaoResponse(BaseModel):
    id: int
    tipo: str       # "critico" | "alerta" | "info"
    titulo: str
    mensagem: str
    entidade: str   # "insumo" | "lote" | "producao" | "venda"
    entidade_id: Optional[int] = None
    acao_requerida: Optional[str] = None
    status: StatusNotificacao
    data_criacao: datetime
    data_resolucao: Optional[datetime] = None
    usuario_id: Optional[str] = None

    class Config:
        from_attributes = True


# --------------------------------------------------------------------------- #
# Sensor                                                                        #
# --------------------------------------------------------------------------- #


class SensorBase(BaseModel):
    nome: str
    tipo: TipoSensor
    localizacao: Optional[str] = None
    unidade: Optional[str] = None
    status: StatusSensor = StatusSensor.online
    data_instalacao: Optional[date] = None


class SensorCreate(SensorBase):
    pass


class SensorUpdate(BaseModel):
    nome: Optional[str] = None
    tipo: Optional[TipoSensor] = None
    localizacao: Optional[str] = None
    unidade: Optional[str] = None
    status: Optional[StatusSensor] = None


class SensorResponse(SensorBase):
    id: int

    class Config:
        from_attributes = True


class LeituraSensorCreate(BaseModel):
    sensor_id: int
    valor: float
    data_hora: Optional[datetime] = None


class LeituraSensorResponse(BaseModel):
    id: int
    sensor_id: int
    valor: float
    data_hora: datetime

    class Config:
        from_attributes = True


class SensorComLeituraResponse(SensorResponse):
    ultima_leitura: Optional[float] = None
    ultima_leitura_hora: Optional[datetime] = None
    total_leituras: int = 0


# --------------------------------------------------------------------------- #
# Irrigação                                                                     #
# --------------------------------------------------------------------------- #


class ZonaIrrigacaoBase(BaseModel):
    nome: str
    tipo_sistema: Optional[str] = None
    area_m2: float = 0
    status: StatusIrrigacao = StatusIrrigacao.ativa


class ZonaIrrigacaoCreate(ZonaIrrigacaoBase):
    pass


class ZonaIrrigacaoUpdate(BaseModel):
    nome: Optional[str] = None
    tipo_sistema: Optional[str] = None
    area_m2: Optional[float] = None
    status: Optional[StatusIrrigacao] = None


class ZonaIrrigacaoResponse(ZonaIrrigacaoBase):
    id: int

    class Config:
        from_attributes = True


class EventoIrrigacaoCreate(BaseModel):
    zona_id: int
    data_inicio: datetime
    data_fim: Optional[datetime] = None
    volume_litros: float = 0
    tipo: TipoIrrigacao = TipoIrrigacao.automatico


class EventoIrrigacaoResponse(BaseModel):
    id: int
    zona_id: int
    zona_nome: Optional[str] = None
    data_inicio: datetime
    data_fim: Optional[datetime] = None
    volume_litros: float
    tipo: TipoIrrigacao

    class Config:
        from_attributes = True


class ZonaComEstatisticasResponse(ZonaIrrigacaoResponse):
    total_eventos: int = 0
    volume_total_litros: float = 0
    ultimo_evento: Optional[datetime] = None


# --------------------------------------------------------------------------- #
# Energia                                                                       #
# --------------------------------------------------------------------------- #


class ConsumoEnergiaCreate(BaseModel):
    data: date
    consumo_kwh: float
    custo_reais: Optional[float] = None
    fonte: str = "rede"


class ConsumoEnergiaResponse(BaseModel):
    id: int
    data: date
    consumo_kwh: float
    custo_reais: Optional[float] = None
    fonte: str

    class Config:
        from_attributes = True
