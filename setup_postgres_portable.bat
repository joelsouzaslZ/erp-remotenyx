@echo off
echo =========================================
echo ERP REMOTENYX - PostgreSQL Auto Setup
echo =========================================
echo.

:: Definir diretórios
set SCRIPT_DIR=%~dp0
set POSTGRES_DIR=%SCRIPT_DIR%postgresql
set DATA_DIR=%POSTGRES_DIR%\data
set LOGS_DIR=%POSTGRES_DIR%\logs
set TEMP_DIR=%SCRIPT_DIR%temp_pg_download

:: Criar diretórios necessários
if not exist "%POSTGRES_DIR%" mkdir "%POSTGRES_DIR%"
if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

:: Verificar se já existe PostgreSQL instalado
if exist "%POSTGRES_DIR%\bin\postgres.exe" (
    echo PostgreSQL portátil já existe!
    goto :start_postgres
)

echo Baixando PostgreSQL portátil...
echo.

:: URL do PostgreSQL portátil (versão 14 - mais estável)
set POSTGRES_URL=https://get.enterprisedb.com/postgresql/postgresql-14.10-1-windows-x64-binaries.zip

:: Baixar PostgreSQL usando PowerShell
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%POSTGRES_URL%' -OutFile '%TEMP_DIR%\postgresql.zip' -UseBasicParsing}"

if not exist "%TEMP_DIR%\postgresql.zip" (
    echo ERRO: Falha ao baixar PostgreSQL!
    echo Tentando método alternativo...
    
    :: Método alternativo usando curl (Windows 10+)
    curl -L -o "%TEMP_DIR%\postgresql.zip" "https://get.enterprisedb.com/postgresql/postgresql-14.10-1-windows-x64-binaries.zip"
    
    if not exist "%TEMP_DIR%\postgresql.zip" (
        echo ERRO: Não foi possível baixar PostgreSQL!
        echo.
        echo Soluções:
        echo 1. Verifique sua conexão com internet
        echo 2. Execute como administrador
        echo 3. Desative temporariamente o antivírus
        pause
        exit /b 1
    )
)

echo Extraindo PostgreSQL...
:: Extrair usando PowerShell
powershell -Command "& {Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('%TEMP_DIR%\postgresql.zip', '%TEMP_DIR%')}"

:: Mover arquivos para o diretório correto
if exist "%TEMP_DIR%\pgsql" (
    xcopy "%TEMP_DIR%\pgsql\*" "%POSTGRES_DIR%\" /E /I /H /Y
) else (
    echo Procurando diretório PostgreSQL extraído...
    for /d %%D in ("%TEMP_DIR%\*") do (
        if exist "%%D\bin\postgres.exe" (
            xcopy "%%D\*" "%POSTGRES_DIR%\" /E /I /H /Y
            goto :extraction_done
        )
    )
)

:extraction_done
:: Limpar arquivos temporários
rmdir /s /q "%TEMP_DIR%"

:: Verificar se a extração foi bem-sucedida
if not exist "%POSTGRES_DIR%\bin\postgres.exe" (
    echo ERRO: Falha na extração do PostgreSQL!
    pause
    exit /b 1
)

echo PostgreSQL extraído com sucesso!
echo.

:init_database
:: Inicializar banco de dados se não existir
if not exist "%DATA_DIR%\postgresql.conf" (
    echo Inicializando banco de dados...
    "%POSTGRES_DIR%\bin\initdb.exe" -D "%DATA_DIR%" -U postgres --auth-local=trust --auth-host=md5 --encoding=UTF8 --locale=C
    
    if errorlevel 1 (
        echo ERRO: Falha na inicialização do banco de dados!
        pause
        exit /b 1
    )
    
    echo Banco de dados inicializado!
    echo.
    
    :: Configurar PostgreSQL
    echo Configurando PostgreSQL...
    (
        echo port = 5433
        echo listen_addresses = 'localhost'
        echo max_connections = 100
        echo shared_buffers = 128MB
        echo dynamic_shared_memory_type = windows
        echo log_destination = 'stderr'
        echo logging_collector = on
        echo log_directory = '../logs'
        echo log_filename = 'postgresql-%%Y%%m%%d.log'
        echo log_truncate_on_rotation = off
        echo log_rotation_age = 1d
        echo log_rotation_size = 10MB
    ) >> "%DATA_DIR%\postgresql.conf"
    
    :: Configurar autenticação
    (
        echo # IPv4 local connections:
        echo host    all             all             127.0.0.1/32            trust
        echo host    all             all             ::1/128                 trust
    ) >> "%DATA_DIR%\pg_hba.conf"
)

:start_postgres
:: Verificar se PostgreSQL já está rodando
netstat -an | findstr ":5433" >nul 2>&1
if not errorlevel 1 (
    echo PostgreSQL já está rodando na porta 5433!
    goto :setup_database
)

echo Iniciando PostgreSQL...
start "PostgreSQL Server" /min "%POSTGRES_DIR%\bin\pg_ctl.exe" -D "%DATA_DIR%" -l "%LOGS_DIR%\postgresql.log" start

:: Aguardar PostgreSQL iniciar
echo Aguardando PostgreSQL iniciar...
timeout /t 5 /nobreak >nul

:: Tentar conectar várias vezes
set /a attempts=0
:wait_postgres
set /a attempts+=1
"%POSTGRES_DIR%\bin\pg_isready.exe" -h localhost -p 5433 -U postgres >nul 2>&1
if errorlevel 1 (
    if %attempts% lss 10 (
        echo Tentativa %attempts%/10 - Aguardando PostgreSQL...
        timeout /t 2 /nobreak >nul
        goto :wait_postgres
    ) else (
        echo ERRO: PostgreSQL não iniciou corretamente!
        echo Verifique os logs em: %LOGS_DIR%\postgresql.log
        pause
        exit /b 1
    )
)

echo PostgreSQL iniciado com sucesso!
echo.

:setup_database
:: Criar banco de dados e usuário para o ERP
echo Configurando banco de dados do ERP...

:: Criar usuário do ERP
"%POSTGRES_DIR%\bin\createuser.exe" -h localhost -p 5433 -U postgres --createdb --no-createrole --no-superuser erp_admin 2>nul

:: Criar banco de dados do ERP
"%POSTGRES_DIR%\bin\createdb.exe" -h localhost -p 5433 -U postgres -O erp_admin erp_remotenyx 2>nul

:: Configurar senha do usuário
"%POSTGRES_DIR%\bin\psql.exe" -h localhost -p 5433 -U postgres -d erp_remotenyx -c "ALTER USER erp_admin PASSWORD 'erp_admin_2025';" 2>nul

echo.
echo =========================================
echo PostgreSQL Configurado com Sucesso!
echo =========================================
echo.
echo Informações de conexão:
echo Host: localhost
echo Porta: 5433
echo Banco: erp_remotenyx
echo Usuário: erp_admin
echo Senha: erp_admin_2025
echo.
echo PostgreSQL está rodando em segundo plano.
echo Para parar: %POSTGRES_DIR%\bin\pg_ctl.exe -D "%DATA_DIR%" stop
echo.

:: Criar arquivo .env se não existir
if not exist "%SCRIPT_DIR%.env" (
    echo Criando arquivo .env...
    (
        echo # Configuração do Banco de Dados
        echo DB_HOST=localhost
        echo DB_PORT=5433
        echo DB_NAME=erp_remotenyx
        echo DB_USER=erp_admin
        echo DB_PASSWORD=erp_admin_2025
        echo.
        echo # Configuração JWT
        echo JWT_SECRET=erp_remotenyx_super_secret_key_2025_secure
        echo.
        echo # Configuração do Servidor
        echo NODE_ENV=development
        echo PORT=5000
    ) > "%SCRIPT_DIR%.env"
    echo Arquivo .env criado!
)

echo Instalação concluída! Execute 'npm run dev' para iniciar o ERP.
pause