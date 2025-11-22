@echo off
setlocal enabledelayedexpansion

:: ERP Remotenyx - Docker Management Script for Windows
:: This script helps manage the ERP system using Docker containers

set "PROJECT_NAME=ERP Remotenyx"
set "VERSION=2.0.0"

:: Print banner
:print_banner
echo ======================================
echo   %PROJECT_NAME% - Docker Manager
echo   Version: %VERSION%
echo ======================================
echo.
goto :eof

:: Print usage information
:print_usage
echo Usage: %~nx0 [COMMAND]
echo.
echo Commands:
echo   dev          Start development environment
echo   prod         Start production environment
echo   stop         Stop all containers
echo   restart      Restart all containers
echo   logs         Show logs from all containers
echo   clean        Clean up containers and volumes
echo   build        Build all container images
echo   status       Show status of all containers
echo   backup       Backup database
echo   restore      Restore database from backup
echo   setup        Initial setup for the project
echo   help         Show this help message
echo.
goto :eof

:: Check if Docker is installed and running
:check_docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not installed
    echo Please install Docker and try again
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running
    echo Please start Docker and try again
    exit /b 1
)
goto :eof

:: Start development environment
:start_dev
echo Starting development environment...
docker-compose -f docker-compose.dev.yml up -d
if errorlevel 0 (
    echo Development environment started!
    echo.
    echo Services available at:
    echo   - Frontend: http://localhost:3000
    echo   - Backend API: http://localhost:5000
    echo   - PostgreSQL: localhost:5433
    echo   - pgAdmin: http://localhost:5050
    echo   - Redis: localhost:6379
    echo   - Mailhog: http://localhost:8025
)
goto :eof

:: Start production environment
:start_prod
echo Starting production environment...
docker-compose --profile production up -d
if errorlevel 0 (
    echo Production environment started!
    echo.
    echo Services available at:
    echo   - Application: http://localhost
    echo   - PostgreSQL: localhost:5433
    echo   - Redis: localhost:6379
)
goto :eof

:: Stop all containers
:stop_containers
echo Stopping all containers...
docker-compose -f docker-compose.yml down 2>nul
docker-compose -f docker-compose.dev.yml down 2>nul
echo All containers stopped!
goto :eof

:: Restart containers
:restart_containers
echo Restarting containers...
call :stop_containers
timeout /t 2 /nobreak >nul
if "%~1"=="dev" (
    call :start_dev
) else (
    call :start_prod
)
goto :eof

:: Show logs
:show_logs
echo Showing logs (Press Ctrl+C to exit)...
docker-compose -f docker-compose.dev.yml ps -q >nul 2>&1
if errorlevel 0 (
    docker-compose -f docker-compose.dev.yml logs -f
) else (
    docker-compose logs -f
)
goto :eof

:: Clean up containers and volumes
:clean_up
echo Cleaning up containers and volumes...
set /p "confirm=This will remove all containers, networks, and volumes. Continue? (y/N): "
if /i "!confirm!"=="y" (
    call :stop_containers
    docker-compose -f docker-compose.yml down -v --remove-orphans 2>nul
    docker-compose -f docker-compose.dev.yml down -v --remove-orphans 2>nul
    docker system prune -f
    echo Cleanup completed!
) else (
    echo Cleanup cancelled
)
goto :eof

:: Build container images
:build_images
echo Building container images...
docker-compose build --no-cache
docker-compose -f docker-compose.dev.yml build --no-cache
echo Images built successfully!
goto :eof

:: Show container status
:show_status
echo Container Status:
echo.
docker-compose -f docker-compose.dev.yml ps -q >nul 2>&1
if not errorlevel 1 (
    echo Development Environment:
    docker-compose -f docker-compose.dev.yml ps
)

docker-compose ps -q >nul 2>&1
if not errorlevel 1 (
    echo Production Environment:
    docker-compose ps
)

docker-compose -f docker-compose.dev.yml ps -q >nul 2>&1
if errorlevel 1 (
    docker-compose ps -q >nul 2>&1
    if errorlevel 1 (
        echo No containers are currently running
    )
)
goto :eof

:: Backup database
:backup_database
echo Creating database backup...
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "BACKUP_FILE=backup_%dt:~0,4%%dt:~4,2%%dt:~6,2%_%dt:~8,2%%dt:~10,2%%dt:~12,2%.sql"

docker-compose -f docker-compose.dev.yml ps postgres-dev >nul 2>&1
if not errorlevel 1 (
    set "CONTAINER=erp-postgres-dev"
    set "DATABASE=erp_remotenyx_dev"
) else (
    set "CONTAINER=erp-postgres"
    set "DATABASE=erp_remotenyx"
)

docker exec %CONTAINER% pg_dump -U erp_admin %DATABASE% > %BACKUP_FILE%
echo Database backup created: %BACKUP_FILE%
goto :eof

:: Restore database
:restore_database
echo Restoring database from backup...
set /p "BACKUP_FILE=Enter backup file path: "

if not exist "%BACKUP_FILE%" (
    echo Error: Backup file not found
    exit /b 1
)

docker-compose -f docker-compose.dev.yml ps postgres-dev >nul 2>&1
if not errorlevel 1 (
    set "CONTAINER=erp-postgres-dev"
    set "DATABASE=erp_remotenyx_dev"
) else (
    set "CONTAINER=erp-postgres"
    set "DATABASE=erp_remotenyx"
)

type "%BACKUP_FILE%" | docker exec -i %CONTAINER% psql -U erp_admin %DATABASE%
echo Database restored successfully!
goto :eof

:: Initial setup
:setup_project
echo Setting up ERP Remotenyx project...

:: Create necessary directories
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs
if not exist "database" mkdir database

:: Create environment file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    (
        echo # Database Configuration
        echo DB_HOST=localhost
        echo DB_PORT=5433
        echo DB_NAME=erp_remotenyx
        echo DB_USER=erp_admin
        echo DB_PASSWORD=admin123
        echo.
        echo # JWT Secret
        echo JWT_SECRET=your-super-secret-jwt-key-change-in-production
        echo.
        echo # Environment
        echo NODE_ENV=development
        echo.
        echo # Next.js Configuration
        echo NEXT_PUBLIC_API_URL=http://localhost:5000/api
        echo NEXT_PUBLIC_APP_URL=http://localhost:3000
        echo.
        echo # pgAdmin Configuration
        echo PGADMIN_PASSWORD=admin123
    ) > .env
    echo .env file created!
)

echo Project setup completed!
echo.
echo Next steps:
echo   1. Run '%~nx0 dev' to start development environment
echo   2. Visit http://localhost:3000 to access the application
echo   3. Visit http://localhost:5050 to access pgAdmin
goto :eof

:: Main script logic
call :print_banner
call :check_docker

set "command=%~1"
if "%command%"=="" set "command=help"

if "%command%"=="dev" (
    call :start_dev
) else if "%command%"=="prod" (
    call :start_prod
) else if "%command%"=="stop" (
    call :stop_containers
) else if "%command%"=="restart" (
    call :restart_containers %2
) else if "%command%"=="logs" (
    call :show_logs
) else if "%command%"=="clean" (
    call :clean_up
) else if "%command%"=="build" (
    call :build_images
) else if "%command%"=="status" (
    call :show_status
) else if "%command%"=="backup" (
    call :backup_database
) else if "%command%"=="restore" (
    call :restore_database
) else if "%command%"=="setup" (
    call :setup_project
) else (
    call :print_usage
)

endlocal