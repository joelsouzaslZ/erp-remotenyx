const bcrypt = require('bcryptjs');

// Testar hash da senha
const testPassword = 'admin123';
const storedHash = '$2a$10$ZIKEWmLNQy/TwPnnQbVdMO8ny0fTb3YgloqxNXFJCKWUYUWJk3KBW';

console.log('Senha de teste:', testPassword);
console.log('Hash armazenado:', storedHash);

bcrypt.compare(testPassword, storedHash).then(result => {
  console.log('Resultado da comparação:', result);
}).catch(err => {
  console.error('Erro na comparação:', err);
});