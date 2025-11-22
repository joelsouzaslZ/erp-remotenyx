const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

class PostgreSQLManager {
  constructor() {
    this.scriptDir = path.resolve(__dirname);
    this.postgresDir = path.join(this.scriptDir, 'postgresql');
    this.dataDir = path.join(this.postgresDir, 'data');
    this.logsDir = path.join(this.postgresDir, 'logs');
    this.port = 5433;
    this.host = 'localhost';
    this.database = 'erp_remotenyx';
    this.username = 'erp_admin';
    this.password = 'erp_admin_2025';
    this.serverProcess = null;
  }

  async isPortInUse(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(port, (err) => {
        if (err) {
          resolve(true);
        } else {
          server.once('close', () => resolve(false));
          server.close();
        }
      });
      server.on('error', () => resolve(true));
    });
  }

  async isPostgreSQLRunning() {
    return new Promise((resolve) => {
      if (!fs.existsSync(path.join(this.postgresDir, 'bin', 'pg_isready.exe'))) {
        resolve(false);
        return;
      }

      exec(`"${path.join(this.postgresDir, 'bin', 'pg_isready.exe')}" -h ${this.host} -p ${this.port} -U postgres`, 
        (error) => {
          resolve(!error);
        });
    });
  }

  async downloadPostgreSQL() {
    console.log('🔽 Baixando PostgreSQL portátil...');
    
    return new Promise((resolve, reject) => {
      const tempDir = path.join(this.scriptDir, 'temp_pg_download');
      
      // Criar diretório temporário
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const downloadScript = `
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $url = "https://get.enterprisedb.com/postgresql/postgresql-14.10-1-windows-x64-binaries.zip"
        $output = "${tempDir}\\postgresql.zip"
        try {
          Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
          Write-Host "Download concluído"
        } catch {
          Write-Host "Erro no download: $_"
          exit 1
        }
      `;

      const powershell = spawn('powershell', ['-Command', downloadScript], { 
        stdio: ['inherit', 'inherit', 'inherit'] 
      });

      powershell.on('close', (code) => {
        if (code === 0 && fs.existsSync(path.join(tempDir, 'postgresql.zip'))) {
          console.log('✅ PostgreSQL baixado com sucesso!');
          resolve(tempDir);
        } else {
          reject(new Error('Falha no download do PostgreSQL'));
        }
      });
    });
  }

  async extractPostgreSQL(tempDir) {
    console.log('📦 Extraindo PostgreSQL...');
    
    return new Promise((resolve, reject) => {
      const extractScript = `
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::ExtractToDirectory("${tempDir}\\postgresql.zip", "${tempDir}")
        Write-Host "Extração concluída"
      `;

      const powershell = spawn('powershell', ['-Command', extractScript], {
        stdio: ['inherit', 'inherit', 'inherit']
      });

      powershell.on('close', (code) => {
        if (code === 0) {
          // Mover arquivos para o diretório correto
          const pgsqlDir = path.join(tempDir, 'pgsql');
          if (fs.existsSync(pgsqlDir)) {
            fs.cpSync(pgsqlDir, this.postgresDir, { recursive: true });
          }
          
          // Limpar arquivos temporários
          fs.rmSync(tempDir, { recursive: true, force: true });
          
          console.log('✅ PostgreSQL extraído com sucesso!');
          resolve();
        } else {
          reject(new Error('Falha na extração do PostgreSQL'));
        }
      });
    });
  }

  async initializeDatabase() {
    console.log('🔧 Inicializando banco de dados...');
    
    return new Promise((resolve, reject) => {
      if (fs.existsSync(path.join(this.dataDir, 'postgresql.conf'))) {
        console.log('✅ Banco de dados já inicializado!');
        resolve();
        return;
      }

      const initdb = spawn(path.join(this.postgresDir, 'bin', 'initdb.exe'), [
        '-D', this.dataDir,
        '-U', 'postgres',
        '--auth-local=trust',
        '--auth-host=md5',
        '--encoding=UTF8',
        '--locale=C'
      ], { stdio: ['inherit', 'inherit', 'inherit'] });

      initdb.on('close', (code) => {
        if (code === 0) {
          this.configurePostgreSQL();
          console.log('✅ Banco de dados inicializado!');
          resolve();
        } else {
          reject(new Error('Falha na inicialização do banco de dados'));
        }
      });
    });
  }

  configurePostgreSQL() {
    // Configurar postgresql.conf
    const config = `
port = ${this.port}
listen_addresses = 'localhost'
max_connections = 100
shared_buffers = 128MB
dynamic_shared_memory_type = windows
log_destination = 'stderr'
logging_collector = on
log_directory = '../logs'
log_filename = 'postgresql-%Y%m%d.log'
log_truncate_on_rotation = off
log_rotation_age = 1d
log_rotation_size = 10MB
`;

    fs.appendFileSync(path.join(this.dataDir, 'postgresql.conf'), config);

    // Configurar pg_hba.conf
    const hbaConfig = `
# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
`;

    fs.appendFileSync(path.join(this.dataDir, 'pg_hba.conf'), hbaConfig);
  }

  async startPostgreSQL() {
    console.log('🚀 Iniciando PostgreSQL...');
    
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
      }

      this.serverProcess = spawn(path.join(this.postgresDir, 'bin', 'pg_ctl.exe'), [
        '-D', this.dataDir,
        '-l', path.join(this.logsDir, 'postgresql.log'),
        'start'
      ], { 
        detached: true,
        stdio: 'ignore'
      });

      // Aguardar PostgreSQL iniciar
      const checkStartup = async (attempts = 0) => {
        if (attempts > 10) {
          reject(new Error('Timeout aguardando PostgreSQL iniciar'));
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const isRunning = await this.isPostgreSQLRunning();
        if (isRunning) {
          console.log('✅ PostgreSQL iniciado com sucesso!');
          resolve();
        } else {
          checkStartup(attempts + 1);
        }
      };

      checkStartup();
    });
  }

  async setupERP() {
    console.log('⚙️ Configurando banco de dados do ERP...');
    
    return new Promise((resolve) => {
      // Criar usuário e banco de dados
      const commands = [
        `"${path.join(this.postgresDir, 'bin', 'createuser.exe')}" -h ${this.host} -p ${this.port} -U postgres --createdb --no-createrole --no-superuser ${this.username}`,
        `"${path.join(this.postgresDir, 'bin', 'createdb.exe')}" -h ${this.host} -p ${this.port} -U postgres -O ${this.username} ${this.database}`,
        `"${path.join(this.postgresDir, 'bin', 'psql.exe')}" -h ${this.host} -p ${this.port} -U postgres -d ${this.database} -c "ALTER USER ${this.username} PASSWORD '${this.password}';"`
      ];

      let completed = 0;
      commands.forEach(command => {  
        exec(command, () => {
          completed++;
          if (completed === commands.length) {
            console.log('✅ ERP configurado com sucesso!');
            resolve();
          }
        });
      });
    });
  }

  async createEnvFile() {
    const envPath = path.join(this.scriptDir, '.env');
    if (!fs.existsSync(envPath)) {
      const envContent = `# Configuração do Banco de Dados
DB_HOST=${this.host}
DB_PORT=${this.port}
DB_NAME=${this.database}
DB_USER=${this.username}
DB_PASSWORD=${this.password}

# Configuração JWT
JWT_SECRET=erp_remotenyx_super_secret_key_2025_secure

# Configuração do Servidor
NODE_ENV=development
PORT=5000
`;

      fs.writeFileSync(envPath, envContent);
      console.log('✅ Arquivo .env criado!');
    }
  }

  async autoSetup() {
    try {
      console.log('🔄 Iniciando configuração automática do PostgreSQL...\n');

      // Verificar se PostgreSQL já está instalado
      if (!fs.existsSync(path.join(this.postgresDir, 'bin', 'postgres.exe'))) {
        const tempDir = await this.downloadPostgreSQL();
        await this.extractPostgreSQL(tempDir);
      }

      // Inicializar banco de dados
      await this.initializeDatabase();

      // Verificar se PostgreSQL está rodando
      const isRunning = await this.isPostgreSQLRunning();
      if (!isRunning) {
        await this.startPostgreSQL();
      } else {
        console.log('✅ PostgreSQL já está rodando!');
      }

      // Configurar ERP
      await this.setupERP();

      // Criar arquivo .env
      await this.createEnvFile();

      console.log('\n🎉 Configuração concluída com sucesso!');
      console.log('📊 Informações de conexão:');
      console.log(`   Host: ${this.host}`);
      console.log(`   Porta: ${this.port}`);
      console.log(`   Banco: ${this.database}`);
      console.log(`   Usuário: ${this.username}`);
      console.log(`   Senha: ${this.password}\n`);

      return true;
    } catch (error) {
      console.error('❌ Erro na configuração:', error.message);
      return false;
    }
  }

  async stop() {
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
    
    return new Promise((resolve) => {
      exec(`"${path.join(this.postgresDir, 'bin', 'pg_ctl.exe')}" -D "${this.dataDir}" stop`, () => {
        console.log('🛑 PostgreSQL parado');
        resolve();
      });
    });
  }
}

module.exports = PostgreSQLManager;