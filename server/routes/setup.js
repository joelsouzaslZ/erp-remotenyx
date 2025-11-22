const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Verificar se o sistema já foi configurado
const isSystemConfigured = () => {
  const configPath = path.join(__dirname, '../../.env');
  return fs.existsSync(configPath);
};

// GET /api/setup/status - Verificar se o sistema precisa de configuração
router.get('/status', (req, res) => {
  const configured = isSystemConfigured();
  res.json({ 
    configured,
    message: configured ? 'Sistema já configurado' : 'Sistema necessita configuração inicial'
  });
});

// POST /api/setup/validate-db - Validar conexão com o banco de dados
router.post('/validate-db', [
  body('dbHost').trim().notEmpty(),
  body('dbPort').isInt({ min: 1, max: 65535 }),
  body('dbName').trim().notEmpty(),
  body('dbUser').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { dbHost, dbPort, dbName, dbUser, dbPassword } = req.body;

    // Tentar conectar ao PostgreSQL
    const pool = new Pool({
      host: dbHost,
      port: parseInt(dbPort),
      database: 'postgres', // Conectar ao banco postgres para verificar
      user: dbUser,
      password: dbPassword || undefined
    });

    try {
      const client = await pool.connect();
      
      // Verificar se o banco de dados já existe
      const result = await client.query(
        'SELECT datname FROM pg_database WHERE datname = $1',
        [dbName]
      );

      const dbExists = result.rows.length > 0;

      client.release();
      await pool.end();

      res.json({ 
        success: true, 
        message: 'Conexão estabelecida com sucesso',
        dbExists
      });
    } catch (err) {
      await pool.end();
      console.error('Erro ao conectar ao banco:', err);
      res.status(400).json({ 
        error: 'Não foi possível conectar ao banco de dados. Verifique as credenciais.',
        details: err.message
      });
    }
  } catch (error) {
    console.error('Erro na validação do banco:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/setup/initialize - Inicializar o sistema
router.post('/initialize', [
  body('dbHost').trim().notEmpty(),
  body('dbPort').isInt({ min: 1, max: 65535 }),
  body('dbName').trim().notEmpty(),
  body('dbUser').trim().notEmpty(),
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('companyName').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar se já está configurado
    if (isSystemConfigured()) {
      return res.status(400).json({ error: 'Sistema já foi configurado' });
    }

    const { dbHost, dbPort, dbName, dbUser, dbPassword, name, email, password, companyName } = req.body;

    // Conectar ao PostgreSQL
    const pool = new Pool({
      host: dbHost,
      port: parseInt(dbPort),
      database: 'postgres',
      user: dbUser,
      password: dbPassword || undefined
    });

    try {
      const client = await pool.connect();

      // Verificar se o banco já existe
      const dbCheck = await client.query(
        'SELECT datname FROM pg_database WHERE datname = $1',
        [dbName]
      );

      // Criar banco se não existir
      if (dbCheck.rows.length === 0) {
        // Sanitize database name to prevent SQL injection
        const sanitizedDbName = dbName.replace(/[^a-zA-Z0-9_]/g, '');
        if (sanitizedDbName !== dbName) {
          throw new Error('Nome do banco de dados contém caracteres inválidos');
        }
        await client.query(`CREATE DATABASE ${sanitizedDbName}`);
      }

      client.release();
      await pool.end();

      // Conectar ao banco de dados específico
      const dbPool = new Pool({
        host: dbHost,
        port: parseInt(dbPort),
        database: dbName,
        user: dbUser,
        password: dbPassword || undefined
      });

      const dbClient = await dbPool.connect();

      // Criar tabelas
      await createTables(dbClient);

      // Criar usuário administrador
      const hashedPassword = await bcrypt.hash(password, 10);
      await dbClient.query(`
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
      `, [name, email, hashedPassword, 'admin']);

      // Criar dados de exemplo
      await createSampleData(dbClient, companyName);

      dbClient.release();
      await dbPool.end();

      // Criar arquivo .env
      const envContent = `# Database Configuration
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_NAME=${dbName}
DB_USER=${dbUser}
${dbPassword ? `DB_PASSWORD=${dbPassword}` : '# DB_PASSWORD='}

# JWT Configuration
JWT_SECRET=${generateRandomSecret()}
JWT_EXPIRES_IN=24h

# Application Configuration
NODE_ENV=production
PORT=5000
CLIENT_URL=http://localhost:3000

# Company Information
COMPANY_NAME=${companyName}
`;

      fs.writeFileSync(path.join(__dirname, '../../.env'), envContent);

      res.json({ 
        success: true, 
        message: 'Sistema configurado com sucesso!',
        redirectTo: '/login'
      });
    } catch (err) {
      await pool.end();
      console.error('Erro ao inicializar sistema:', err);
      res.status(500).json({ 
        error: 'Erro ao inicializar o sistema',
        details: err.message
      });
    }
  } catch (error) {
    console.error('Erro na inicialização:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para criar tabelas
async function createTables(client) {
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
}

// Função para criar dados de exemplo
async function createSampleData(client, companyName) {
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

  // Adicionar alguns produtos de exemplo
  await client.query(`
    INSERT INTO products (name, category, price, cost, quantity, min_quantity)
    VALUES 
      ('Produto A', 'Eletrônicos', 299.99, 150.00, 50, 10),
      ('Produto B', 'Casa e Decoração', 199.99, 100.00, 30, 5),
      ('Produto C', 'Escritório', 149.99, 75.00, 20, 5)
    ON CONFLICT DO NOTHING
  `);
}

// Função para gerar secret aleatório
function generateRandomSecret() {
  return require('crypto').randomBytes(32).toString('hex');
}

module.exports = router;
