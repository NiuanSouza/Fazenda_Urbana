from datetime import date, datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app import models, schemas
from app.database import get_db
from app.routes.auth import get_current_user, get_current_fazenda_id

router = APIRouter(prefix="/api/notifications", tags=["Notificações"])

DIAS_ALERTA_VENCIMENTO = 30
QUANTIDADE_CRITICA = 10


def _create_if_not_exists(db: Session, notification_data: dict):
    # Verifica se já existe uma notificação pendente, lida ou ignorada para essa entidade/ação
    existing = (
        db.query(models.Notificacao)
        .filter(
            models.Notificacao.entidade == notification_data["entidade"],
            models.Notificacao.entidade_id == notification_data["entidade_id"],
            models.Notificacao.acao_requerida == notification_data["acao_requerida"],
            models.Notificacao.status.in_([
                models.StatusNotificacao.pendente, 
                models.StatusNotificacao.lida, 
                models.StatusNotificacao.ignorada
            ])
        )
        .first()
    )
    if not existing:
        nova_notificacao = models.Notificacao(**notification_data)
        db.add(nova_notificacao)


@router.post("/sync", response_model=dict)
def sync_notifications(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Varre as regras de negócio e insere notificações persistentes no banco de dados"""
    hoje = date.today()
    limite = hoje + timedelta(days=DIAS_ALERTA_VENCIMENTO)

    # --- Insumos ---
    insumos = db.query(models.Insumo).all()
    for insumo in insumos:
        # Insumo Vencido
        if insumo.validade == models.ValidadeInsumo.vencido or (insumo.data_validade and insumo.data_validade <= hoje and insumo.validade != models.ValidadeInsumo.vencido):
            _create_if_not_exists(db, {
                "tipo": "critico",
                "titulo": "Insumo Vencido",
                "mensagem": f"O insumo '{insumo.nome_insumo}' está vencido e deve ser descartado.",
                "entidade": "insumo",
                "entidade_id": insumo.id,
                "acao_requerida": "DESCARTAR_INSUMO"
            })
            
        # Insumo Esgotado / Estoque Baixo
        elif insumo.validade == models.ValidadeInsumo.esgotado or insumo.quantidade_insumo == 0:
            _create_if_not_exists(db, {
                "tipo": "critico",
                "titulo": "Insumo Esgotado",
                "mensagem": f"O insumo '{insumo.nome_insumo}' está esgotado.",
                "entidade": "insumo",
                "entidade_id": insumo.id,
                "acao_requerida": "SOLICITAR_COMPRA"
            })
            
        elif insumo.quantidade_insumo <= QUANTIDADE_CRITICA and insumo.validade == models.ValidadeInsumo.disponivel:
            _create_if_not_exists(db, {
                "tipo": "alerta",
                "titulo": "Estoque Baixo de Insumo",
                "mensagem": f"O insumo '{insumo.nome_insumo}' está com apenas {insumo.quantidade_insumo} unidades.",
                "entidade": "insumo",
                "entidade_id": insumo.id,
                "acao_requerida": "SOLICITAR_COMPRA"
            })
            
        # Próximo do vencimento
        elif insumo.data_validade and hoje < insumo.data_validade <= limite:
            _create_if_not_exists(db, {
                "tipo": "alerta",
                "titulo": "Insumo Próximo do Vencimento",
                "mensagem": f"O insumo '{insumo.nome_insumo}' vence em {(insumo.data_validade - hoje).days} dias.",
                "entidade": "insumo",
                "entidade_id": insumo.id,
                "acao_requerida": "MARCAR_VENCIDO"
            })

    # --- Lotes ---
    lotes = db.query(models.Lote).all()
    for lote in lotes:
        produto_nome = lote.produto.nome_produto if lote.produto else f"Lote #{lote.id}"
        if lote.status == models.StatusLote.vencido or (lote.data_validade and lote.data_validade <= hoje and lote.status != models.StatusLote.vencido):
            _create_if_not_exists(db, {
                "tipo": "critico",
                "titulo": "Lote Vencido",
                "mensagem": f"O lote #{lote.id} do produto '{produto_nome}' está vencido.",
                "entidade": "lote",
                "entidade_id": lote.id,
                "acao_requerida": "DESCARTAR_LOTE"
            })
        elif lote.data_validade and hoje < lote.data_validade <= limite and lote.status == models.StatusLote.disponivel:
            _create_if_not_exists(db, {
                "tipo": "alerta",
                "titulo": "Lote Próximo do Vencimento",
                "mensagem": f"O lote #{lote.id} de '{produto_nome}' vence em {(lote.data_validade - hoje).days} dias.",
                "entidade": "lote",
                "entidade_id": lote.id,
                "acao_requerida": "MARCAR_VENCIDO_LOTE"
            })

    # --- Produções atrasadas ---
    producoes = db.query(models.Producao).filter(models.Producao.status == models.StatusProducao.ativa).all()
    for p in producoes:
        if p.data_fim and p.data_fim < hoje:
            _create_if_not_exists(db, {
                "tipo": "alerta",
                "titulo": "Produção Atrasada",
                "mensagem": f"A produção de '{p.produto_nome}' (ID {p.id}) está atrasada. Previsão era {p.data_fim}.",
                "entidade": "producao",
                "entidade_id": p.id,
                "acao_requerida": "CONCLUIR_PRODUCAO"
            })

    db.commit()
    return {"message": "Sincronização concluída com sucesso"}


@router.get("/", response_model=List[schemas.NotificacaoResponse])
def listar_notificacoes(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Retorna pendentes e lidas
    notificacoes = (
        db.query(models.Notificacao)
        .filter(
            models.Notificacao.status.in_([models.StatusNotificacao.pendente, models.StatusNotificacao.lida])
        )
        .order_by(models.Notificacao.data_criacao.desc())
        .all()
    )
    return notificacoes


@router.patch("/{id}/status", response_model=schemas.NotificacaoResponse)
def atualizar_status_notificacao(id: int, payload: schemas.NotificacaoUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    notificacao = db.query(models.Notificacao).filter(models.Notificacao.id == id).first()
    if not notificacao:
        raise HTTPException(status_code=404, detail="Notificação não encontrada")
    
    notificacao.status = payload.status
    if payload.status == models.StatusNotificacao.resolvida:
        notificacao.data_resolucao = datetime.utcnow()
        
    db.commit()
    db.refresh(notificacao)
    return notificacao


@router.post("/{id}/action", response_model=schemas.NotificacaoResponse)
def executar_acao_notificacao(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    notificacao = db.query(models.Notificacao).filter(models.Notificacao.id == id).first()
    if not notificacao:
        raise HTTPException(status_code=404, detail="Notificação não encontrada")
        
    acao = notificacao.acao_requerida
    entidade_id = notificacao.entidade_id
    
    if acao == "DESCARTAR_INSUMO":
        insumo = db.query(models.Insumo).filter(models.Insumo.id == entidade_id).first()
        if insumo:
            insumo.quantidade_insumo = 0
            insumo.validade = models.ValidadeInsumo.esgotado
            
    elif acao == "MARCAR_VENCIDO":
        insumo = db.query(models.Insumo).filter(models.Insumo.id == entidade_id).first()
        if insumo:
            insumo.validade = models.ValidadeInsumo.vencido
            
    elif acao == "DESCARTAR_LOTE" or acao == "MARCAR_VENCIDO_LOTE":
        lote = db.query(models.Lote).filter(models.Lote.id == entidade_id).first()
        if lote:
            lote.status = models.StatusLote.vencido
            if acao == "DESCARTAR_LOTE":
                lote.quantidade = 0
                
    elif acao == "CONCLUIR_PRODUCAO":
        producao = db.query(models.Producao).filter(models.Producao.id == entidade_id).first()
        if producao:
            producao.status = models.StatusProducao.completa
            
    elif acao == "SOLICITAR_COMPRA":
        # Ação apenas visual no front, só marcamos como resolvida no back
        pass
        
    # Resolve a notificação
    notificacao.status = models.StatusNotificacao.resolvida
    notificacao.data_resolucao = datetime.utcnow()
    
    db.commit()
    db.refresh(notificacao)
    return notificacao
