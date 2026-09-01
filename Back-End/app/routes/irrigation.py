from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.routes.auth import get_current_user, get_current_fazenda_id

router = APIRouter(prefix="/api/irrigation", tags=["Irrigação"])


# --------------------------------------------------------------------------- #
# Zonas de Irrigação                                                            #
# --------------------------------------------------------------------------- #


@router.get("/zones", response_model=list[schemas.ZonaComEstatisticasResponse])
def listar_zonas(db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    zonas = db.query(models.ZonaIrrigacao).all()
    result = []
    for z in zonas:
        total_eventos = (
            db.query(func.count(models.EventoIrrigacao.id))
            .filter(models.EventoIrrigacao.zona_id == z.id)
            .scalar() or 0
        )
        volume_total = (
            db.query(func.sum(models.EventoIrrigacao.volume_litros))
            .filter(models.EventoIrrigacao.zona_id == z.id)
            .scalar() or 0
        )
        ultimo = (
            db.query(models.EventoIrrigacao)
            .filter(models.EventoIrrigacao.zona_id == z.id)
            .order_by(desc(models.EventoIrrigacao.data_inicio))
            .first()
        )
        result.append(
            schemas.ZonaComEstatisticasResponse(
                id=z.id,
                nome=z.nome,
                tipo_sistema=z.tipo_sistema,
                area_m2=z.area_m2,
                status=z.status,
                total_eventos=total_eventos,
                volume_total_litros=round(volume_total, 2),
                ultimo_evento=ultimo.data_inicio if ultimo else None,
            )
        )
    return result


@router.post("/zones", response_model=schemas.ZonaIrrigacaoResponse, status_code=status.HTTP_201_CREATED)
def criar_zona(payload: schemas.ZonaIrrigacaoCreate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    zona = models.ZonaIrrigacao(**payload.model_dump())
    db.add(zona)
    db.commit()
    db.refresh(zona)
    return zona


@router.put("/zones/{zona_id}", response_model=schemas.ZonaIrrigacaoResponse)
def atualizar_zona(zona_id: int, payload: schemas.ZonaIrrigacaoUpdate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    z = db.query(models.ZonaIrrigacao).filter(models.ZonaIrrigacao.id == zona_id).first()
    if not z:
        raise HTTPException(status_code=404, detail="Zona de irrigação não encontrada")
    for campo, valor in payload.model_dump(exclude_none=True).items():
        setattr(z, campo, valor)
    db.commit()
    db.refresh(z)
    return z


@router.delete("/zones/{zona_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_zona(zona_id: int, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    z = db.query(models.ZonaIrrigacao).filter(models.ZonaIrrigacao.id == zona_id).first()
    if not z:
        raise HTTPException(status_code=404, detail="Zona de irrigação não encontrada")
    db.delete(z)
    db.commit()


# --------------------------------------------------------------------------- #
# Eventos de Irrigação                                                          #
# --------------------------------------------------------------------------- #


@router.get("/events", response_model=list[schemas.EventoIrrigacaoResponse])
def listar_eventos(
    zona_id: int | None = None,
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    fazenda_id: int = Depends(get_current_fazenda_id),
):
    query = db.query(models.EventoIrrigacao)
    if zona_id:
        query = query.filter(models.EventoIrrigacao.zona_id == zona_id)
    eventos = query.order_by(desc(models.EventoIrrigacao.data_inicio)).limit(limit).all()
    return [
        schemas.EventoIrrigacaoResponse(
            id=e.id,
            zona_id=e.zona_id,
            zona_nome=e.zona.nome if e.zona else None,
            data_inicio=e.data_inicio,
            data_fim=e.data_fim,
            volume_litros=e.volume_litros,
            tipo=e.tipo,
        )
        for e in eventos
    ]


@router.post("/events", response_model=schemas.EventoIrrigacaoResponse, status_code=status.HTTP_201_CREATED)
def criar_evento(payload: schemas.EventoIrrigacaoCreate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    z = db.query(models.ZonaIrrigacao).filter(models.ZonaIrrigacao.id == payload.zona_id).first()
    if not z:
        raise HTTPException(status_code=404, detail="Zona de irrigação não encontrada")
    evento = models.EventoIrrigacao(**payload.model_dump())
    db.add(evento)
    db.commit()
    db.refresh(evento)
    return schemas.EventoIrrigacaoResponse(
        id=evento.id,
        zona_id=evento.zona_id,
        zona_nome=z.nome,
        data_inicio=evento.data_inicio,
        data_fim=evento.data_fim,
        volume_litros=evento.volume_litros,
        tipo=evento.tipo,
    )
