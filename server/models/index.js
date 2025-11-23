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
        'INSERT INTO employees (name, email, phone, position, department_id, salary, hire_date, work_location, contract_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
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
  
  update: async (id, data) => {
    try {
      const fields = [];
      const values = [];
      let idx = 1;

      if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
      if (data.email !== undefined) { fields.push(`email = $${idx++}`); values.push(data.email); }
      if (data.phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(data.phone); }
      if (data.position !== undefined) { fields.push(`position = $${idx++}`); values.push(data.position); }
      if (data.department_id !== undefined) { fields.push(`department_id = $${idx++}`); values.push(data.department_id); }
      if (data.salary !== undefined) { fields.push(`salary = $${idx++}`); values.push(data.salary); }
      if (data.hire_date !== undefined) { fields.push(`hire_date = $${idx++}`); values.push(data.hire_date); }
      if (data.work_location !== undefined) { fields.push(`work_location = $${idx++}`); values.push(data.work_location); }
      if (data.contract_type !== undefined) { fields.push(`contract_type = $${idx++}`); values.push(data.contract_type); }

      if (fields.length === 0) {
        const result = await pool.query('SELECT * FROM employees WHERE id = $1 AND active = true', [id]);
        return result.rows[0] || null;
      }

      const query = `UPDATE employees SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} AND active = true RETURNING *`;
      values.push(id);
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      if (global.mockData) {
        const emp = global.mockData.employees.find(e => e.id == id);
        if (emp) Object.assign(emp, data);
        return emp || null;
      }
      throw error;
    }
  },

  softDelete: async (id) => {
    try {
      const result = await pool.query('UPDATE employees SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao deletar funcionário:', error);
      if (global.mockData) {
        const idx = global.mockData.employees.findIndex(e => e.id == id);
        if (idx >= 0) {
          global.mockData.employees.splice(idx, 1);
          return { id };
        }
        return null;
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
      const dateValue = data.date ? new Date(data.date) : new Date();
      const amountValue = data.amount !== undefined && data.amount !== null ? data.amount : 0;
      const result = await pool.query(
        'INSERT INTO financial_transactions (description, amount, type, category, date, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [data.description, amountValue, data.type, data.category, dateValue, data.user_id]
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
      const row = result.rows[0];
      // attach non-persisted fields if provided (description, sku)
      if (data.description) row.description = data.description;
      if (data.sku) row.sku = data.sku;
      return row;
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
  ,
  findById: async (id) => {
    try {
      const result = await pool.query('SELECT * FROM products WHERE id = $1 AND active = true', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar produto por id:', error);
      return global.mockData ? global.mockData.products.find(p => p.id == id) : null;
    }
  },
  update: async (id, data) => {
    try {
      const fields = [];
      const values = [];
      let idx = 1;
      if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
      if (data.category !== undefined) { fields.push(`category = $${idx++}`); values.push(data.category); }
      if (data.price !== undefined) { fields.push(`price = $${idx++}`); values.push(data.price); }
      if (data.cost !== undefined) { fields.push(`cost = $${idx++}`); values.push(data.cost); }
      if (data.quantity !== undefined) { fields.push(`quantity = $${idx++}`); values.push(data.quantity); }
      if (data.min_quantity !== undefined) { fields.push(`min_quantity = $${idx++}`); values.push(data.min_quantity); }

      if (fields.length === 0) {
        const res = await pool.query('SELECT * FROM products WHERE id = $1 AND active = true', [id]);
        const row = res.rows[0] || null;
        if (row && data.description) row.description = data.description;
        if (row && data.sku) row.sku = data.sku;
        return row;
      }

      const query = `UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} AND active = true RETURNING *`;
      values.push(id);
      const result = await pool.query(query, values);
      const row = result.rows[0] || null;
      if (row && data.description) row.description = data.description;
      if (row && data.sku) row.sku = data.sku;
      return row;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      if (global.mockData) {
        const prod = global.mockData.products.find(p => p.id == id);
        if (prod) Object.assign(prod, data);
        return prod || null;
      }
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const result = await pool.query('UPDATE products SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      if (global.mockData) {
        const idx = global.mockData.products.findIndex(p => p.id == id);
        if (idx >= 0) {
          const removed = global.mockData.products.splice(idx, 1)[0];
          return removed;
        }
        return null;
      }
      throw error;
    }
  }
};

// Lead model with helpers and camelCase mapping
const Lead = {
  _mapRow: (row) => {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      partnerName: row.partner_name,
      email: row.email,
      phone: row.phone,
      stage: row.stage,
      priority: row.priority,
      expectedRevenue: row.expected_revenue !== undefined ? parseFloat(row.expected_revenue) : 0,
      probability: row.probability,
      source: row.source,
      description: row.description,
      dateDeadline: row.date_deadline,
      userId: row.user_id,
      createdAt: row.created_at
    };
  },

  findAll: async () => {
    try {
      const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
      return result.rows.map(Lead._mapRow);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      return global.mockData ? (global.mockData.leads || []) : [];
    }
  },

  findByStage: async (stage) => {
    try {
      const all = await Lead.findAll();
      return all.filter(l => l.stage === stage);
    } catch (error) {
      console.error('Erro em findByStage:', error);
      return [];
    }
  },

  getStats: async () => {
    try {
      const leads = await Lead.findAll();
      const total = leads.length;
      const byStage = {};
      leads.forEach(l => {
        byStage[l.stage] = (byStage[l.stage] || 0) + 1;
      });
      const totalValue = leads.reduce((s, l) => s + (parseFloat(l.expectedRevenue) || 0), 0);
      return { total, byStage, totalValue };
    } catch (error) {
      console.error('Erro ao calcular stats:', error);
      return { total: 0, byStage: {}, totalValue: 0 };
    }
  },

  stages: [
    { id: 'new', name: 'New' },
    { id: 'contacted', name: 'Contacted' },
    { id: 'proposal', name: 'Proposal' },
    { id: 'won', name: 'Won' },
    { id: 'lost', name: 'Lost' }
  ],

  create: async (data) => {
    try {
      const result = await pool.query(
        'INSERT INTO leads (name, partner_name, email, phone, stage, priority, expected_revenue, probability, source, description, date_deadline, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
        [data.name, data.partner_name || data.partnerName, data.email, data.phone, data.stage, data.priority, data.expected_revenue || data.expectedRevenue, data.probability, data.source, data.description, data.date_deadline || data.dateDeadline, data.user_id || data.userId]
      );
      return Lead._mapRow(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      if (global.mockData) {
        const newLead = { id: Date.now(), ...data };
        global.mockData.leads = global.mockData.leads || [];
        global.mockData.leads.push(newLead);
        return newLead;
      }
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

// Compatibilidade: alias para diferentes convenções (findByPk usado em algumas rotas)
if (Product && !Product.findByPk) {
  Product.findByPk = Product.findById;
}