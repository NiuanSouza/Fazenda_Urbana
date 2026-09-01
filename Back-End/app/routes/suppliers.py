from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.routes.auth import get_current_user, get_current_fazenda_id

router = APIRouter(prefix="/api/suppliers", tags=["Fornecedores"])


@router.get("/", response_model=list[schemas.FornecedorResponse])
def listar(db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    return db.query(models.Fornecedor).all()


@router.get("/{cnpj}", response_model=schemas.FornecedorResponse)
def buscar(cnpj: str, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    f = db.query(models.Fornecedor).filter(models.Fornecedor.cnpj == cnpj).first()
    if not f:
        raise HTTPException(status_code=404, detail="Fornecedor não encontrado")
    return f


@router.post("/", response_model=schemas.FornecedorResponse, status_code=status.HTTP_201_CREATED)
def criar(payload: schemas.FornecedorCreate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    existente = db.query(models.Fornecedor).filter(models.Fornecedor.cnpj == payload.cnpj).first()
    if existente:
        raise HTTPException(status_code=400, detail="CNPJ já cadastrado")
    fornecedor = models.Fornecedor(**payload.model_dump())
    db.add(fornecedor)
    db.commit()
    db.refresh(fornecedor)
    return fornecedor


@router.put("/{cnpj}", response_model=schemas.FornecedorResponse)
def atualizar(cnpj: str, payload: schemas.FornecedorUpdate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    f = db.query(models.Fornecedor).filter(models.Fornecedor.cnpj == cnpj).first()
    if not f:
        raise HTTPException(status_code=404, detail="Fornecedor não encontrado")
    for campo, valor in payload.model_dump(exclude_none=True).items():
        setattr(f, campo, valor)
    db.commit()
    db.refresh(f)
    return f


@router.delete("/{cnpj}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(cnpj: str, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    f = db.query(models.Fornecedor).filter(models.Fornecedor.cnpj == cnpj).first()
    if not f:
        raise HTTPException(status_code=404, detail="Fornecedor não encontrado")
    db.delete(f)
    db.commit()
