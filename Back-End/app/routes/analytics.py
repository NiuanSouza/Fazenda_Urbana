from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import iot_analytics

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/anomalies")
def get_anomalies(db: Session = Depends(get_db), x_fazenda_id: int = Header(None, alias="X-Fazenda-Id")):
    if not x_fazenda_id:
        raise HTTPException(status_code=400, detail="X-Fazenda-Id header is missing")
    return iot_analytics.get_sensor_anomalies(db, fazenda_id=x_fazenda_id)

@router.get("/correlation")
def get_correlation(db: Session = Depends(get_db), x_fazenda_id: int = Header(None, alias="X-Fazenda-Id")):
    if not x_fazenda_id:
        raise HTTPException(status_code=400, detail="X-Fazenda-Id header is missing")
    return iot_analytics.correlate_energy_production(db, fazenda_id=x_fazenda_id)
