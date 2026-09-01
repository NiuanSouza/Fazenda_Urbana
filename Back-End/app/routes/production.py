from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.routes.auth import get_current_user, get_current_fazenda_id

router = APIRouter(prefix="/api/production", tags=["Produção"])


def _enrich(p: models.Producao) -> schemas.ProducaoResponse:
    return schemas.ProducaoResponse(
        id=p.id,
        data_inicio=p.data_inicio,
        data_fim=p.data_fim,
        produto_nome=p.produto_nome,
        status=p.status,
        insumos=[
            {"insumo_id": ip.insumo_id, "nome": ip.insumo.nome_insumo, "quantidade": ip.quantidade}
            for ip in p.insumos
        ],
    )


@router.get("/", response_model=list[schemas.ProducaoResponse])
def listar(db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    return [_enrich(p) for p in db.query(models.Producao).filter_by(fazenda_id=fazenda_id).all()]


@router.get("/{producao_id}", response_model=schemas.ProducaoResponse)
def buscar(producao_id: int, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    p = db.query(models.Producao).filter_by(fazenda_id=fazenda_id).filter(models.Producao.id == producao_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Produção não encontrada")
    return _enrich(p)


@router.post("/", response_model=schemas.ProducaoResponse, status_code=status.HTTP_201_CREATED)
def criar(payload: schemas.ProducaoCreate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    # Verificar e reservar insumos
    for item in payload.insumos:
        insumo = db.query(models.Insumo).filter_by(fazenda_id=fazenda_id).filter(models.Insumo.id == item.insumo_id).first()
        if not insumo:
            raise HTTPException(status_code=404, detail=f"Insumo {item.insumo_id} não encontrado")
        if insumo.quantidade_insumo < item.quantidade:
            raise HTTPException(
                status_code=400,
                detail=f"Estoque insuficiente do insumo '{insumo.nome_insumo}': disponível {insumo.quantidade_insumo}, solicitado {item.quantidade}",
            )

    # Criar a produção
    producao = models.Producao(
        data_inicio=payload.data_inicio,
        data_fim=payload.data_fim,
        produto_nome=payload.produto_nome,
        status=models.StatusProducao.ativa,
    )
    db.add(producao)
    db.flush()

    # Consumir insumos
    for item in payload.insumos:
        insumo = db.query(models.Insumo).filter_by(fazenda_id=fazenda_id).filter(models.Insumo.id == item.insumo_id).first()
        insumo.quantidade_insumo -= item.quantidade
        if insumo.quantidade_insumo <= 0:
            insumo.validade = models.ValidadeInsumo.esgotado

        relacao = models.InsumoProducao(insumo_id=item.insumo_id, producao_id=producao.id, quantidade=item.quantidade)
        db.add(relacao)

    db.commit()
    db.refresh(producao)
    return _enrich(producao)


@router.patch("/{producao_id}", response_model=schemas.ProducaoResponse)
def atualizar(producao_id: int, payload: schemas.ProducaoUpdate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    p = db.query(models.Producao).filter_by(fazenda_id=fazenda_id).filter(models.Producao.id == producao_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Produção não encontrada")

    # Se cancelando, devolver insumos
    if payload.status == models.StatusProducao.cancelada and p.status == models.StatusProducao.ativa:
        for ip in p.insumos:
            insumo = db.query(models.Insumo).filter_by(fazenda_id=fazenda_id).filter(models.Insumo.id == ip.insumo_id).first()
            if insumo:
                insumo.quantidade_insumo += ip.quantidade
                if insumo.validade == models.ValidadeInsumo.esgotado:
                    insumo.validade = models.ValidadeInsumo.disponivel

    for campo, valor in payload.model_dump(exclude_none=True).items():
        setattr(p, campo, valor)

    db.commit()
    db.refresh(p)
    return _enrich(p)


@router.delete("/{producao_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(producao_id: int, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    p = db.query(models.Producao).filter_by(fazenda_id=fazenda_id).filter(models.Producao.id == producao_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Produção não encontrada")
    db.delete(p)
    db.commit()
