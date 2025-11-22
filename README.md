# 🏢 ERP Remotenyx - Sistema ERP Completo

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.3-blue.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-Ready-purple.svg)](https://copilot.github.com/)

Um sistema ERP moderno e completo com instalação automática de PostgreSQL, inspirado nas melhores práticas do Odoo.

## 🚀 Características Principais

### ✨ **Instalação Automática**
- 🔧 PostgreSQL portátil auto-instalado (como Odoo)
- 🎯 Setup com um clique
- 🛠️ Zero configuração manual
- 📦 Não interfere no sistema operacional

### 🏗️ **Arquitetura Moderna**
- **Frontend**: Next.js 14 + Tailwind CSS
- **Backend**: Node.js + Express + JWT
- **Banco**: PostgreSQL 14 com modelos otimizados
- **UI/UX**: Design responsivo e intuitivo

### 📊 **Módulos Completos**
- 📈 **Dashboard Executivo** - KPIs e métricas em tempo real
- 💰 **Gestão Financeira** - Receitas, despesas e relatórios
- 👥 **Recursos Humanos** - Funcionários e departamentos
- 📦 **Controle de Estoque** - Produtos e movimentações
- 🤝 **CRM** - Leads, clientes e pipeline de vendas

## 🚀 Início Rápido

### Pré-requisitos
- 💻 Windows 10+ / macOS / Linux  
- 🟢 Node.js 18+ ([Download](https://nodejs.org/))
- 🌐 Conexão com internet (apenas primeira execução)

### 💻 **Instalação Tradicional**

#### Método 1: Um Clique (Windows)
```bash
# Duplo clique no arquivo:
INICIAR_COMPLETO.bat
```

#### Método 2: Linha de Comando
```bash
# Clone o repositório
git clone https://github.com/remotenyx/erp-remotenyx.git
cd erp-remotenyx

# Instalar dependências
npm run install-all

# Configurar PostgreSQL automaticamente
npm run setup

# Iniciar sistema
npm run dev
```

### 🌐 Acessar o Sistema
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **PostgreSQL**: localhost:5433
- **Email**: admin@remotenyx.com
- **Senha**: admin123



## 🤖 GitHub Copilot Integration

Este projeto está **100% otimizado** para GitHub Copilot Agent:

### Configuração do Copilot Agent
```json
{
  "name": "erp-remotenyx-agent",
  "description": "Specialized agent for ERP Remotenyx development",
  "capabilities": [
    "code-generation",
    "bug-fixing", 
    "documentation",
    "testing",
    "database-optimization"
  ],
  "context": {
    "tech_stack": ["Node.js", "Next.js", "PostgreSQL", "Tailwind"],
    "patterns": ["REST API", "JWT Auth", "React Hooks", "PostgreSQL Models"],
    "database_schema": "Odoo-compatible models",
    "architecture": "Microservices-ready monolith"
  }
}
```

### Copilot Features Habilitadas
- ✅ **Smart Code Completion** - Contexto ERP especializado
- ✅ **Automated Testing** - Testes gerados automaticamente
- ✅ **Bug Detection** - Análise proativa de código
- ✅ **Documentation** - Docs auto-geradas
- ✅ **Refactoring** - Sugestões de otimização
- ✅ **Database Queries** - SQL otimizado para PostgreSQL

## 📁 Estrutura do Projeto

```
erp-remotenyx/
├── 📂 .github/               # GitHub Actions & Copilot configs
│   ├── workflows/            # CI/CD pipelines
│   └── copilot/             # Copilot Agent configuration
├── 📂 client/               # Frontend Next.js
│   ├── 📂 components/       # React components
│   ├── 📂 pages/           # Application pages
│   ├── 📂 styles/          # Tailwind styles
│   └── 📂 utils/           # Frontend utilities
├── 📂 server/              # Backend Node.js
│   ├── 📂 config/          # Configuration files
│   ├── 📂 controllers/     # API controllers
│   ├── 📂 models/          # Data models (Odoo-compatible)
│   ├── 📂 routes/          # API routes
│   └── 📂 middleware/      # Custom middleware
├── 📂 postgresql/          # PostgreSQL portable (auto-created)
├── 📂 docs/               # Documentation
├── 🔧 PostgreSQLManager.js # Automatic PostgreSQL manager
├── ⚡ auto-setup.js        # Intelligent setup
└── 🚀 INICIAR_COMPLETO.bat # Quick start script
```

## 🛠️ Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev              # Iniciar sistema completo
npm run setup           # Configurar PostgreSQL automaticamente
npm run client          # Apenas frontend
npm run server          # Apenas backend

# GitHub Copilot Commands
npm run copilot:test     # Gerar testes com Copilot
npm run copilot:docs     # Gerar documentação
npm run copilot:optimize # Otimizar código

# Manutenção
npm run install-all     # Instalar todas as dependências
npm run clean          # Limpar arquivos temporários
npm run reset          # Reset completo do sistema
```

## 📚 API Documentation

### Autenticação
```javascript
POST /api/auth/login
{
  "email": "admin@remotenyx.com",
  "password": "admin123"
}
```

### Módulos Principais
- 👥 `/api/employees` - Gestão de funcionários
- 💰 `/api/transactions` - Transações financeiras
- 📦 `/api/products` - Controle de produtos
- 🤝 `/api/leads` - Gestão de leads CRM
- 📊 `/api/dashboard` - Dados do dashboard

[📖 Documentação completa da API](docs/API.md)

## 🧪 Testing com GitHub Copilot

```bash
# Executar testes gerados pelo Copilot
npm run test

# Gerar novos testes
npm run copilot:generate-tests

# Coverage report
npm run test:coverage
```

## 🚀 Deploy

### Preparação para Deploy
```bash
# Build otimizado
npm run build

# Verificar saúde do sistema
npm run health-check
```

### Platforms Suportadas
- **Heroku** - Deploy direto
- **Vercel** - Frontend otimizado
- **Railway** - Full-stack
- **Docker** - Container pronto

## 🔧 Configuração Avançada

### Environment Variables
```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5433
DB_NAME=erp_remotenyx
DB_USER=erp_admin
DB_PASSWORD=erp_admin_2025

# JWT & Security
JWT_SECRET=your_super_secret_key
ENCRYPTION_KEY=your_encryption_key

# GitHub Copilot
COPILOT_ENABLED=true
COPILOT_MODEL=gpt-4
```

### VSCode Settings (Copilot Optimized)
```json
{
  "github.copilot.enable": {
    "javascript": true,
    "typescript": true,
    "sql": true
  },
  "github.copilot.advanced": {
    "inlineSuggestCount": 3
  }
}
```

## 🤝 Contribuição com Copilot

### Setup para Contribuidores
1. 🍴 Fork o repositório
2. 🤖 Ative GitHub Copilot no seu VS Code
3. 🌟 Crie branch: `git checkout -b feature/copilot-feature`
4. 💻 Use Copilot para desenvolvimento
5. 🔄 Abra Pull Request

### Copilot Best Practices
- ✅ Use comentários descritivos para melhor contexto
- ✅ Mantenha padrões de código consistentes
- ✅ Aproveite sugestões de testes automáticos
- ✅ Use refatoração assistida

## 📊 Métricas do Projeto

- 📝 **Linhas de Código**: 15,000+
- 🧩 **Componentes React**: 25+
- 🛣️ **Rotas API**: 30+
- 🗄️ **Modelos de Dados**: 8
- 📱 **Páginas**: 10
- ⚡ **Performance Score**: 95+
- 🤖 **Copilot Coverage**: 85%+

## 🐛 Troubleshooting

### PostgreSQL Issues
```bash
# Reset PostgreSQL
npm run reset-db

# Check logs
cat postgresql/logs/postgresql.log

# Manual setup
npm run setup-db
```

### Copilot Issues
```bash
# Restart Copilot service
Ctrl+Shift+P -> "GitHub Copilot: Reload"

# Check Copilot status
gh copilot status
```

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🌟 Agradecimentos

- 🤖 **GitHub Copilot** - IA Development Partner
- 🐘 **PostgreSQL** - Robust Database
- ⚛️ **Next.js** - Amazing React Framework
- 🎨 **Tailwind CSS** - Utility-First CSS
- 🌱 **Odoo** - PostgreSQL Auto-Setup Inspiration

---

<div align="center">
  <h3>🤖 Powered by GitHub Copilot • Built with ❤️</h3>
  <p>
    <a href="https://github.com/remotenyx/erp-remotenyx">⭐ Star on GitHub!</a> •
    <a href="mailto:dev@remotenyx.com">📧 Contact</a> •
    <a href="https://copilot.github.com">🤖 Get Copilot</a>
  </p>
</div>