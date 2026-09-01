"""Endpoint de dashboard com estatísticas agregadas para o frontend."""

from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.routes.auth import get_current_user, get_current_fazenda_id

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    hoje = date.today()

    # Contadores principais
    total_producoes_ativas = db.query(func.count(models.Producao.id)).filter(
        models.Producao.status == models.StatusProducao.ativa
    ).scalar() or 0

    total_fornecedores = db.query(func.count(models.Fornecedor.cnpj)).scalar() or 0
    total_clientes = db.query(func.count(models.Cliente.id)).scalar() or 0

    total_vendas_andamento = db.query(func.count(models.Venda.id)).filter(
        models.Venda.status == models.StatusVenda.em_andamento
    ).scalar() or 0

    total_insumos = db.query(func.count(models.Insumo.id)).scalar() or 0

    total_insumos_criticos = db.query(func.count(models.Insumo.id)).filter(
        (models.Insumo.validade == models.ValidadeInsumo.vencido) |
        (models.Insumo.validade == models.ValidadeInsumo.esgotado) |
        (models.Insumo.quantidade_insumo <= 10)
    ).scalar() or 0

    total_lotes_disponiveis = db.query(func.count(models.Lote.id)).filter(
        models.Lote.status == models.StatusLote.disponivel
    ).scalar() or 0

    receita_total = db.query(func.sum(models.ItemVenda.valor_total)).scalar() or 0

    # Produções por status
    producoes_por_status = {}
    for status in models.StatusProducao:
        count = db.query(func.count(models.Producao.id)).filter(
            models.Producao.status == status
        ).scalar() or 0
        producoes_por_status[status.value] = count

    # Vendas por status
    vendas_por_status = {}
    for status in models.StatusVenda:
        count = db.query(func.count(models.Venda.id)).filter(
            models.Venda.status == status
        ).scalar() or 0
        vendas_por_status[status.value] = count

    # Helper to calculate last 6 months properly
    target_months = []
    for i in range(5, -1, -1):
        m = hoje.month - i
        y = hoje.year
        if m <= 0:
            m += 12
            y -= 1
        target_months.append((m, y))

    # Produção mensal (últimos 6 meses)
    producao_mensal = []
    meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    for mes_num, ano in target_months:
        count = db.query(func.count(models.Producao.id)).filter(
            func.extract("month", models.Producao.data_inicio) == mes_num,
            func.extract("year", models.Producao.data_inicio) == ano,
        ).scalar() or 0
        producao_mensal.append({"mes": meses[mes_num - 1], "count": count})

    # Vendas mensal (últimos 6 meses)
    vendas_mensal = []
    for mes_num, ano in target_months:
        vendas_mes = db.query(models.Venda).filter_by(fazenda_id=fazenda_id).filter(
            func.extract("month", models.Venda.data_venda) == mes_num,
            func.extract("year", models.Venda.data_venda) == ano,
            models.Venda.status != models.StatusVenda.cancelado
        ).all()
        valor = 0
        for v in vendas_mes:
            for item in v.itens:
                valor += float(item.valor_total or 0)
        vendas_mensal.append({"mes": meses[mes_num - 1], "valor": round(valor, 2)})

    # Insumos por fornecedor
    insumos_por_fornecedor = []
    fornecedores = db.query(models.Fornecedor).filter_by(fazenda_id=fazenda_id).all()
    for f in fornecedores:
        count = db.query(func.count(models.Insumo.id)).filter(
            models.Insumo.fornecedor_cnpj == f.cnpj
        ).scalar() or 0
        if count > 0:
            insumos_por_fornecedor.append({"fornecedor": f.nome, "count": count})

    # Top produtos por estoque
    top_produtos = []
    lotes = db.query(
        models.Lote.produto_id,
        func.sum(models.Lote.quantidade).label("total")
    ).filter(
        models.Lote.status == models.StatusLote.disponivel
    ).group_by(models.Lote.produto_id).order_by(func.sum(models.Lote.quantidade).desc()).limit(5).all()

    for lote in lotes:
        produto = db.query(models.Produto).filter_by(fazenda_id=fazenda_id).filter(models.Produto.id == lote.produto_id).first()
        if produto:
            top_produtos.append({"nome": produto.nome_produto, "quantidade": lote.total})

    # Sensores resumo
    total_sensores = db.query(func.count(models.Sensor.id)).scalar() or 0
    sensores_online = db.query(func.count(models.Sensor.id)).filter(
        models.Sensor.status == models.StatusSensor.online
    ).scalar() or 0

    # Irrigação resumo
    total_zonas = db.query(func.count(models.ZonaIrrigacao.id)).scalar() or 0
    volume_agua_hoje = db.query(func.sum(models.EventoIrrigacao.volume_litros)).filter(
        func.date(models.EventoIrrigacao.data_inicio) == hoje
    ).scalar() or 0

    volume_agua_semana = db.query(func.sum(models.EventoIrrigacao.volume_litros)).filter(
        func.date(models.EventoIrrigacao.data_inicio) >= hoje - timedelta(days=7)
    ).scalar() or 0

    # Energia resumo
    energia_hoje = db.query(func.sum(models.ConsumoEnergia.consumo_kwh)).filter(
        models.ConsumoEnergia.data == hoje,
        models.ConsumoEnergia.fonte == "rede"
    ).scalar() or 0

    energia_solar_hoje = db.query(func.sum(models.ConsumoEnergia.consumo_kwh)).filter(
        models.ConsumoEnergia.data == hoje,
        models.ConsumoEnergia.fonte == "solar"
    ).scalar() or 0

    # Alertas
    alertas_criticos = total_insumos_criticos
    producoes_atrasadas = db.query(func.count(models.Producao.id)).filter(
        models.Producao.status == models.StatusProducao.ativa,
        models.Producao.data_fim < hoje
    ).scalar() or 0
    alertas_criticos += producoes_atrasadas

    return {
        "total_producoes_ativas": total_producoes_ativas,
        "total_fornecedores": total_fornecedores,
        "total_clientes": total_clientes,
        "total_vendas_andamento": total_vendas_andamento,
        "total_insumos": total_insumos,
        "total_insumos_criticos": total_insumos_criticos,
        "total_lotes_disponiveis": total_lotes_disponiveis,
        "receita_total": float(receita_total),
        "alertas_criticos": alertas_criticos,
        "producoes_por_status": producoes_por_status,
        "vendas_por_status": vendas_por_status,
        "producao_mensal": producao_mensal,
        "vendas_mensal": vendas_mensal,
        "insumos_por_fornecedor": insumos_por_fornecedor,
        "top_produtos": top_produtos,
        "sensores": {"total": total_sensores, "online": sensores_online},
        "irrigacao": {
            "total_zonas": total_zonas,
            "volume_hoje_litros": round(volume_agua_hoje, 2),
            "volume_semana_litros": round(volume_agua_semana, 2),
        },
        "energia": {
            "consumo_rede_hoje_kwh": round(energia_hoje, 2),
            "geracao_solar_hoje_kwh": round(energia_solar_hoje, 2),
        },
    }
