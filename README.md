# Fazenda Urbana

> Plataforma de Gestão Completa (SaaS) focada na otimização e controle ponta a ponta de produções agrícolas em centros urbanos.

## 🚀 Visão Geral
O Fazenda Urbana permite o rastreamento preciso do cultivo (da semente à colheita), a gestão dos estoques de insumos e o monitoramento rigoroso via sensores simulados (IoT). O sistema oferece suporte à tomada de decisão através de dashboards de telemetria, controle de carteira de clientes, faturamento de safras e painéis de acesso com níveis de segurança (RBAC) para Técnicos, Administradores e Operadores.

## 📂 Estrutura do Repositório
- **/Front-End**: Contém toda a interface de usuário construída em Next.js e TypeScript. [Veja o README do Front-End](./Front-End/README.md)
- **/Back-End**: Contém a API RESTful de alta performance, regras de negócio e banco de dados em FastAPI e PostgreSQL. [Veja o README do Back-End](./Back-End/README.md)

## 🛠 Como executar o projeto todo
Este repositório atua como um Monorepo utilizando Git Submodules. Para clonar o projeto inteiro:

```bash
git clone --recursive https://github.com/NiuanSouza/Fazenda_Urbana.git
```

Caso já tenha clonado sem a flag `--recursive`, inicie os submódulos:

```bash
git submodule update --init --recursive
```
Acesse as pastas individuais para rodar as aplicações.
