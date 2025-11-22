const PostgreSQLManager = require('./PostgreSQLManager');

async function main() {
  console.log('🚀 ERP REMOTENYX - Setup Automático');
  console.log('=====================================\n');

  const pgManager = new PostgreSQLManager();
  const success = await pgManager.autoSetup();

  if (success) {
    console.log('✨ Sistema pronto para uso!');
    console.log('Execute: npm run dev');
    
    // Configurar shutdown graceful
    process.on('SIGINT', async () => {
      console.log('\n🛑 Encerrando sistema...');
      await pgManager.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Encerrando sistema...');
      await pgManager.stop();
      process.exit(0);
    });
  } else {
    console.log('❌ Falha na configuração. Verifique os logs acima.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { PostgreSQLManager };