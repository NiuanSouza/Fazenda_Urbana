import enum
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import relationship, Mapped

from app.database import Base


# --------------------------------------------------------------------------- #
# Enums                                                                         #
# --------------------------------------------------------------------------- #


class RoleUsuario(str, enum.Enum):
    admin = "Admin"
    operador = "Operador"
    visualizador = "Visualizador"


class StatusGeral(str, enum.Enum):
    ativo = "ativo"
    inativo = "inativo"


class ValidadeInsumo(str, enum.Enum):
    disponivel = "Disponivel"
    vencido = "Vencido"
    esgotado = "esgotado"


class StatusProducao(str, enum.Enum):
    ativa = "Ativa"
    cancelada = "Cancelada"
    completa = "Completa"


class StatusLote(str, enum.Enum):
    disponivel = "disponível"
    esgotado = "esgotado"
    vencido = "vencido"


class StatusVenda(str, enum.Enum):
    em_andamento = "Em andamento"
    entregue = "Entregue"
    cancelado = "Cancelado"


class TipoCliente(str, enum.Enum):
    fisico = "Físico"
    juridico = "Jurídico"


class StatusNotificacao(str, enum.Enum):
    pendente = "pendente"
    lida = "lida"
    resolvida = "resolvida"
    ignorada = "ignorada"


# --------------------------------------------------------------------------- #
# Models                                                                        #
# --------------------------------------------------------------------------- #


class Fazenda(Base):
    __tablename__ = "fazenda"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(255), nullable=False)
    cnpj = Column(String(18), unique=True, nullable=True)
    endereco = Column(Text, nullable=True)

    usuarios = relationship("UsuarioFazenda", back_populates="fazenda")


class UsuarioFazenda(Base):
    __tablename__ = "usuario_fazenda"

    usuario_id = Column(String(8), ForeignKey("usuario.id_usuario"), primary_key=True)
    fazenda_id = Column(Integer, ForeignKey("fazenda.id"), primary_key=True)
    role = Column(Enum(RoleUsuario), default=RoleUsuario.visualizador)

    usuario = relationship("Usuario", back_populates="fazendas")
    fazenda = relationship("Fazenda", back_populates="usuarios")

class Funcionalidade(Base):
    __tablename__ = "funcionalidade"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)

    usuarios = relationship("UsuarioFuncionalidade", back_populates="funcionalidade")


class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario = Column(String(8), primary_key=True, index=True)
    nome = Column(String(255))
    email = Column(String(100), unique=True, index=True)
    senha_hash = Column(String(255))
    status = Column(Enum(StatusGeral), default=StatusGeral.ativo)
    is_admin = Column(Boolean, default=False)

    funcionalidades = relationship("UsuarioFuncionalidade", back_populates="usuario")
    fazendas = relationship("UsuarioFazenda", back_populates="usuario", cascade="all, delete-orphan")


class UsuarioFuncionalidade(Base):
    __tablename__ = "usuario_funcionalidade"

    usuario_id = Column(String(8), ForeignKey("usuario.id_usuario"), primary_key=True)
    funcionalidade_id = Column(Integer, ForeignKey("funcionalidade.id"), primary_key=True)

    usuario = relationship("Usuario", back_populates="funcionalidades")
    funcionalidade = relationship("Funcionalidade", back_populates="usuarios")


class Fornecedor(Base):
    __tablename__ = "fornecedor"

    fazenda_id = Column(Integer, ForeignKey("fazenda.id"), nullable=True)

    cnpj = Column(String(18), primary_key=True, index=True)
    nome = Column(String(255))
    razao_social = Column(String(255))
    telefone1 = Column(String(20))
    telefone2 = Column(String(20), nullable=True)
    email = Column(String(100))
    status = Column(Enum(StatusGeral), default=StatusGeral.ativo)
    tipo = Column(String(30))
    inf_adicionais = Column(Text, nullable=True)
    endereco = Column(String(100))
    numero_endereco = Column(Integer)
    bairro = Column(String(50))
    cidade = Column(String(50))
    estado = Column(String(2))
    pais = Column(String(30), default="Brasil")
    cep = Column(String(10))

    insumos = relationship("Insumo", back_populates="fornecedor")


class Insumo(Base):
    __tablename__ = "insumo"

    fazenda_id = Column(Integer, ForeignKey("fazenda.id"), nullable=True)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome_insumo = Column(String(255))
    quantidade_insumo = Column(Integer, default=0)
    validade: Mapped[ValidadeInsumo] = Column(Enum(ValidadeInsumo), default=ValidadeInsumo.disponivel) # type: ignore
    data_validade: Mapped[date | None] = Column(Date, nullable=True) # type: ignore
    fornecedor_cnpj = Column(String(18), ForeignKey("fornecedor.cnpj"))

    fornecedor = relationship("Fornecedor", back_populates="insumos")
    producoes = relationship("InsumoProducao", back_populates="insumo")


class Produto(Base):
    __tablename__ = "produto"

    fazenda_id = Column(Integer, ForeignKey("fazenda.id"), nullable=True)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome_produto = Column(String(100))
    categoria = Column(String(50))

    lotes = relationship("Lote", back_populates="produto")


class Producao(Base):
    __tablename__ = "producao"

    fazenda_id = Column(Integer, ForeignKey("fazenda.id"), nullable=True)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    data_inicio: Mapped[date] = Column(Date) # type: ignore
    data_fim: Mapped[date | None] = Column(Date, nullable=True) # type: ignore
    produto_nome = Column(String(255))
    status: Mapped[StatusProducao] = Column(Enum(StatusProducao), default=StatusProducao.ativa) # type: ignore

    insumos = relationship("InsumoProducao", back_populates="producao")
    lotes = relationship("Lote", back_populates="producao")


class InsumoProducao(Base):
    __tablename__ = "insumo_producao"

    insumo_id = Column(Integer, ForeignKey("insumo.id"), primary_key=True)
    producao_id = Column(Integer, ForeignKey("producao.id"), primary_key=True)
    quantidade = Column(Integer)

    insumo = relationship("Insumo", back_populates="producoes")
    producao = relationship("Producao", back_populates="insumos")


class Lote(Base):
    __tablename__ = "lote"

    fazenda_id = Column(Integer, ForeignKey("fazenda.id"), nullable=True)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    produto_id = Column(Integer, ForeignKey("produto.id"))
    quantidade = Column(Integer, default=0)
    producao_id = Column(Integer, ForeignKey("producao.id"), nullable=True)
    status: Mapped[StatusLote] = Column(Enum(StatusLote), default=StatusLote.disponivel) # type: ignore
    data_validade: Mapped[date | None] = Column(Date, nullable=True) # type: ignore

    produto = relationship("Produto", back_populates="lotes")
    producao = relationship("Producao", back_populates="lotes")
    itens_venda = relationship("ItemVenda", back_populates="lote")


class Cliente(Base):
    __tablename__ = "cliente"

    fazenda_id = Column(Integer, ForeignKey("fazenda.id"), nullable=True)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(255))
    telefone1 = Column(String(20))
    telefone2 = Column(String(20), nullable=True)
    cnpj = Column(String(18), nullable=True)
    cpf = Column(String(14), nullable=True)
    ie = Column(String(9), nullable=True)
    email = Column(String(100))
    numero_endereco = Column(Integer, nullable=True)
    nome_endereco = Column(String(150), nullable=True)
    bairro = Column(String(50), nullable=True)
    cidade = Column(String(30), nullable=True)
    estado = Column(String(2), nullable=True)
    cep = Column(String(10), nullable=True)
    tipo = Column(Enum(TipoCliente), default=TipoCliente.fisico)
    status = Column(Enum(StatusGeral), default=StatusGeral.ativo)

    vendas = relationship("Venda", back_populates="cliente")


class Venda(Base):
    __tablename__ = "venda"

    fazenda_id = Column(Integer, ForeignKey("fazenda.id"), nullable=True)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    numero = Column(String(30), unique=True)
    info_adicionais = Column(Text, nullable=True)
    data_venda = Column(DateTime, default=datetime.utcnow)
    cliente_id = Column(Integer, ForeignKey("cliente.id"))
    status = Column(Enum(StatusVenda), default=StatusVenda.em_andamento)

    cliente = relationship("Cliente", back_populates="vendas")
    itens = relationship("ItemVenda", back_populates="venda", cascade="all, delete-orphan")


class ItemVenda(Base):
    __tablename__ = "item_venda"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    venda_id = Column(Integer, ForeignKey("venda.id"))
    lote_id = Column(Integer, ForeignKey("lote.id"))
    quantidade = Column(Integer)
    valor_total = Column(Numeric(9, 2))

    venda = relationship("Venda", back_populates="itens")
    lote = relationship("Lote", back_populates="itens_venda")


# --------------------------------------------------------------------------- #
# Notificação                                                                   #
# --------------------------------------------------------------------------- #


class Notificacao(Base):
    __tablename__ = "notificacao"

    fazenda_id = Column(Integer, ForeignKey("fazenda.id"), nullable=True)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tipo = Column(String(20), nullable=False) # critico, alerta, info
    titulo = Column(String(100), nullable=False)
    mensagem = Column(Text, nullable=False)
    entidade = Column(String(50), nullable=False)
    entidade_id = Column(Integer, nullable=True)
    acao_requerida = Column(String(50), nullable=True)
    status = Column(Enum(StatusNotificacao), default=StatusNotificacao.pendente)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    data_resolucao = Column(DateTime, nullable=True)
    usuario_id = Column(String(8), ForeignKey("usuario.id_usuario"), nullable=True)


# --------------------------------------------------------------------------- #
# Enums — Sensores & Irrigação                                                  #
# --------------------------------------------------------------------------- #


class TipoSensor(str, enum.Enum):
    temperatura = "temperatura"
    umidade = "umidade"
    ph = "pH"
    luminosidade = "luminosidade"


class StatusSensor(str, enum.Enum):
    online = "online"
    offline = "offline"
    manutencao = "manutenção"


class StatusIrrigacao(str, enum.Enum):
    ativa = "ativa"
    inativa = "inativa"
    manutencao = "manutenção"


class TipoIrrigacao(str, enum.Enum):
    manual = "manual"
    automatico = "automático"


# --------------------------------------------------------------------------- #
# Models — Sensores                                                             #
# --------------------------------------------------------------------------- #


class Sensor(Base):
    __tablename__ = "sensor"

    fazenda_id = Column(Integer, ForeignKey("fazenda.id"), nullable=True)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(100), nullable=False)
    tipo = Column(Enum(TipoSensor), nullable=False)
    localizacao = Column(String(150))
    unidade = Column(String(20))  # °C, %, pH, lux
    status = Column(Enum(StatusSensor), default=StatusSensor.online)
    data_instalacao = Column(Date, nullable=True)

    leituras = relationship("LeituraSensor", back_populates="sensor", cascade="all, delete-orphan")


class LeituraSensor(Base):
    __tablename__ = "leitura_sensor"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sensor_id = Column(Integer, ForeignKey("sensor.id"), nullable=False)
    valor = Column(Float, nullable=False)
    data_hora = Column(DateTime, default=datetime.utcnow, nullable=False)

    sensor = relationship("Sensor", back_populates="leituras")


# --------------------------------------------------------------------------- #
# Models — Irrigação                                                            #
# --------------------------------------------------------------------------- #


class ZonaIrrigacao(Base):
    __tablename__ = "zona_irrigacao"

    fazenda_id = Column(Integer, ForeignKey("fazenda.id"), nullable=True)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(100), nullable=False)
    tipo_sistema = Column(String(50))  # gotejamento, aspersão, microaspersão
    area_m2 = Column(Float, default=0)
    status = Column(Enum(StatusIrrigacao), default=StatusIrrigacao.ativa)

    eventos = relationship("EventoIrrigacao", back_populates="zona", cascade="all, delete-orphan")


class EventoIrrigacao(Base):
    __tablename__ = "evento_irrigacao"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    zona_id = Column(Integer, ForeignKey("zona_irrigacao.id"), nullable=False)
    data_inicio = Column(DateTime, nullable=False)
    data_fim = Column(DateTime, nullable=True)
    volume_litros = Column(Float, default=0)
    tipo = Column(Enum(TipoIrrigacao), default=TipoIrrigacao.automatico)

    zona = relationship("ZonaIrrigacao", back_populates="eventos")


# --------------------------------------------------------------------------- #
# Models — Energia                                                              #
# --------------------------------------------------------------------------- #


class ConsumoEnergia(Base):
    __tablename__ = "consumo_energia"

    fazenda_id = Column(Integer, ForeignKey("fazenda.id"), nullable=True)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    data = Column(Date, nullable=False)
    consumo_kwh = Column(Float, nullable=False)
    custo_reais = Column(Float, nullable=True)
    fonte = Column(String(50), default="rede")  # rede, solar, gerador
