# 🚀 ERP REMOTENYX v2.0 - Sistema Completo com PostgreSQL Automático

## 🌟 Novidades da Versão 2.0

- ✅ **PostgreSQL Automático**: Instalação e configuração totalmente automática
- ✅ **Setup com 1 Clique**: Execute `INICIAR_COMPLETO.bat` e pronto!
- ✅ **Zero Configuração Manual**: Tudo configurado automaticamente
- ✅ **Banco Portátil**: PostgreSQL embarcado, sem instalação no sistema
- ✅ **Interface Moderna**: Design responsivo e intuitivo
- ✅ **Autenticação Real**: Sistema seguro com JWT e bcrypt

## 🎯 Características Principais

### 📊 Dashboard Executivo
- Visão geral de vendas, funcionários e financeiro
- Gráficos interativos em tempo real
- KPIs e métricas importantes
- Interface responsiva para mobile/desktop

### 💰 Gestão Financeira
- Controle de receitas e despesas
- Relatórios financeiros detalhados
- Gráficos de performance
- Categorização automática

### 👥 Recursos Humanos
- Cadastro completo de funcionários
- Gestão de departamentos e cargos
- Controle de presença
- Compatível com padrões Odoo

### 📦 Controle de Estoque
- Gestão completa de produtos
- Controle de entrada/saída
- Alertas de estoque baixo
- Relatórios de movimentação

### 🤝 CRM Integrado
- Gestão de leads e clientes
- Pipeline de vendas
- Histórico de interações
- Automação de follow-up

## 🚀 Instalação Super Simples

### Método 1: Um Clique ⚡
```bash
# Duplo clique no arquivo:
INICIAR_COMPLETO.bat
```
**Isso é tudo!** O sistema irá:
1. Verificar dependências
2. Baixar e configurar PostgreSQL automaticamente
3. Criar banco de dados
4. Iniciar frontend e backend
5. Abrir no navegador

### Método 2: Linha de Comando 💻
```bash
# Instalar dependências
npm run install-all

# Configurar PostgreSQL automaticamente
npm run setup

# Iniciar sistema
npm run dev
```

## 🔧 Como Funciona o PostgreSQL Automático

### Inspirado no Odoo
Assim como o Odoo instala PostgreSQL automaticamente, nosso sistema:

1. **Download Automático**: Baixa PostgreSQL portátil
2. **Extração Inteligente**: Descompacta na pasta do projeto
3. **Configuração Zero**: Configura automaticamente
4. **Banco Pronto**: Cria usuário e banco de dados
5. **Integração Total**: Conecta automaticamente com o ERP

### Estrutura de Arquivos
```
ERP Remotenyx/
├── postgresql/          # PostgreSQL portátil (criado automaticamente)
│   ├── bin/            # Executáveis do PostgreSQL
│   ├── data/           # Dados do banco
│   └── logs/           # Logs do sistema
├── PostgreSQLManager.js # Gerenciador automático
├── auto-setup.js       # Setup inteligente
├── INICIAR_COMPLETO.bat # Inicialização com 1 clique
└── .env               # Configurações (criado automaticamente)
```

## 🌐 URLs de Acesso

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Banco de Dados**: localhost:5433

## 🔐 Credenciais Padrão

```
Email: admin@remotenyx.com
Senha: admin123

Banco de Dados:
- Host: localhost
- Porta: 5433
- Banco: erp_remotenyx
- Usuário: erp_admin
- Senha: erp_admin_2025
```

## 📋 Requisitos Mínimos

- ✅ **Windows 10+** (suporte nativo)
- ✅ **Node.js 16+** ([Baixar aqui](https://nodejs.org))
- ✅ **8GB RAM** (recomendado)
- ✅ **Conexão com Internet** (apenas na primeira execução)

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React moderno
- **Tailwind CSS** - Design system responsivo
- **Axios** - Cliente HTTP configurado
- **Context API** - Gerenciamento de estado

### Backend
- **Node.js + Express** - API REST robusta
- **PostgreSQL** - Banco de dados confiável
- **JWT + bcrypt** - Autenticação segura
- **Modelos Odoo-compatíveis** - Integração futura

### DevOps
- **PostgreSQL Portátil** - Zero configuração
- **Concorrently** - Execução paralela
- **PowerShell Scripts** - Automação Windows

## 🔄 Comandos Úteis

```bash
# Configuração inicial
npm run setup

# Executar sistema
npm run dev

# Apenas backend
npm run server

# Apenas frontend
npm run client

# Resetar tudo
npm run reset

# Limpar arquivos
npm run clean
```

## 🆘 Solução de Problemas

### PostgreSQL não inicia?
1. Execute como **administrador**
2. Verifique **antivírus** (pode bloquear download)
3. Teste **conexão com internet**
4. Execute: `npm run setup-db`

### Erro de dependências?
```bash
npm run install-all
```

### Erro de autenticação?
Verifique o arquivo `.env` criado automaticamente.

### Porta já em uso?
- Frontend: Altere porta em `client/package.json`
- Backend: Altere `PORT` em `.env`
- PostgreSQL: Altere `DB_PORT` em `.env`

## 🤝 Compatibilidade Odoo

O sistema foi desenvolvido com compatibilidade aos padrões Odoo:

- **Modelos de Dados**: Estruturas similares (hr.employee, crm.lead, etc.)
- **PostgreSQL**: Mesmo banco de dados
- **Arquitetura**: Padrões de desenvolvimento similares
- **Migração**: Facilita integração futura

## 📈 Próximas Versões

- 🔄 **Sincronização Odoo**: Importar/exportar dados
- 📱 **App Mobile**: React Native
- 🔐 **Multi-tenancy**: Múltiplas empresas
- 🌍 **Internacionalização**: Múltiplos idiomas
- 📊 **BI Avançado**: Analytics e relatórios

## 🎉 Vantagens do Sistema

### ✅ **Facilidade Extrema**
- Instalação com 1 clique
- Zero configuração manual
- Interface intuitiva

### ✅ **Profissional**
- Banco de dados robusto
- Autenticação segura
- Código limpo e documentado

### ✅ **Flexível**
- Código aberto
- Facilmente customizável
- Integração com outras ferramentas

### ✅ **Confiável**
- PostgreSQL (usado por empresas globais)
- Backup automático
- Logs detalhados

## 📞 Suporte

Para dúvidas ou suporte:
- 📧 Email: suporte@remotenyx.com
- 🌐 Site: www.remotenyx.com
- 📱 WhatsApp: (11) 99999-9999

---

**🚀 ERP REMOTENYX v2.0** - *Simplificando a gestão empresarial com tecnologia de ponta!*