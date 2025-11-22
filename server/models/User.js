const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findOne(options) {
    try {
      if (options.where && options.where.email) {
        const result = await pool.query(
          'SELECT * FROM users WHERE email = $1 AND active = true',
          [options.where.email]
        );
        
        if (result.rows.length > 0) {
          const user = result.rows[0];
          return {
            ...user,
            validatePassword: async function(password) {
              return await bcrypt.compare(password, this.password);
            }
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      // Fallback para dados mock se o banco não estiver disponível
      if (global.mockData && global.mockData.users) {
        const user = global.mockData.users.find(u => u.email === options.where.email);
        if (user) {
          return {
            ...user,
            validatePassword: async function(password) {
              return this.password === password; // Para desenvolvimento
            }
          };
        }
      }
      return null;
    }
  }

  static async create(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const result = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [userData.name, userData.email, hashedPassword, userData.role || 'employee']
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      // Fallback para dados mock
      if (global.mockData && global.mockData.users) {
        const newUser = {
          id: global.mockData.users.length + 1,
          ...userData,
          password: await bcrypt.hash(userData.password, 10)
        };
        global.mockData.users.push(newUser);
        return newUser;
      }
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT id, name, email, role, active, created_at FROM users WHERE id = $1 AND active = true',
        [id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      // Fallback para dados mock
      if (global.mockData && global.mockData.users) {
        return global.mockData.users.find(u => u.id == id) || null;
      }
      return null;
    }
  }

  static async count() {
    try {
      const result = await pool.query('SELECT COUNT(*) FROM users WHERE active = true');
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Erro ao contar usuários:', error);
      return global.mockData ? global.mockData.users.length : 0;
    }
  }
}

module.exports = User;