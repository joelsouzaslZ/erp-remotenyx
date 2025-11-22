@echo off
echo ===========================================
echo  Setup do Banco PostgreSQL - ERP Remotenyx
echo ===========================================
echo.

echo Verificando se o PostgreSQL está instalado...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL não encontrado!
    echo.
    echo Para instalar o PostgreSQL:
    echo 1. Baixe do site oficial: https://www.postgresql.org/download/windows/
    echo 2. Execute o instalador
    echo 3. Anote a senha do usuário postgres
    echo 4. Execute este script novamente
    echo.
    pause
    exit /b 1
)

echo ✅ PostgreSQL encontrado!
echo.

echo Criando usuário e banco de dados...
echo.
echo Digite a senha do usuário postgres quando solicitado:

psql -U postgres -c "CREATE USER erp_admin WITH PASSWORD 'erp_admin_2025';"
if %errorlevel% neq 0 (
    echo ⚠️  Usuário pode já existir, continuando...
)

psql -U postgres -c "CREATE DATABASE erp_remotenyx OWNER erp_admin;"
if %errorlevel% neq 0 (
    echo ⚠️  Banco pode já existir, continuando...
)

psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE erp_remotenyx TO erp_admin;"

echo.
echo ✅ Setup concluído!
echo.
echo Detalhes da conexão:
echo - Host: localhost
echo - Porta: 5432
echo - Banco: erp_remotenyx
echo - Usuário: erp_admin
echo - Senha: erp_admin_2025
echo.
echo O sistema criará automaticamente as tabelas na primeira execução.
echo.
pause