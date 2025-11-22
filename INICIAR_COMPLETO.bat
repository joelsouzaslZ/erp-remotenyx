@echo off
title ERP REMOTENYX - Sistema Integrado
color 0A

echo.
echo  ███████╗██████╗ ██████╗     ██████╗ ███████╗███╗   ███╗ ██████╗ ████████╗███████╗███╗   ██╗██╗   ██╗██╗  ██╗
echo  ██╔════╝██╔══██╗██╔══██╗    ██╔══██╗██╔════╝████╗ ████║██╔═══██╗╚══██╔══╝██╔════╝████╗  ██║╚██╗ ██╔╝╚██╗██╔╝
echo  █████╗  ██████╔╝██████╔╝    ██████╔╝█████╗  ██╔████╔██║██║   ██║   ██║   █████╗  ██╔██╗ ██║ ╚████╔╝  ╚███╔╝ 
echo  ██╔══╝  ██╔══██╗██╔═══╝     ██╔══██╗██╔══╝  ██║╚██╔╝██║██║   ██║   ██║   ██╔══╝  ██║╚██╗██║  ╚██╔╝   ██╔██╗ 
echo  ███████╗██║  ██║██║         ██║  ██║███████╗██║ ╚═╝ ██║╚██████╔╝   ██║   ███████╗██║ ╚████║   ██║   ██╔╝ ██╗
echo  ╚══════╝╚═╝  ╚═╝╚═╝         ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝
echo.
echo                            Sistema ERP Completo - Versao 2.0
echo                          PostgreSQL Automatico ^| Interface Moderna
echo.
echo =====================================================================================================
echo.

:: Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js nao encontrado!
    echo.
    echo 📋 Para instalar Node.js:
    echo    1. Acesse: https://nodejs.org
    echo    2. Baixe a versao LTS
    echo    3. Execute a instalacao
    echo    4. Reinicie o terminal
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js detectado: 
node --version
echo.

:: Verificar se dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependencias do projeto...
    echo.
    call npm install
    if errorlevel 1 (
        echo ❌ Erro na instalacao das dependencias!
        pause
        exit /b 1
    )
    echo.
)

:: Verificar dependências do client
if not exist "client\node_modules" (
    echo 📦 Instalando dependencias do frontend...
    echo.
    cd client
    call npm install
    if errorlevel 1 (
        echo ❌ Erro na instalacao das dependencias do frontend!
        pause
        exit /b 1
    )
    cd ..
    echo.
)

:: Verificar dependências do server
if not exist "server\node_modules" (
    echo 📦 Instalando dependencias do backend...
    echo.
    cd server
    call npm install
    if errorlevel 1 (
        echo ❌ Erro na instalacao das dependencias do backend!
        pause
        exit /b 1
    )
    cd ..
    echo.
)

echo 🔧 Configurando PostgreSQL automaticamente...
echo.

:: Executar setup automático do PostgreSQL
node auto-setup.js
if errorlevel 1 (
    echo.
    echo ❌ Erro na configuracao automatica do PostgreSQL!
    echo 🔄 Tentando metodo alternativo...
    echo.
    call setup_postgres_portable.bat
    if errorlevel 1 (
        echo ❌ Falha na configuracao do banco de dados!
        echo.
        echo 📋 Solucoes:
        echo    1. Execute como administrador
        echo    2. Verifique conexao com internet
        echo    3. Desative temporariamente o antivirus
        echo.
        pause
        exit /b 1
    )
)

echo.
echo 🌐 Iniciando Sistema ERP...
echo.
echo 📊 URLs de Acesso:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo.
echo 🔐 Login Padrao:
echo    Email: admin@remotenyx.com
echo    Senha: admin123
echo.
echo 💡 Pressione Ctrl+C para parar o sistema
echo.

:: Iniciar sistema completo
call npm run dev

echo.
echo 🛑 Sistema encerrado.
pause