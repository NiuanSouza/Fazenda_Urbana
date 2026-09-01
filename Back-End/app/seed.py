"""
Popula o banco de dados com dados iniciais baseados no CityGreen.sql original.
Execute com:  python -m app.seed
"""
from datetime import date

from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app.models import (
    Cliente,
    Fornecedor,
    Funcionalidade,
    Insumo,
    InsumoProducao,
    ItemVenda,
    Lote,
    Producao,
    Produto,
    StatusGeral,
    StatusLote,
    StatusProducao,
    StatusVenda,
    TipoCliente,
    Usuario,
    UsuarioFuncionalidade,
    ValidadeInsumo,
    Venda,
    ZonaIrrigacao,
    EventoIrrigacao,
    Notificacao,
    StatusIrrigacao,
    TipoIrrigacao,
    StatusNotificacao,
)


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if db.query(Usuario).count() > 0:
            print("Banco já populado. Pulando seed.")
            return

        # Funcionalidades
        funcs = {
            "Fornecedores": Funcionalidade(nome="Fornecedores"),
            "Vendas": Funcionalidade(nome="Vendas"),
            "Produção": Funcionalidade(nome="Produção"),
            "Administrador": Funcionalidade(nome="Administrador"),
        }
        for f in funcs.values():
            db.add(f)
        db.flush()

        # Usuários
        senha = hash_password("Troca123")
        usuarios = [
            Usuario(id_usuario="G764AE9", nome="Maria Clara Sousa Torres", email="maria.clara@example.com", senha_hash=senha, is_admin=False),
            Usuario(id_usuario="G783GA4", nome="Niuan Spolidorio Da Rocha Souza", email="niuan.spolidorio@example.com", senha_hash=senha, is_admin=True),
            Usuario(id_usuario="G79JBF6", nome="Gabriel Contatori de Assis", email="gabriel.contatori@example.com", senha_hash=senha),
            Usuario(id_usuario="G872EC9", nome="Sabrina Aparecida V Da Silva", email="sabrina.silva@example.com", senha_hash=senha),
            Usuario(id_usuario="N3573A1", nome="Matheus Rafael Da Silva Jesus", email="matheus.jesus@example.com", senha_hash=senha),
            Usuario(id_usuario="G71GEG3", nome="Victor Hugo Rodrigues Barros Antunes", email="victor.antunes@example.com", senha_hash=senha),
        ]
        for u in usuarios:
            db.add(u)
        db.flush()

        # Permissões
        permissoes = [
            ("G783GA4", "Fornecedores"), ("G764AE9", "Fornecedores"),
            ("G783GA4", "Vendas"), ("G79JBF6", "Vendas"),
            ("G783GA4", "Produção"), ("N3573A1", "Produção"),
            ("G783GA4", "Administrador"), ("G71GEG3", "Administrador"),
        ]
        for uid, fname in permissoes:
            db.add(UsuarioFuncionalidade(usuario_id=uid, funcionalidade_id=funcs[fname].id))
        db.flush()

        # Fornecedores
        forn_map = {}
        fornecedores_data = [
            Fornecedor(cnpj="12345678000195", nome="Fazenda Verde", razao_social="Agronegócios Fazenda Verde Ltda", telefone1="11-98765-4321", email="contato@fazendaverde.com", tipo="Produtor", endereco="Rua das Flores", numero_endereco=123, bairro="Jardim das Plantas", cidade="São Paulo", estado="SP", cep="01234-567"),
            Fornecedor(cnpj="98765432000107", nome="Hortifruti Natural", razao_social="Hortifruti Natural Ltda", telefone1="21-97654-3210", email="contato@hortifrutinhatural.com", tipo="Distribuidor", inf_adicionais="Entregas diárias", endereco="Avenida Verde", numero_endereco=456, bairro="Centro", cidade="Rio de Janeiro", estado="RJ", cep="02345-678"),
            Fornecedor(cnpj="45678912000145", nome="Sementes do Brasil", razao_social="Sementes do Brasil Ltda", telefone1="31-98765-4321", email="contato@sementesbrasil.com", tipo="Fornecedor", inf_adicionais="Sementes orgânicas", endereco="Rua das Sementes", numero_endereco=789, bairro="Vila Verde", cidade="Belo Horizonte", estado="MG", cep="03456-789"),
        ]
        for f in fornecedores_data:
            f.cnpj = f.cnpj.replace('.', '').replace('/', '').replace('-', '')
            db.add(f)
            forn_map[f.cnpj] = f
        db.flush()

        # Insumos
        insumos = [
            Insumo(nome_insumo="Fertilizante Orgânico", quantidade_insumo=100, data_validade=date(2025, 12, 31), fornecedor_cnpj="12345678000195"),
            Insumo(nome_insumo="Agrotóxico Natural", quantidade_insumo=50, data_validade=date(2026, 6, 30), fornecedor_cnpj="98765432000107"),
            Insumo(nome_insumo="Semente de Tomate", quantidade_insumo=200, data_validade=date(2026, 5, 15), fornecedor_cnpj="45678912000145"),
            Insumo(nome_insumo="Semente de Alface", quantidade_insumo=150, data_validade=date(2026, 7, 20), fornecedor_cnpj="45678912000145"),
            Insumo(nome_insumo="Semente de Morango", quantidade_insumo=300, data_validade=date(2026, 8, 10), fornecedor_cnpj="12345678000195"),
        ]
        for i in insumos:
            if i.data_validade and i.data_validade <= date.today():
                i.validade = ValidadeInsumo.vencido
            db.add(i)
        db.flush()

        # Produtos
        produtos = [
            Produto(nome_produto="Tomate Cereja", categoria="Vegetal"),
            Produto(nome_produto="Alface", categoria="Vegetal"),
            Produto(nome_produto="Manjericão", categoria="Erva"),
            Produto(nome_produto="Morango", categoria="Fruta"),
            Produto(nome_produto="Rúcula", categoria="Vegetal"),
            Produto(nome_produto="Cebolinha", categoria="Erva"),
            Produto(nome_produto="Pimentão", categoria="Vegetal"),
            Produto(nome_produto="Espinafre", categoria="Vegetal"),
            Produto(nome_produto="Cenoura", categoria="Vegetal"),
            Produto(nome_produto="Pepino", categoria="Vegetal"),
        ]
        for p in produtos:
            db.add(p)
        db.flush()

        # Produção
        producoes = [
            Producao(data_inicio=date(2026, 1, 10), data_fim=date(2026, 4, 15), produto_nome="Tomate", status=StatusProducao.ativa),
            Producao(data_inicio=date(2026, 2, 15), data_fim=date(2026, 5, 20), produto_nome="Alface", status=StatusProducao.ativa),
            Producao(data_inicio=date(2026, 3, 1), data_fim=date(2026, 6, 1), produto_nome="Morango", status=StatusProducao.ativa),
            Producao(data_inicio=date(2026, 4, 1), data_fim=date(2026, 7, 10), produto_nome="Cenoura", status=StatusProducao.cancelada),
            Producao(data_inicio=date(2026, 5, 15), data_fim=date(2026, 8, 30), produto_nome="Pimentão", status=StatusProducao.ativa),
        ]
        for p in producoes:
            db.add(p)
        db.flush()

        # InsumoProducao
        relacoes = [(1, 1, 10), (2, 2, 5), (3, 1, 20), (4, 3, 15), (5, 5, 25)]
        for insumo_id, producao_id, qtd in relacoes:
            db.add(InsumoProducao(insumo_id=insumo_id, producao_id=producao_id, quantidade=qtd))
        db.flush()

        # Lotes
        lotes = [
            Lote(produto_id=1, quantidade=50, producao_id=1, status=StatusLote.disponivel, data_validade=date(2027, 1, 1)),
            Lote(produto_id=2, quantidade=30, producao_id=2, status=StatusLote.disponivel, data_validade=date(2027, 2, 1)),
            Lote(produto_id=3, quantidade=40, producao_id=3, status=StatusLote.disponivel, data_validade=date(2027, 3, 1)),
            Lote(produto_id=4, quantidade=0, producao_id=4, status=StatusLote.esgotado, data_validade=date(2025, 1, 1)),
            Lote(produto_id=5, quantidade=10, producao_id=5, status=StatusLote.disponivel, data_validade=date(2027, 4, 1)),
        ]
        for l in lotes:
            db.add(l)
        db.flush()

        # Clientes
        clientes = [
            Cliente(nome="Supermercado Verde", telefone1="11-91234-5678", cnpj="12345678000195", ie="IE123456", email="contato@supermercadoverde.com", numero_endereco=100, nome_endereco="Rua do Comércio", bairro="Centro", cidade="São Paulo", estado="SP", cep="01000-000", tipo=TipoCliente.juridico),
            Cliente(nome="Empório Natural", telefone1="21-92345-6789", cnpj="98765432000107", email="contato@emporionatural.com", numero_endereco=200, nome_endereco="Avenida da Saúde", bairro="Bela Vista", cidade="Rio de Janeiro", estado="RJ", cep="02000-000", tipo=TipoCliente.juridico),
            Cliente(nome="Distribuidora Boa Sorte", telefone1="41-94456-7890", cnpj="11223344000190", email="contato@boasorte.com", numero_endereco=400, nome_endereco="Rua da Esperança", bairro="Centro", cidade="Curitiba", estado="PR", cep="04000-000", tipo=TipoCliente.juridico),
            Cliente(nome="Ana Paula Silva", telefone1="11-91234-5678", cpf="12345678901", email="anapaula@exemplo.com", numero_endereco=101, nome_endereco="Rua das Flores", bairro="Jardim Primavera", cidade="São Paulo", estado="SP", cep="01100-000", tipo=TipoCliente.fisico),
            Cliente(nome="Carlos Alberto Santos", telefone1="21-92345-6789", cpf="98765432100", email="carlos@exemplo.com", numero_endereco=202, nome_endereco="Avenida dos Anjos", bairro="Centro", cidade="Rio de Janeiro", estado="RJ", cep="02100-000", tipo=TipoCliente.fisico),
        ]
        for c in clientes:
            db.add(c)
        db.flush()

        # Vendas
        vendas = [
            Venda(numero="VEN001", info_adicionais="Venda de produtos frescos", cliente_id=1, status=StatusVenda.em_andamento),
            Venda(numero="VEN002", info_adicionais="Compra de produtos orgânicos", cliente_id=2, status=StatusVenda.entregue),
            Venda(numero="VEN003", info_adicionais="Pedido de frutas e verduras", cliente_id=3, status=StatusVenda.cancelado),
        ]
        for v in vendas:
            db.add(v)
        db.flush()

        # Itens de venda
        itens = [
            ItemVenda(venda_id=1, lote_id=1, quantidade=10, valor_total=150.00),
            ItemVenda(venda_id=2, lote_id=2, quantidade=5, valor_total=250.00),
            ItemVenda(venda_id=3, lote_id=3, quantidade=20, valor_total=500.00),
        ]
        for item in itens:
            db.add(item)
        db.flush()

        # Zonas de Irrigação
        zonas = [
            ZonaIrrigacao(nome="Estufa A", tipo_sistema="gotejamento", area_m2=500.0, status=StatusIrrigacao.ativa),
            ZonaIrrigacao(nome="Campo Aberto B", tipo_sistema="aspersão", area_m2=1500.0, status=StatusIrrigacao.ativa),
        ]
        for z in zonas:
            db.add(z)
        db.flush()

        # Eventos de Irrigação (Injeção de Água)
        eventos_irrigacao = [
            EventoIrrigacao(zona_id=1, data_inicio=date(2026, 5, 20), data_fim=date(2026, 5, 20), volume_litros=150.0, tipo=TipoIrrigacao.automatico),
            EventoIrrigacao(zona_id=2, data_inicio=date(2026, 5, 21), data_fim=date(2026, 5, 21), volume_litros=300.0, tipo=TipoIrrigacao.manual),
        ]
        for ev in eventos_irrigacao:
            db.add(ev)
        db.flush()

        # Alertas Críticos (Notificações)
        notificacoes = [
            Notificacao(tipo="critico", titulo="Umidade Crítica", mensagem="Umidade do solo na Estufa A abaixo de 20%.", entidade="sensor", entidade_id=1, acao_requerida="VERIFICAR_IRRIGACAO", status=StatusNotificacao.pendente),
            Notificacao(tipo="alerta", titulo="Estoque Baixo", mensagem="O insumo 'Agrotóxico Natural' está com apenas 50 unidades.", entidade="insumo", entidade_id=2, acao_requerida="SOLICITAR_COMPRA", status=StatusNotificacao.lida),
            Notificacao(tipo="critico", titulo="Temperatura Elevada", mensagem="Temperatura na Estufa A ultrapassou 35°C.", entidade="sensor", entidade_id=1, acao_requerida="LIGAR_VENTILACAO", status=StatusNotificacao.pendente),
        ]
        for notif in notificacoes:
            db.add(notif)


        db.commit()
        print("✅ Seed concluído com sucesso!")

    except Exception as e:
        db.rollback()
        print(f"❌ Erro no seed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
