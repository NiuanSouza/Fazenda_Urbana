from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.routes.auth import get_current_user, get_current_fazenda_id

router = APIRouter(prefix="/api/energy", tags=["Energia"])


@router.get("/", response_model=list[schemas.ConsumoEnergiaResponse])
def listar_consumo(
    limit: int = Query(90, ge=1, le=365),
    db: Session = Depends(get_db),
    fazenda_id: int = Depends(get_current_fazenda_id),
):
    return (
        db.query(models.ConsumoEnergia)
        .order_by(desc(models.ConsumoEnergia.data))
        .limit(limit)
        .all()
    )


@router.post("/", response_model=schemas.ConsumoEnergiaResponse, status_code=status.HTTP_201_CREATED)
def registrar_consumo(payload: schemas.ConsumoEnergiaCreate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    consumo = models.ConsumoEnergia(**payload.model_dump())
    db.add(consumo)
    db.commit()
    db.refresh(consumo)
    return consumo


@router.delete("/{consumo_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_consumo(consumo_id: int, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    c = db.query(models.ConsumoEnergia).filter(models.ConsumoEnergia.id == consumo_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Registro de consumo não encontrado")
    db.delete(c)
    db.commit()
