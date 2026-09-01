from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.routes.auth import get_current_user, get_current_fazenda_id

router = APIRouter(prefix="/api/customers", tags=["Clientes"])


@router.get("/", response_model=list[schemas.ClienteResponse])
def listar(db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    return db.query(models.Cliente).all()


@router.get("/{cliente_id}", response_model=schemas.ClienteResponse)
def buscar(cliente_id: int, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    c = db.query(models.Cliente).filter(models.Cliente.id == cliente_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return c


@router.post("/", response_model=schemas.ClienteResponse, status_code=status.HTTP_201_CREATED)
def criar(payload: schemas.ClienteCreate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    cliente = models.Cliente(**payload.model_dump())
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.put("/{cliente_id}", response_model=schemas.ClienteResponse)
def atualizar(cliente_id: int, payload: schemas.ClienteUpdate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    c = db.query(models.Cliente).filter(models.Cliente.id == cliente_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    for campo, valor in payload.model_dump(exclude_none=True).items():
        setattr(c, campo, valor)
    db.commit()
    db.refresh(c)
    return c


@router.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(cliente_id: int, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    c = db.query(models.Cliente).filter(models.Cliente.id == cliente_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    db.delete(c)
    db.commit()
