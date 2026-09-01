from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.routes.auth import get_current_user, get_current_fazenda_id

router = APIRouter(prefix="/api/products", tags=["Produtos"])


@router.get("/", response_model=list[schemas.ProdutoResponse])
def listar(db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    return db.query(models.Produto).all()


@router.get("/{produto_id}", response_model=schemas.ProdutoResponse)
def buscar(produto_id: int, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    p = db.query(models.Produto).filter(models.Produto.id == produto_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return p


@router.post("/", response_model=schemas.ProdutoResponse, status_code=status.HTTP_201_CREATED)
def criar(payload: schemas.ProdutoCreate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    produto = models.Produto(**payload.model_dump())
    db.add(produto)
    db.commit()
    db.refresh(produto)
    return produto


@router.put("/{produto_id}", response_model=schemas.ProdutoResponse)
def atualizar(produto_id: int, payload: schemas.ProdutoUpdate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    p = db.query(models.Produto).filter(models.Produto.id == produto_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    for campo, valor in payload.model_dump(exclude_none=True).items():
        setattr(p, campo, valor)
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{produto_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(produto_id: int, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    p = db.query(models.Produto).filter(models.Produto.id == produto_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    db.delete(p)
    db.commit()
