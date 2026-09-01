import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.middleware import RequestLoggingMiddleware
from app.routes import auth, batches, customers, dashboard, energy, fazendas, inputs, irrigation, notifications, production, products, sales, sensors, suppliers, analytics, users

# Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Criar tabelas no banco de dados
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fazenda Urbana API",
    description="API REST para gestão de produção agrícola urbana — insumos, produção, vendas, sensores e irrigação.",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://fazenda-urbana-web.onrender.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

# Registrar roteadores
app.include_router(auth.router)
app.include_router(fazendas.router)
app.include_router(dashboard.router)
app.include_router(suppliers.router)
app.include_router(inputs.router)
app.include_router(products.router)
app.include_router(batches.router)
app.include_router(customers.router)
app.include_router(sales.router)
app.include_router(production.router)
app.include_router(notifications.router)
app.include_router(sensors.router)
app.include_router(irrigation.router)
app.include_router(energy.router)
app.include_router(analytics.router)
app.include_router(users.router)


@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "app": "Fazenda Urbana API", "version": "3.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
