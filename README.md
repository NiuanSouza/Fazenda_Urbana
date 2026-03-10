# 🌾 Fazenda Urbana - Plataforma de Gestão Completa (SaaS)

Bem-vindo ao repositório principal do **Fazenda Urbana**. Este projeto foi originalmente concebido como um trabalho acadêmico (PIM IV) e está sendo profundamente refatorado desde Fevereiro de 2026 para uma arquitetura moderna, escalável e baseada em microsserviços.

🔗 **Projeto Original (Fork de 2024):** [pimIV-Fazenda-Urbana](https://github.com/math20122004/pimIV-Fazenda-Urbana)

## 📖 Sobre o Sistema

A **Fazenda Urbana** é um SaaS focado na otimização e controle ponta a ponta de produções agrícolas em centros urbanos. O sistema permite o rastreamento preciso do cultivo (da semente à colheita), a gestão dos estoques de insumos e o monitoramento rigoroso via sensores simulados (IoT), provendo dashboards de suporte à tomada de decisão.

### ✨ Funcionalidades Principais

- 📦 **Gestão de Insumos e Fornecedores**
  - Controle de estoque com alertas automáticos de validade e quantidade crítica.
  - Rastreabilidade de fornecedores por lote.
- 🌱 **Controle de Produção Agrícola**
  - Mapeamento das zonas de plantio e status de crescimento das safras.
  - Histórico de eventos de manejo.
- 💧 **Automação e Sensores IoT (Telemetria)**
  - Eventos de Irrigação (Injeção de Água) medidos em litros com gatilhos manuais ou automáticos.
  - Alertas críticos gerados automaticamente baseados na umidade, temperatura e níveis de Ph do solo.
- 🛒 **Módulo de Vendas e CRM**
  - Controle de carteira de clientes, faturamento de safras e relatório de vendas.
- 🔐 **Painéis de Acesso e Segurança (RBAC)**
  - Perfis de acesso para Técnicos, Administradores e Operadores, com autenticação JWT.

---

## 🛠 Arquitetura do Sistema

Este repositório atua como um **Monorepo / Agregador** utilizando links simbólicos (Git Submodules):

1. **[Front-End](Front-End/)**: Aplicação Web responsiva construída com **Next.js, React e TypeScript**. Fornece a interface visual através do Design System "Warm Canvas".
2. **[Back-End](Back-End/)**: API RESTful de alta performance em **Python 3 (FastAPI)**. Baseada em banco de dados **PostgreSQL**, gerencia todo o processamento de regras de negócios, modelagem ORM com SQLAlchemy e autenticação.

## 🚀 Como baixar e iniciar o projeto

Como este repositório utiliza **Git Submodules**, você precisa clonar o projeto garantindo que as pastas dos submódulos sejam baixadas corretamente.

```bash
# 1. Clone o repositório principal com todos os submódulos
git clone --recursive https://github.com/NiuanSouza/Fazenda_Urbana.git

# Caso já tenha clonado sem a flag --recursive, inicie os submódulos manualmente:
git submodule update --init --recursive
```

### Instruções Específicas
Para instruções detalhadas de como configurar e rodar cada parte do sistema, consulte as documentações individuais nos respectivos submódulos:
- 📖 [Guia do Front-End (Next.js)](Front-End/README.md)
- 📖 [Guia do Back-End (FastAPI + PostgreSQL)](Back-End/README.md)

## 📅 Histórico de Refatoração

Desde Fevereiro de 2026, a base de código vem sendo completamente reescrita, evoluindo do monolito original para tecnologias robustas, adotando o PostgreSQL como base transacional e o Next.js como client.
