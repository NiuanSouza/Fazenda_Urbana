# 🌐 Fazenda Urbana - Front-End

Este repositório contém a interface de usuário da plataforma Fazenda Urbana, construída para proporcionar a melhor experiência de gestão agrícola e operações de SaaS.

## 🛠 Tecnologias e Arquitetura

- **Framework Principal:** Next.js 14+ (App Router)
- **Biblioteca de UI:** React 19
- **Linguagem:** TypeScript
- **Estilização:** CSS Modules (Vanilla CSS) com variáveis globais para o Design System.
- **Requisições:** Baseado na API Nativa do Fetch e abstrações em `lib/api.ts`.

### Sistema de Arquivos

A estrutura do projeto segue as melhores práticas de roteamento do Next.js App Router:
- `app/` - Contém as páginas principais e layouts de rota. As rotas protegidas que dependem de autenticação ficam isoladas no grupo `(private)`.
- `components/ui/` - Componentes puramente visuais e reutilizáveis (Botões, Modais, Tabelas, Alertas) construídos do zero para seguir o Design System.
- `lib/` - Configurações de API e lógicas puras do lado do cliente.
- `contexts/` - Gerenciamento de estado global com React Context (ex: Contexto da Fazenda atual).
- `types/` - Tipagens e interfaces TypeScript que espelham o domínio da aplicação (Models do Banco).

## 🚀 Como Rodar Localmente

1. **Configurar Variáveis de Ambiente:**
   Copie o arquivo de exemplo e configure a variável `NEXT_PUBLIC_API_URL` com a URL do seu Back-End (por padrão, aponta para `http://127.0.0.1:8000/api` localmente).
   ```bash
   cp .env.example .env
   ```

2. **Instalar Dependências:**
   O projeto utiliza o gerenciador de pacotes padrão ou PNPM:
   ```bash
   npm install
   # ou
   pnpm install
   ```

3. **Iniciar o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   # ou
   pnpm dev
   ```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador para ver o sistema rodando.
