"""Exceções customizadas para padronizar respostas de erro da API."""


class AppException(Exception):
    def __init__(self, detail: str, status_code: int = 400):
        self.detail = detail
        self.status_code = status_code


class NotFoundException(AppException):
    def __init__(self, detail: str = "Recurso não encontrado"):
        super().__init__(detail=detail, status_code=404)


class ConflictException(AppException):
    def __init__(self, detail: str = "Conflito de dados"):
        super().__init__(detail=detail, status_code=409)


class ValidationException(AppException):
    def __init__(self, detail: str = "Dados inválidos"):
        super().__init__(detail=detail, status_code=422)


class UnauthorizedException(AppException):
    def __init__(self, detail: str = "Não autorizado"):
        super().__init__(detail=detail, status_code=401)
