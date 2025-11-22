const { Pool } = require('pg');
const path = require('path');

// Carregar .env do diretório raiz do projeto
const envPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

console.log('🔧 Carregando .env de:', envPath);

// Configuração de conexão com PostgreSQL
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost', 
  database: process.env.DB_NAME || 'erp_remotenyx',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
};

// Debug das variáveis de ambiente
console.log('🔍 Variáveis de ambiente:');
console.log('  DB_HOST:', process.env.DB_HOST);
console.log('  DB_PORT:', process.env.DB_PORT, '(type:', typeof process.env.DB_PORT, ')');
console.log('  DB_USER:', process.env.DB_USER);
console.log('  DB_NAME:', process.env.DB_NAME);
console.log('  NODE_ENV:', process.env.NODE_ENV);

// Adicionar senha se fornecida
if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') {
  dbConfig.password = process.env.DB_PASSWORD;
  console.log('🔒 Usando autenticação com senha');
} else {
  console.log('🔓 Usando autenticação sem senha (trust/peer)');
}

console.log('📊 Config DB final:', JSON.stringify(dbConfig, null, 2));

const pool = new Pool(dbConfig);

// Teste de conexão e inicialização
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso');
    
    // Criar tabelas se não existirem
    await createTables(client);
    
    client.release();
  } catch (err) {
    console.error('❌ Erro ao conectar com PostgreSQL:', err.message);
    console.log('🔄 Usando dados mock para desenvolvimento...');
    setupMockData();
  }
};

const createTables = async (client) => {
  try {
    // Tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'employee',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de departamentos
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de funcionários
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        position VARCHAR(255),
        department_id INTEGER REFERENCES departments(id),
        salary DECIMAL(10,2),
        hire_date DATE,
        manager_id INTEGER REFERENCES employees(id),
        work_location VARCHAR(255),
        contract_type VARCHAR(100),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de leads (CRM)
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        partner_name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        stage VARCHAR(50) DEFAULT 'new',
        priority INTEGER DEFAULT 0,
        expected_revenue DECIMAL(10,2),
        probability INTEGER,
        source VARCHAR(100),
        description TEXT,
        date_deadline DATE,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de transações financeiras
    await client.query(`
      CREATE TABLE IF NOT EXISTS financial_transactions (
        id SERIAL PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
        category VARCHAR(100),
        date DATE NOT NULL,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de produtos (estoque)
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        price DECIMAL(10,2),
        cost DECIMAL(10,2),
        quantity INTEGER DEFAULT 0,
        min_quantity INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tabelas criadas/verificadas com sucesso');
    
    // Criar usuário admin padrão se não existir
    await createDefaultAdmin(client);
    await createSampleData(client);
    
  } catch (err) {
    console.error('❌ Erro ao criar tabelas:', err.message);
  }
};

const createDefaultAdmin = async (client) => {
  try {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['Administrador', 'admin@remotenyx.com', hashedPassword, 'admin']);
    
    console.log('✅ Usuário admin criado: admin@remotenyx.com / admin123');
  } catch (err) {
    console.error('❌ Erro ao criar usuário admin:', err.message);
  }
};

const createSampleData = async (client) => {
  try {
    // Departamentos sample
    await client.query(`
      INSERT INTO departments (name, description)
      VALUES 
        ('Tecnologia', 'Departamento de TI e Desenvolvimento'),
        ('Recursos Humanos', 'Gestão de pessoas'),
        ('Financeiro', 'Controladoria e finanças'),
        ('Vendas', 'Equipe comercial')
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Dados de exemplo criados');
  } catch (err) {
    console.error('❌ Erro ao criar dados de exemplo:', err.message);
  }
};

// Setup mock data como fallback
const setupMockData = () => {
  global.mockData = {
    users: [
      { id: 1, email: 'admin@remotenyx.com', password: 'admin123', name: 'Administrador', role: 'admin' }
    ],
    employees: [
      { id: 1, name: 'João Silva', email: 'joao@empresa.com', department: 'TI', position: 'Desenvolvedor', salary: 5000 },
      { id: 2, name: 'Maria Santos', email: 'maria@empresa.com', department: 'RH', position: 'Analista RH', salary: 4500 },
      { id: 3, name: 'Pedro Costa', email: 'pedro@empresa.com', department: 'Vendas', position: 'Vendedor', salary: 3500 }
    ],
    departments: [
      { id: 1, name: 'TI' },
      { id: 2, name: 'RH' },
      { id: 3, name: 'Vendas' },
      { id: 4, name: 'Financeiro' }
    ],
    transactions: [
      { id: 1, description: 'Venda produto A', amount: 1500.00, type: 'income', category: 'vendas', date: '2024-11-01' },
      { id: 2, description: 'Compra material', amount: 500.00, type: 'expense', category: 'materiais', date: '2024-11-02' }
    ],
    products: [
      { id: 1, name: 'Produto A', category: 'Eletrônicos', price: 299.99, quantity: 50, minQuantity: 10 },
      { id: 2, name: 'Produto B', category: 'Casa', price: 199.99, quantity: 30, minQuantity: 5 }
    ]
  };
  console.log('✅ Dados mock inicializados para desenvolvimento');
};

// Inicializar banco
initializeDatabase();

module.exports = pool;