# Back-End

> API RESTful de alta performance que gerencia o processamento de regras de negócio, banco de dados e autenticação da Fazenda Urbana.

## ⚙️ Arquitetura e Modelagem
A arquitetura é fundamentada no FastAPI para garantir respostas rápidas. O banco de dados utiliza PostgreSQL modelado por ORM (SQLAlchemy) e gerenciado pelo Alembic para migrações, garantindo integridade nos controles de insumos, eventos de manejo agrícola e registros de IoT.

## 🛠 Tecnologias Usadas
- Python 3
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- Pydantic

## 🚀 Como Rodar o Back-End
1. Crie um ambiente virtual e ative-o (opcional mas recomendado).
2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure as variáveis de ambiente necessárias (baseadas no `.env.example`).
4. Execute o servidor:
   ```bash
   uvicorn app.main:app --reload
   ```
