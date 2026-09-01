# 🟢 Fazenda Urbana - API Backend

> API RESTful desenvolvida em **Python** e **FastAPI**, responsável por gerenciar a lógica de negócios, banco de dados e autenticação de todo o ecossistema da Fazenda Urbana.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)

---

## 📌 Sumário

- [Visão Geral](#-visão-geral)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Como Rodar o Backend (Localmente)](#-como-rodar-o-backend-localmente)
- [Como Rodar com Docker (Recomendado)](#-como-rodar-com-docker-recomendado)
- [Scripts Úteis (Seed)](#-scripts-úteis-seed)

---

## 📖 Visão Geral

O Backend foi estruturado com foco em **modularidade** e **alta performance**. Ele processa todas as regras de negócio para a gestão da fazenda (insumos, produção, sensores IoT, vendas, relatórios) utilizando rotas assíncronas.

- **FastAPI:** Framework principal para as rotas web e documentação interativa automática (Swagger/OpenAPI).
- **SQLAlchemy:** ORM utilizado para modelagem de banco de dados e comunicação segura, prevenindo SQL Injection.
- **Pydantic:** Utilizado (via `schemas.py`) para validação rigorosa de dados de entrada e saída.
- **PostgreSQL:** Banco de dados relacional oficial em produção e ambiente de testes.

---

## 📂 Estrutura de Pastas

A organização interna do projeto segue a arquitetura padrão para projetos FastAPI escaláveis:

```text
Back-End/
├── app/                        # Pacote principal da aplicação
│   ├── routes/                 # Controladores/Endpoints separados por domínio (auth, dashboard, sensors, production, etc.)
│   ├── main.py                 # Arquivo principal que inicializa o FastAPI e os routers
│   ├── models.py               # Entidades do SQLAlchemy (Tabelas do PostgreSQL)
│   ├── schemas.py              # Modelos Pydantic (Validação de Input/Output)
│   ├── database.py             # Configuração da engine do SQLAlchemy (psycopg2)
│   ├── config.py               # Variáveis de ambiente e segredos
│   ├── auth.py                 # Regras de Criptografia e verificação JWT
│   └── seed.py                 # Script para popular o banco de dados
│
├── venv/                       # Ambiente Virtual do Python
├── Dockerfile                  # Receita Docker da API
├── docker-compose.yml          # Orquestração do container (API + PostgreSQL)
└── requirements.txt            # Lista de dependências (Bibliotecas Python)
```

---

## 🚀 Como Rodar o Backend (Localmente)

Se você já possui um servidor PostgreSQL rodando localmente na sua máquina:

1. **Ativar o Ambiente Virtual:**
   ```bash
   source venv/bin/activate
   # No Windows: .\venv\Scripts\Activate
   ```

2. **Configurar as Variáveis de Ambiente:**
   ```bash
   cp .env.example .env
   # Edite o .env para colocar as credenciais corretas do seu banco Postgres.
   ```

3. **Instalar Dependências:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Executar o Servidor (Modo Dev):**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Acesse `http://localhost:8000/docs` para ver o Swagger.

---

## 🐳 Como Rodar com Docker (Recomendado)

A melhor forma de subir a aplicação localmente sem se preocupar em configurar o banco de dados.

O `docker-compose.yml` criará automaticamente um container com o **PostgreSQL 15** e outro com a **API**, conectando os dois via network interna.

```bash
docker-compose up --build -d
```
*A API ficará disponível na porta 8000 e o Postgres na 5432 para caso deseje conectar com DBeaver/PgAdmin.*

---

## 🌱 Scripts Úteis (Seed)

Para não iniciar a aplicação com o banco vazio, você pode popular os dados de teste usando o script de "semente":

- **Popular Banco de Dados:** Cria usuários, zonas de irrigação, produtos, insumos e clientes (As tabelas e relacionamentos serão criadas automaticamente pelo ORM no PostgreSQL):
  ```bash
  python -m app.seed
  ```
