from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.routes.auth import get_current_user, get_current_fazenda_id

router = APIRouter(prefix="/api/batches", tags=["Lotes"])


def _atualizar_status_lote(lote: models.Lote):
    if lote.data_validade and lote.data_validade <= date.today():
        lote.status = models.StatusLote.vencido
    elif lote.quantidade <= 0:
        lote.status = models.StatusLote.esgotado
    else:
        lote.status = models.StatusLote.disponivel


def _enrich(lote: models.Lote) -> schemas.LoteResponse:
    return schemas.LoteResponse(
        id=lote.id,
        produto_id=lote.produto_id,
        quantidade=lote.quantidade,
        producao_id=lote.producao_id,
        status=lote.status,
        data_validade=lote.data_validade,
        produto_nome=lote.produto.nome_produto if lote.produto else None,
    )


@router.get("/", response_model=list[schemas.LoteResponse])
def listar(db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    lotes = db.query(models.Lote).all()
    return [_enrich(l) for l in lotes]


@router.get("/{lote_id}", response_model=schemas.LoteResponse)
def buscar(lote_id: int, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    l = db.query(models.Lote).filter(models.Lote.id == lote_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lote não encontrado")
    return _enrich(l)


@router.post("/", response_model=schemas.LoteResponse, status_code=status.HTTP_201_CREATED)
def criar(payload: schemas.LoteCreate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    lote = models.Lote(**payload.model_dump())
    _atualizar_status_lote(lote)
    db.add(lote)
    db.commit()
    db.refresh(lote)
    return _enrich(lote)


@router.put("/{lote_id}", response_model=schemas.LoteResponse)
def atualizar(lote_id: int, payload: schemas.LoteUpdate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    l = db.query(models.Lote).filter(models.Lote.id == lote_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lote não encontrado")
    for campo, valor in payload.model_dump(exclude_none=True).items():
        setattr(l, campo, valor)
    _atualizar_status_lote(l)
    db.commit()
    db.refresh(l)
    return _enrich(l)


@router.delete("/{lote_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(lote_id: int, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    l = db.query(models.Lote).filter(models.Lote.id == lote_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lote não encontrado")
    db.delete(l)
    db.commit()
