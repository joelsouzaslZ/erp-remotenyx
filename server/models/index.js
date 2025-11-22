const pool = require('../config/database');
const User = require('./User');

// Mock models para desenvolvimento - com fallback para PostgreSQL
const Employee = {
  findAll: async () => {
    try {
      const result = await pool.query('SELECT * FROM employees WHERE active = true ORDER BY name');
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      return global.mockData ? global.mockData.employees : [];
    }
  },
  
  findByPk: async (id) => {
    try {
      const result = await pool.query('SELECT * FROM employees WHERE id = $1 AND active = true', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar funcionário:', error);
      return global.mockData ? global.mockData.employees.find(e => e.id == id) : null;
    }
  },
  
  create: async (data) => {
    try {
      const result = await pool.query(
        `INSERT INTO employees (name, email, phone, position, department_id, salary, hire_date, work_location, contract_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [data.name, data.email, data.phone, data.position, data.department_id, data.salary, data.hire_date, data.work_location, data.contract_type]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
      if (global.mockData) {
        const newEmployee = { id: Date.now(), ...data };
        global.mockData.employees.push(newEmployee);
        return newEmployee;
      }
      throw error;
    }
  },
  
  count: async () => {
    try {
      const result = await pool.query('SELECT COUNT(*) FROM employees WHERE active = true');
      return parseInt(result.rows[0].count);
    } catch (error) {
      return global.mockData ? global.mockData.employees.length : 0;
    }
  }
};

const Department = {
  findAll: async () => {
    try {
      const result = await pool.query('SELECT * FROM departments ORDER BY name');
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar departamentos:', error);
      return global.mockData ? global.mockData.departments : [];
    }
  },
  
  create: async (data) => {
    try {
      const result = await pool.query(
        'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *',
        [data.name, data.description]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar departamento:', error);
      if (global.mockData) {
        const newDept = { id: Date.now(), ...data };
        global.mockData.departments.push(newDept);
        return newDept;
      }
      throw error;
    }
  }
};

const Transaction = {
  findAll: async () => {
    try {
      const result = await pool.query('SELECT * FROM financial_transactions ORDER BY date DESC');
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return global.mockData ? global.mockData.transactions : [];
    }
  },
  
  create: async (data) => {
    try {
      const result = await pool.query(
        'INSERT INTO financial_transactions (description, amount, type, category, date, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [data.description, data.amount, data.type, data.category, data.date, data.user_id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      if (global.mockData) {
        const newTransaction = { id: Date.now(), ...data };
        global.mockData.transactions.push(newTransaction);
        return newTransaction;
      }
      throw error;
    }
  }
};

const Product = {
  findAll: async () => {
    try {
      const result = await pool.query('SELECT * FROM products WHERE active = true ORDER BY name');
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return global.mockData ? global.mockData.products : [];
    }
  },
  
  create: async (data) => {
    try {
      const result = await pool.query(
        'INSERT INTO products (name, category, price, cost, quantity, min_quantity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [data.name, data.category, data.price, data.cost, data.quantity, data.min_quantity]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      if (global.mockData) {
        const newProduct = { id: Date.now(), ...data };
        global.mockData.products.push(newProduct);
        return newProduct;
      }
      throw error;
    }
  }
};

const Lead = {
  findAll: async () => {
    try {
      const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      return [];
    }
  },
  
  create: async (data) => {
    try {
      const result = await pool.query(
        `INSERT INTO leads (name, partner_name, email, phone, stage, priority, expected_revenue, probability, source, description, date_deadline, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [data.name, data.partner_name, data.email, data.phone, data.stage, data.priority, data.expected_revenue, data.probability, data.source, data.description, data.date_deadline, data.user_id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      throw error;
    }
  }
};

module.exports = {
  User,
  Employee,
  Department, 
  Transaction,
  Product,
  Lead
};