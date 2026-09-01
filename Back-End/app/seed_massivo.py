"""
Script para inserção massiva de dados com histórico desde 2024.
Execute com:  python -m app.seed_massivo
"""
import random
import pandas as pd
from datetime import date, datetime, timedelta
from faker import Faker

from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app.models import (
    Fazenda, Usuario, UsuarioFazenda, RoleUsuario, StatusGeral,
    Fornecedor, Insumo, Produto, Producao, Lote, Cliente, Venda, ItemVenda,
    Sensor, LeituraSensor, ZonaIrrigacao, TipoSensor, StatusSensor, StatusIrrigacao,
    ValidadeInsumo, StatusProducao, StatusLote, StatusVenda, TipoCliente,
    ConsumoEnergia, Notificacao, StatusNotificacao
)

fake = Faker('pt_BR')

def random_date_since_2024():
    start_date = date(2024, 1, 1)
    end_date = date.today()
    delta = end_date - start_date
    random_days = random.randrange(delta.days + 1)
    return start_date + timedelta(days=random_days)

def random_datetime_since_2024():
    start_dt = datetime(2024, 1, 1)
    end_dt = datetime.utcnow()
    delta = end_dt - start_dt
    random_seconds = random.randrange(int(delta.total_seconds()) + 1)
    return start_dt + timedelta(seconds=random_seconds)

def seed_massivo():
    print("Iniciando seed massivo desde 2024... Isso pode demorar alguns minutos.")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Limpando banco de dados existente...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        
        senha_padrao = hash_password("Troca123")

        # 1. Criar Fazendas
        fazendas = [
            Fazenda(nome="Fazenda Principal Green City", cnpj=fake.cnpj(), endereco=fake.address()),
            Fazenda(nome="Fazenda Zona Sul", cnpj=fake.cnpj(), endereco=fake.address()),
            Fazenda(nome="Fazenda Parceira Horti", cnpj=fake.cnpj(), endereco=fake.address())
        ]
        db.add_all(fazendas)
        db.flush()

        # 2. Criar Usuários Específicos
        admin = Usuario(id_usuario="ADMIN01", nome="Admin Silva", email="admin@green.com", senha_hash=senha_padrao, is_admin=True)
        tecnico = Usuario(id_usuario="TEC01", nome="Técnico João", email="tecnico@green.com", senha_hash=senha_padrao, is_admin=False)
        db.add_all([admin, tecnico])
        db.flush()

        # Vincular usuários
        db.add(UsuarioFazenda(usuario_id=admin.id_usuario, fazenda_id=fazendas[0].id, role=RoleUsuario.admin))
        db.add(UsuarioFazenda(usuario_id=tecnico.id_usuario, fazenda_id=fazendas[0].id, role=RoleUsuario.operador))
        
        db.add(UsuarioFazenda(usuario_id=admin.id_usuario, fazenda_id=fazendas[1].id, role=RoleUsuario.admin))
        db.add(UsuarioFazenda(usuario_id=admin.id_usuario, fazenda_id=fazendas[2].id, role=RoleUsuario.admin))
        db.flush()

        print("Gerando histórico de dados (2024 - Hoje) por Fazenda...")
        for fazenda in fazendas:
            # Fornecedores e Insumos (Histórico e Substituição)
            fornecedores = []
            for i in range(5):
                status_f = StatusGeral.inativo if i < 2 else StatusGeral.ativo
                cnpj_limpo = fake.cnpj().replace('.', '').replace('/', '').replace('-', '')
                f = Fornecedor(
                    fazenda_id=fazenda.id,
                    cnpj=cnpj_limpo,
                    nome=fake.company(),
                    email=fake.email(),
                    telefone1=fake.phone_number(),
                    tipo="Sementes e Adubos",
                    endereco=fake.address(),
                    status=status_f
                )
                db.add(f)
                fornecedores.append(f)
            db.flush()

            for _ in range(15):
                db.add(Insumo(
                    fazenda_id=fazenda.id,
                    nome_insumo=fake.word().capitalize(),
                    quantidade_insumo=random.randint(10, 1000),
                    validade=ValidadeInsumo.disponivel,
                    data_validade=random_date_since_2024() + timedelta(days=365),
                    fornecedor_cnpj=random.choice(fornecedores).cnpj
                ))
            db.flush()

            # Produtos
            produtos = []
            nomes_produtos = ["Alface Crespa", "Tomate Cereja", "Rúcula", "Manjericão", "Cenoura", "Morango"]
            for nome in nomes_produtos:
                p = Produto(fazenda_id=fazenda.id, nome_produto=nome, categoria="Vegetais/Frutas")
                db.add(p)
                produtos.append(p)
            db.flush()

            # Produções
            producoes = []
            for p in produtos:
                # 15 Produções históricas (Completas/Canceladas) para preencher bem o gráfico
                for _ in range(15):
                    data_inicio = random_date_since_2024()
                    prod = Producao(
                        fazenda_id=fazenda.id,
                        data_inicio=data_inicio,
                        data_fim=data_inicio + timedelta(days=random.randint(20, 45)),
                        produto_nome=p.nome_produto,
                        status=random.choice([StatusProducao.completa, StatusProducao.completa, StatusProducao.cancelada])
                    )
                    db.add(prod)
                    producoes.append(prod)
                
                # 1 Produção Ativa
                prod_ativa = Producao(
                    fazenda_id=fazenda.id,
                    data_inicio=date.today() - timedelta(days=random.randint(1, 15)),
                    data_fim=None,
                    produto_nome=p.nome_produto,
                    status=StatusProducao.ativa
                )
                db.add(prod_ativa)
                producoes.append(prod_ativa)
            db.flush()

            # Clientes (Histórico de Ativos e Inativos)
            clientes = []
            for i in range(20):
                status_c = StatusGeral.inativo if i < 5 else StatusGeral.ativo
                c = Cliente(
                    fazenda_id=fazenda.id, 
                    nome=fake.name(), 
                    telefone1=fake.phone_number(), 
                    email=fake.email(), 
                    cpf=fake.cpf(),
                    tipo=TipoCliente.fisico,
                    status=status_c
                )
                db.add(c)
                clientes.append(c)
            db.flush()

            # Sensores e Zonas de Irrigação
            zonas = []
            for i in range(3):
                z = ZonaIrrigacao(
                    fazenda_id=fazenda.id,
                    nome=f"Zona {i+1}",
                    tipo_sistema=random.choice(["Gotejamento", "Aspersão", "Microaspersão"]),
                    area_m2=random.uniform(50.0, 500.0),
                    status=StatusIrrigacao.ativa
                )
                db.add(z)
                zonas.append(z)
            db.flush()

            sensores = []
            for tipo in list(TipoSensor):
                s = Sensor(
                    fazenda_id=fazenda.id,
                    nome=f"Sensor {tipo.value} Módulo Central",
                    tipo=tipo,
                    localizacao="Estufa Central",
                    status=StatusSensor.online,
                    data_instalacao=date(2024, 1, 1)
                )
                db.add(s)
                sensores.append(s)
            db.flush()

            # Leituras IoT contínuas usando Pandas Date Range
            # Reduzido para leituras a cada 4 horas para não sobrecarregar demais no seed,
            # mas o suficiente para Pandas Analytics funcionar bem.
            date_range = pd.date_range(start="2024-01-01", end=datetime.utcnow(), freq="4h")
            leituras_lote = []
            for dt in date_range:
                for s in sensores:
                    # Simulação de variação natural
                    if s.tipo == TipoSensor.temperatura:
                        # Variação dia/noite: Mais quente de dia (hora 12 e 16), mais frio de noite
                        hora = dt.hour
                        base_temp = 25.0 if 8 <= hora <= 18 else 18.0
                        valor = random.uniform(base_temp - 2.0, base_temp + 2.0)
                    elif s.tipo == TipoSensor.umidade:
                        valor = random.uniform(50.0, 80.0)
                    elif s.tipo == TipoSensor.ph:
                        valor = random.uniform(5.5, 7.5)
                    else:
                        valor = random.uniform(200.0, 1000.0)
                    
                    leituras_lote.append(LeituraSensor(sensor_id=s.id, valor=valor, data_hora=dt.to_pydatetime()))
                    
                    if len(leituras_lote) > 5000:
                        db.add_all(leituras_lote)
                        db.flush()
                        leituras_lote = []
            
            if leituras_lote:
                db.add_all(leituras_lote)
                db.flush()

            # Lotes e Vendas Históricas
            for p in produtos:
                # Criar 5 lotes por produto
                for i in range(5):
                    data_criacao = random_date_since_2024()
                    lote = Lote(
                        fazenda_id=fazenda.id,
                        produto_id=p.id,
                        quantidade=random.randint(20, 200),
                        status=random.choice(list(StatusLote)),
                        data_validade=data_criacao + timedelta(days=30)
                    )
                    db.add(lote)
                    db.flush()

                    # Criar vendas associadas a este lote
                    for _ in range(3):
                        v = Venda(
                            fazenda_id=fazenda.id,
                            numero=fake.unique.bothify(text='VEN-24-####'),
                            cliente_id=random.choice(clientes).id,
                            status=random.choice(list(StatusVenda)),
                            data_venda=random_datetime_since_2024()
                        )
                        db.add(v)
                        db.flush()

                        iv = ItemVenda(
                            venda_id=v.id,
                            lote_id=lote.id,
                            quantidade=random.randint(1, 10),
                            valor_total=random.uniform(10.0, 150.0)
                        )
                        db.add(iv)
            db.flush()

            # Consumo Energia Mensal 2024
            for month in range(1, 13):
                db.add(ConsumoEnergia(
                    fazenda_id=fazenda.id,
                    data=date(2024, month, 1),
                    consumo_kwh=random.uniform(1000, 5000),
                    custo_reais=random.uniform(500, 2500)
                ))
            db.flush()

        db.commit()
        print("✅ Seed massivo desde 2024 concluído com sucesso!")

    except Exception as e:
        db.rollback()
        print(f"❌ Erro no seed massivo: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_massivo()
