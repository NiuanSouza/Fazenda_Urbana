from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.routes.auth import get_current_user, get_current_fazenda_id

router = APIRouter(prefix="/api/sensors", tags=["Sensores"])


# --------------------------------------------------------------------------- #
# Sensores                                                                      #
# --------------------------------------------------------------------------- #


@router.get("/", response_model=list[schemas.SensorComLeituraResponse])
def listar_sensores(db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    sensores = db.query(models.Sensor).filter_by(fazenda_id=fazenda_id).all()
    result = []
    for s in sensores:
        ultima = (
            db.query(models.LeituraSensor)
            .filter(models.LeituraSensor.sensor_id == s.id)
            .order_by(desc(models.LeituraSensor.data_hora))
            .first()
        )
        total = (
            db.query(func.count(models.LeituraSensor.id))
            .filter(models.LeituraSensor.sensor_id == s.id)
            .scalar()
        )
        result.append(
            schemas.SensorComLeituraResponse(
                id=s.id,
                nome=s.nome,
                tipo=s.tipo,
                localizacao=s.localizacao,
                unidade=s.unidade,
                status=s.status,
                data_instalacao=s.data_instalacao,
                ultima_leitura=ultima.valor if ultima else None,
                ultima_leitura_hora=ultima.data_hora if ultima else None,
                total_leituras=total or 0,
            )
        )
    return result


@router.get("/{sensor_id}", response_model=schemas.SensorComLeituraResponse)
def buscar_sensor(sensor_id: int, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    s = db.query(models.Sensor).filter_by(fazenda_id=fazenda_id).filter(models.Sensor.id == sensor_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Sensor não encontrado")
    ultima = (
        db.query(models.LeituraSensor)
        .filter(models.LeituraSensor.sensor_id == s.id)
        .order_by(desc(models.LeituraSensor.data_hora))
        .first()
    )
    total = (
        db.query(func.count(models.LeituraSensor.id))
        .filter(models.LeituraSensor.sensor_id == s.id)
        .scalar()
    )
    return schemas.SensorComLeituraResponse(
        id=s.id,
        nome=s.nome,
        tipo=s.tipo,
        localizacao=s.localizacao,
        unidade=s.unidade,
        status=s.status,
        data_instalacao=s.data_instalacao,
        ultima_leitura=ultima.valor if ultima else None,
        ultima_leitura_hora=ultima.data_hora if ultima else None,
        total_leituras=total or 0,
    )


@router.post("/", response_model=schemas.SensorResponse, status_code=status.HTTP_201_CREATED)
def criar_sensor(payload: schemas.SensorCreate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    sensor = models.Sensor(fazenda_id=fazenda_id, **payload.model_dump())
    db.add(sensor)
    db.commit()
    db.refresh(sensor)
    return sensor


@router.put("/{sensor_id}", response_model=schemas.SensorResponse)
def atualizar_sensor(sensor_id: int, payload: schemas.SensorUpdate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    s = db.query(models.Sensor).filter_by(fazenda_id=fazenda_id).filter(models.Sensor.id == sensor_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Sensor não encontrado")
    for campo, valor in payload.model_dump(exclude_none=True).items():
        setattr(s, campo, valor)
    db.commit()
    db.refresh(s)
    return s


@router.delete("/{sensor_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_sensor(sensor_id: int, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    s = db.query(models.Sensor).filter_by(fazenda_id=fazenda_id).filter(models.Sensor.id == sensor_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Sensor não encontrado")
    db.delete(s)
    db.commit()


# --------------------------------------------------------------------------- #
# Leituras de Sensor                                                            #
# --------------------------------------------------------------------------- #


@router.get("/{sensor_id}/leituras", response_model=list[schemas.LeituraSensorResponse])
def listar_leituras(
    sensor_id: int,
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    fazenda_id: int = Depends(get_current_fazenda_id),
):
    s = db.query(models.Sensor).filter_by(fazenda_id=fazenda_id).filter(models.Sensor.id == sensor_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Sensor não encontrado")
    leituras = (
        db.query(models.LeituraSensor)
        .filter(models.LeituraSensor.sensor_id == sensor_id)
        .order_by(desc(models.LeituraSensor.data_hora))
        .limit(limit)
        .all()
    )
    return leituras


@router.post("/leituras", response_model=schemas.LeituraSensorResponse, status_code=status.HTTP_201_CREATED)
def registrar_leitura(payload: schemas.LeituraSensorCreate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    s = db.query(models.Sensor).filter_by(fazenda_id=fazenda_id).filter(models.Sensor.id == payload.sensor_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Sensor não encontrado")
    leitura = models.LeituraSensor(
        sensor_id=payload.sensor_id,
        valor=payload.valor,
        data_hora=payload.data_hora or datetime.utcnow(),
    )
    db.add(leitura)
    db.commit()
    db.refresh(leitura)
    return leitura
