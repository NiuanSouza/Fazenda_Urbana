from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import create_access_token, decode_token, verify_password
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> models.Usuario:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido ou expirado")
    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == payload.get("sub")).first()
    if not usuario or usuario.status != models.StatusGeral.ativo:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado ou inativo")
    return usuario

def get_current_fazenda_id(
    x_fazenda_id: int = Header(None, alias="X-Fazenda-Id"),
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> int:
    if not x_fazenda_id:
        # Se não enviou, pega a primeira fazenda do usuário por padrão
        uf = db.query(models.UsuarioFazenda).filter(models.UsuarioFazenda.usuario_id == current_user.id_usuario).first()
        if uf:
            return uf.fazenda_id
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Fazenda não informada e usuário sem vínculo")
    
    # Verifica vínculo
    uf = db.query(models.UsuarioFazenda).filter(
        models.UsuarioFazenda.usuario_id == current_user.id_usuario,
        models.UsuarioFazenda.fazenda_id == x_fazenda_id
    ).first()
    
    if not uf and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem acesso a esta fazenda")
        
    return x_fazenda_id



@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    if "@" in payload.login:
        usuario = db.query(models.Usuario).filter(models.Usuario.email == payload.login).first()
    else:
        usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == payload.login).first()

    if not usuario or not verify_password(payload.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
        )

    token = create_access_token({"sub": usuario.id_usuario})
    return schemas.TokenResponse(access_token=token)


@router.get("/me", response_model=schemas.UsuarioResponse)
def me(current_user: models.Usuario = Depends(get_current_user)):
    funcs = [uf.funcionalidade.nome for uf in current_user.funcionalidades]
    return schemas.UsuarioResponse(
        id_usuario=current_user.id_usuario,
        nome=current_user.nome,
        email=current_user.email,
        status=current_user.status,
        is_admin=current_user.is_admin,
        funcionalidades=funcs,
    )
