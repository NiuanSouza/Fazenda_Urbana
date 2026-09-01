from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.routes.auth import get_current_user, get_current_fazenda_id

router = APIRouter(prefix="/api/sales", tags=["Vendas"])


def _enrich(venda: models.Venda) -> schemas.VendaResponse:
    return schemas.VendaResponse(
        id=venda.id,
        numero=venda.numero,
        info_adicionais=venda.info_adicionais,
        cliente_id=venda.cliente_id,
        cliente_nome=venda.cliente.nome if venda.cliente else None,
        status=venda.status,
        itens=[
            schemas.ItemVendaResponse(
                id=item.id,
                lote_id=item.lote_id,
                quantidade=item.quantidade,
                valor_total=item.valor_total,
            )
            for item in venda.itens
        ],
    )


@router.get("/", response_model=list[schemas.VendaResponse])
def listar(db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    vendas = db.query(models.Venda).all()
    return [_enrich(v) for v in vendas]


@router.get("/{venda_id}", response_model=schemas.VendaResponse)
def buscar(venda_id: int, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    v = db.query(models.Venda).filter(models.Venda.id == venda_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Venda não encontrada")
    return _enrich(v)


@router.post("/", response_model=schemas.VendaResponse, status_code=status.HTTP_201_CREATED)
def criar(payload: schemas.VendaCreate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    # Verificar se o número já existe
    if db.query(models.Venda).filter(models.Venda.numero == payload.numero).first():
        raise HTTPException(status_code=400, detail="Número de venda já existe")

    # Verificar estoque dos lotes
    for item in payload.itens:
        lote = db.query(models.Lote).filter(models.Lote.id == item.lote_id).first()
        if not lote:
            raise HTTPException(status_code=404, detail=f"Lote {item.lote_id} não encontrado")
        if lote.status != models.StatusLote.disponivel:
            raise HTTPException(status_code=400, detail=f"Lote {item.lote_id} não está disponível")
        if lote.quantidade < item.quantidade:
            raise HTTPException(
                status_code=400,
                detail=f"Estoque insuficiente no lote {item.lote_id}: disponível {lote.quantidade}, solicitado {item.quantidade}",
            )

    # Criar a venda
    venda = models.Venda(
        numero=payload.numero,
        info_adicionais=payload.info_adicionais,
        cliente_id=payload.cliente_id,
        status=models.StatusVenda.em_andamento,
    )
    db.add(venda)
    db.flush()

    # Criar itens e subtrair estoque dos lotes
    for item in payload.itens:
        lote = db.query(models.Lote).filter(models.Lote.id == item.lote_id).first()
        lote.quantidade -= item.quantidade
        if lote.quantidade <= 0:
            lote.status = models.StatusLote.esgotado

        item_venda = models.ItemVenda(
            venda_id=venda.id,
            lote_id=item.lote_id,
            quantidade=item.quantidade,
            valor_total=item.valor_total,
        )
        db.add(item_venda)

    db.commit()
    db.refresh(venda)
    return _enrich(venda)


@router.patch("/{venda_id}", response_model=schemas.VendaResponse)
def atualizar(venda_id: int, payload: schemas.VendaUpdate, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    v = db.query(models.Venda).filter(models.Venda.id == venda_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Venda não encontrada")

    # Se cancelando, devolver estoque aos lotes
    if payload.status == models.StatusVenda.cancelado and v.status != models.StatusVenda.cancelado:
        for item in v.itens:
            lote = db.query(models.Lote).filter(models.Lote.id == item.lote_id).first()
            if lote:
                lote.quantidade += item.quantidade
                if lote.status == models.StatusLote.esgotado:
                    lote.status = models.StatusLote.disponivel

    for campo, valor in payload.model_dump(exclude_none=True).items():
        setattr(v, campo, valor)

    db.commit()
    db.refresh(v)
    return _enrich(v)


@router.delete("/{venda_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(venda_id: int, db: Session = Depends(get_db), fazenda_id: int = Depends(get_current_fazenda_id)):
    v = db.query(models.Venda).filter(models.Venda.id == venda_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Venda não encontrada")
    db.delete(v)
    db.commit()
