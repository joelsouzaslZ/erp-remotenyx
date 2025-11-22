const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'employee';
    this.active = data.active !== undefined ? data.active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  async validatePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  static async findOne(options) {
    try {
      const { where } = options;
      
      if (!where || (!where.email && !where.id)) {
        throw new Error('Either email or id must be provided');
      }

      let query = 'SELECT * FROM users WHERE ';
      const params = [];
      const conditions = [];

      if (where.email) {
        params.push(where.email);
        conditions.push(`email = $${params.length}`);
      }

      if (where.id) {
        params.push(where.id);
        conditions.push(`id = $${params.length}`);
      }

      query += conditions.join(' AND ');
      
      const result = await pool.query(query, params);
      
      if (result.rows.length > 0) {
        return new User(result.rows[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      // Fallback para mock data
      if (global.mockData && global.mockData.users) {
        const user = global.mockData.users.find(u => 
          (options.where.email && u.email === options.where.email) ||
          (options.where.id && u.id === options.where.id)
        );
        if (user) {
          return new User(user);
        }
      }
      return null;
    }
  }

  static async findAll(options = {}) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE active = true ORDER BY name');
      return result.rows.map(row => new User(row));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      if (global.mockData && global.mockData.users) {
        return global.mockData.users.map(u => new User(u));
      }
      return [];
    }
  }

  static async create(data) {
    try {
      // Hash da senha
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const result = await pool.query(
        `INSERT INTO users (name, email, password, role, active)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [data.name, data.email, hashedPassword, data.role || 'employee', true]
      );
      
      return new User(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      // Fallback para mock data
      if (global.mockData) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const newUser = {
          id: global.mockData.users.length + 1, // Sequential ID based on array length
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role || 'employee',
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        };
        global.mockData.users.push(newUser);
        return new User(newUser);
      }
      throw error;
    }
  }

  static async count() {
    try {
      const result = await pool.query('SELECT COUNT(*) FROM users WHERE active = true');
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Erro ao contar usuários:', error);
      if (global.mockData && global.mockData.users) {
        return global.mockData.users.length;
      }
      return 0;
    }
  }

  static async update(id, data) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (data.name) {
        fields.push(`name = $${paramCount}`);
        values.push(data.name);
        paramCount++;
      }

      if (data.email) {
        fields.push(`email = $${paramCount}`);
        values.push(data.email);
        paramCount++;
      }

      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        fields.push(`password = $${paramCount}`);
        values.push(hashedPassword);
        paramCount++;
      }

      if (data.role) {
        fields.push(`role = $${paramCount}`);
        values.push(data.role);
        paramCount++;
      }

      if (data.active !== undefined) {
        fields.push(`active = $${paramCount}`);
        values.push(data.active);
        paramCount++;
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      
      const result = await pool.query(query, values);
      
      if (result.rows.length > 0) {
        return new User(result.rows[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }
}

module.exports = User;
