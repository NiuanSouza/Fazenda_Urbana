from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.routes.auth import get_current_user

router = APIRouter(prefix="/api/fazendas", tags=["Fazendas"])

@router.get("/")
def listar_fazendas(db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    # Retorna as fazendas que o usuário logado tem acesso
    usuario_fazendas = db.query(models.UsuarioFazenda).filter(models.UsuarioFazenda.usuario_id == current_user.id_usuario).all()
    fazendas = []
    for uf in usuario_fazendas:
        fazendas.append({
            "id": uf.fazenda.id,
            "nome": uf.fazenda.nome,
            "cnpj": uf.fazenda.cnpj,
            "endereco": uf.fazenda.endereco,
            "role": uf.role
        })
    return fazendas

@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_fazenda(payload: dict, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores globais podem criar fazendas")
        
    fazenda = models.Fazenda(
        nome=payload.get("nome"),
        cnpj=payload.get("cnpj"),
        endereco=payload.get("endereco")
    )
    db.add(fazenda)
    db.commit()
    db.refresh(fazenda)
    
    # Vincula o admin criador na nova fazenda
    uf = models.UsuarioFazenda(
        usuario_id=current_user.id_usuario,
        fazenda_id=fazenda.id,
        role=models.RoleUsuario.admin
    )
    db.add(uf)
    db.commit()
    
    return fazenda
