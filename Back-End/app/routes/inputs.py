from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.routes.auth import get_current_user, get_current_fazenda_id

router = APIRouter(prefix="/api/inputs", tags=["Insumos"])


def _atualizar_validade(insumo: models.Insumo):
    """Verifica e atualiza o status de validade do insumo."""
    if insumo.data_validade and insumo.data_validade <= date.today():
        insumo.validade = models.ValidadeInsumo.vencido
    elif insumo.quantidade_insumo <= 0:
        insumo.validade = models.ValidadeInsumo.esgotado
    else:
        insumo.validade = models.ValidadeInsumo.disponivel


def _enrich(insumo: models.Insumo) -> schemas.InsumoResponse:
    return schemas.InsumoResponse(
        id=insumo.id,
        nome_insumo=insumo.nome_insumo,
        quantidade_insumo=insumo.quantidade_insumo,
        validade=insumo.validade,
        data_validade=insumo.data_validade,
        fornecedor_cnpj=insumo.fornecedor_cnpj,
        fornecedor_nome=insumo.fornecedor.nome if insumo.fornecedor else None,
    )


@router.get("/", response_model=list[schemas.InsumoResponse])
def listar(db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    insumos = db.query(models.Insumo).all()
    return [_enrich(i) for i in insumos]


@router.get("/{insumo_id}", response_model=schemas.InsumoResponse)
def buscar(insumo_id: int, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    i = db.query(models.Insumo).filter(models.Insumo.id == insumo_id).first()
    if not i:
        raise HTTPException(status_code=404, detail="Insumo não encontrado")
    return _enrich(i)


@router.post("/", response_model=schemas.InsumoResponse, status_code=status.HTTP_201_CREATED)
def criar(payload: schemas.InsumoCreate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    insumo = models.Insumo(**payload.model_dump())
    _atualizar_validade(insumo)
    db.add(insumo)
    db.commit()
    db.refresh(insumo)
    return _enrich(insumo)


@router.put("/{insumo_id}", response_model=schemas.InsumoResponse)
def atualizar(insumo_id: int, payload: schemas.InsumoUpdate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    i = db.query(models.Insumo).filter(models.Insumo.id == insumo_id).first()
    if not i:
        raise HTTPException(status_code=404, detail="Insumo não encontrado")
    for campo, valor in payload.model_dump(exclude_none=True).items():
        setattr(i, campo, valor)
    _atualizar_validade(i)
    db.commit()
    db.refresh(i)
    return _enrich(i)


@router.delete("/{insumo_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(insumo_id: int, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    i = db.query(models.Insumo).filter(models.Insumo.id == insumo_id).first()
    if not i:
        raise HTTPException(status_code=404, detail="Insumo não encontrado")
    db.delete(i)
    db.commit()
