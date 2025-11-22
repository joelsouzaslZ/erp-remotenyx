// Mock User model for demonstration
const bcrypt = require('bcryptjs');

const User = {
  findOne: (options) => {
    const users = global.mockData.users;
    if (options.where.email) {
      const user = users.find(u => u.email === options.where.email);
      if (user) {
        return {
          ...user,
          validatePassword: async function(password) {
            return await bcrypt.compare(password, this.password);
          }
        };
      }
    }
    return null;
  },
  
  create: async (data) => {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const newUser = { id: Date.now(), role: 'employee', ...data };
    global.mockData.users.push(newUser);
    return newUser;
  }
};

module.exports = User;