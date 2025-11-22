const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log('🚀 ERP REMOTENYX - Setup Automático');
  console.log('=====================================\n');

  try {
    // Step 1: Verificar Node.js
    console.log('📦 Verificando Node.js...');
    const nodeVersion = process.version;
    console.log(`✅ Node.js ${nodeVersion} detectado`);

    // Step 2: Criar .env se não existir
    const envPath = path.join(__dirname, '.env');
    const envExamplePath = path.join(__dirname, '.env.example');
    
    if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
      console.log('\n📝 Criando arquivo .env...');
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Arquivo .env criado a partir do .env.example');
      console.log('⚠️  Você pode editar o .env para ajustar as configurações');
    } else if (fs.existsSync(envPath)) {
      console.log('\n✅ Arquivo .env já existe');
    }

    // Step 3: Instalar dependências se necessário
    const hasNodeModules = fs.existsSync(path.join(__dirname, 'node_modules'));
    const hasServerModules = fs.existsSync(path.join(__dirname, 'server', 'node_modules'));
    const hasClientModules = fs.existsSync(path.join(__dirname, 'client', 'node_modules'));

    if (!hasNodeModules || !hasServerModules || !hasClientModules) {
      console.log('\n📦 Instalando dependências...');
      console.log('   (Isso pode levar alguns minutos)');
      
      try {
        if (!hasNodeModules) {
          console.log('\n   Instalando dependências raiz...');
          execSync('npm install', { stdio: 'inherit', cwd: __dirname });
        }
        
        if (!hasServerModules) {
          console.log('\n   Instalando dependências do servidor...');
          execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'server') });
        }
        
        if (!hasClientModules) {
          console.log('\n   Instalando dependências do cliente...');
          execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'client') });
        }
        
        console.log('\n✅ Todas as dependências instaladas com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao instalar dependências:', error.message);
        console.log('\n💡 Tente executar manualmente: npm run install-all');
        process.exit(1);
      }
    } else {
      console.log('\n✅ Todas as dependências já instaladas');
    }

    // Step 4: Informar próximos passos
    console.log('\n' + '='.repeat(50));
    console.log('✨ Setup completo! Próximos passos:');
    console.log('='.repeat(50));
    console.log('\n1️⃣  Certifique-se de que o PostgreSQL está rodando');
    console.log('    - Host: localhost');
    console.log('    - Porta: 5432 (padrão)');
    console.log('\n2️⃣  Inicie o sistema:');
    console.log('    npm run dev');
    console.log('\n3️⃣  Acesse no navegador:');
    console.log('    http://localhost:3000');
    console.log('\n4️⃣  Complete a configuração inicial:');
    console.log('    - Configure o banco de dados');
    console.log('    - Crie o usuário administrador');
    console.log('\n' + '='.repeat(50));
    console.log('📚 Documentação: README.md');
    console.log('🐛 Problemas? Abra uma issue no GitHub');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Erro durante o setup:', error.message);
    console.log('\n💡 Tente os seguintes comandos manualmente:');
    console.log('   1. npm install');
    console.log('   2. cd server && npm install');
    console.log('   3. cd client && npm install');
    console.log('   4. npm run dev');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };