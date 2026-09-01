from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db
from app.routes.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/", response_model=list[schemas.UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Acesso restrito a administradores")
    usuarios = db.query(models.Usuario).all()
    
    result = []
    for u in usuarios:
        funcs = [uf.funcionalidade.nome for uf in u.funcionalidades]
        result.append(schemas.UsuarioResponse(
            id_usuario=u.id_usuario,
            nome=u.nome,
            email=u.email,
            status=u.status,
            is_admin=u.is_admin,
            funcionalidades=funcs,
        ))
    return result

@router.patch("/{id_usuario}/status")
def alterar_status(id_usuario: str, payload: dict, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Acesso restrito a administradores")
        
    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
    novo_status = payload.get("status")
    if novo_status in ["ativo", "inativo"]:
        usuario.status = novo_status
        db.commit()
        db.refresh(usuario)
        
    funcs = [uf.funcionalidade.nome for uf in usuario.funcionalidades]
    return schemas.UsuarioResponse(
        id_usuario=usuario.id_usuario,
        nome=usuario.nome,
        email=usuario.email,
        status=usuario.status,
        is_admin=usuario.is_admin,
        funcionalidades=funcs,
    )
