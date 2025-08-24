@echo off
REM Mythos Engine Production Deployment Script for Windows
REM This script automates the deployment process for production environments

setlocal enabledelayedexpansion

REM Configuration
set APP_NAME=mythos-engine
set NODE_VERSION=18
set PM2_APP_NAME=mythos-engine
set DEPLOY_PATH=C:\opt\mythos-engine
set BACKUP_PATH=C:\opt\backups\mythos-engine

REM Colors for output (Windows 10+)
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

REM Logging function
:log
echo %BLUE%[%date% %time%]%NC% %~1
goto :eof

REM Error function
:error
echo %RED%[ERROR]%NC% %~1
exit /b 1

REM Success function
:success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

REM Warning function
:warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

REM Check prerequisites
:check_prerequisites
call :log "Checking prerequisites..."

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    call :error "Node.js is not installed"
)

REM Check npm/pnpm
pnpm --version >nul 2>&1
if errorlevel 1 (
    npm --version >nul 2>&1
    if errorlevel 1 (
        call :error "Neither pnpm nor npm is installed"
    )
)

REM Check PM2
pm2 --version >nul 2>&1
if errorlevel 1 (
    call :warning "PM2 is not installed. Installing PM2..."
    npm install -g pm2
)

call :success "Prerequisites check passed"
goto :eof

REM Check environment variables
:check_environment
call :log "Checking environment variables..."

if "%OPENAI_API_KEY%"=="" (
    call :error "OPENAI_API_KEY environment variable is not set"
)

if "%NODE_ENV%"=="" (
    set NODE_ENV=production
    call :warning "NODE_ENV not set, defaulting to production"
)

call :success "Environment variables check passed"
goto :eof

REM Create backup
:create_backup
call :log "Creating backup of current deployment..."

if exist "%DEPLOY_PATH%" (
    set BACKUP_NAME=backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
    set BACKUP_NAME=!BACKUP_NAME: =0!
    set BACKUP_FULL_PATH=%BACKUP_PATH%\!BACKUP_NAME!
    
    if not exist "%BACKUP_PATH%" mkdir "%BACKUP_PATH%"
    xcopy "%DEPLOY_PATH%" "%BACKUP_FULL_PATH%" /E /I /H /Y >nul
    
    call :success "Backup created: !BACKUP_NAME!"
) else (
    call :warning "No existing deployment found, skipping backup"
)
goto :eof

REM Install dependencies
:install_dependencies
call :log "Installing dependencies..."

cd /d "%DEPLOY_PATH%"

pnpm --version >nul 2>&1
if errorlevel 1 (
    npm ci --only=production
) else (
    pnpm install --production
)

call :success "Dependencies installed"
goto :eof

REM Build application
:build_application
call :log "Building application..."

cd /d "%DEPLOY_PATH%"

pnpm --version >nul 2>&1
if errorlevel 1 (
    npm run build
) else (
    pnpm build
)

call :success "Application built successfully"
goto :eof

REM Update PM2 process
:update_pm2
call :log "Updating PM2 process..."

cd /d "%DEPLOY_PATH%"

REM Stop existing process if running
pm2 list | findstr "%PM2_APP_NAME%" >nul
if not errorlevel 1 (
    pm2 stop "%PM2_APP_NAME%"
    pm2 delete "%PM2_APP_NAME%"
)

REM Start new process
pnpm --version >nul 2>&1
if errorlevel 1 (
    pm2 start "npm start" --name "%PM2_APP_NAME%" --cwd "%DEPLOY_PATH%"
) else (
    pm2 start "pnpm start" --name "%PM2_APP_NAME%" --cwd "%DEPLOY_PATH%"
)

REM Save PM2 configuration
pm2 save

call :success "PM2 process updated"
goto :eof

REM Health check
:health_check
call :log "Performing health check..."

REM Wait for application to start
timeout /t 10 /nobreak >nul

REM Check if application is responding
curl -f http://localhost:3000/api/health >nul 2>&1
if errorlevel 1 (
    call :error "Health check failed - application is not responding"
)

call :success "Health check passed"
goto :eof

REM Main deployment function
:deploy
call :log "Starting deployment of %APP_NAME%..."

REM Check prerequisites
call :check_prerequisites
call :check_environment

REM Create backup
call :create_backup

REM Create deployment directory if it doesn't exist
if not exist "%DEPLOY_PATH%" mkdir "%DEPLOY_PATH%"

REM Copy application files
call :log "Copying application files..."
xcopy . "%DEPLOY_PATH%" /E /I /H /Y >nul

REM Install dependencies
call :install_dependencies

REM Build application
call :build_application

REM Update PM2 process
call :update_pm2

REM Health check
call :health_check

call :success "Deployment completed successfully!"

call :log "Application is running at: http://localhost:3000"
call :log "PM2 status: pm2 status"
call :log "PM2 logs: pm2 logs %PM2_APP_NAME%"
goto :eof

REM Rollback function
:rollback
call :log "Rolling back to previous version..."

REM Get latest backup
for /f "delims=" %%i in ('dir /b /o-d "%BACKUP_PATH%\backup-*" 2^>nul') do (
    set LATEST_BACKUP=%%i
    goto :found_backup
)

call :error "No backup found for rollback"

:found_backup
REM Stop current process
pm2 list | findstr "%PM2_APP_NAME%" >nul
if not errorlevel 1 (
    pm2 stop "%PM2_APP_NAME%"
    pm2 delete "%PM2_APP_NAME%"
)

REM Restore from backup
if exist "%DEPLOY_PATH%" rmdir /s /q "%DEPLOY_PATH%"
xcopy "%BACKUP_PATH%\!LATEST_BACKUP!" "%DEPLOY_PATH%" /E /I /H /Y >nul

REM Update PM2 process
call :update_pm2

REM Health check
call :health_check

call :success "Rollback completed successfully!"
goto :eof

REM Show status
:show_status
call :log "Deployment Status:"
echo.

if exist "%DEPLOY_PATH%" (
    echo ✅ Deployment directory exists: %DEPLOY_PATH%
    for %%A in ("%DEPLOY_PATH%") do echo 📁 Size: %%~zA bytes
    echo 🕒 Last modified: %%~tA
) else (
    echo ❌ Deployment directory not found: %DEPLOY_PATH%
)

echo.
echo 🔄 PM2 Status:
pm2 list | findstr "%PM2_APP_NAME%" 2>nul || echo No PM2 process found

echo.
echo 💾 Backups:
if exist "%BACKUP_PATH%" (
    dir "%BACKUP_PATH%\backup-*" /b 2>nul || echo No backups found
) else (
    echo No backup directory found
)
goto :eof

REM Show logs
:show_logs
call :log "Application Logs:"
echo.

pm2 list | findstr "%PM2_APP_NAME%" >nul
if not errorlevel 1 (
    pm2 logs "%PM2_APP_NAME%" --lines 50
) else (
    echo No PM2 process found
)
goto :eof

REM Show usage
:usage
echo Usage: %~nx0 [OPTIONS]
echo.
echo Options:
echo   deploy     Deploy the application
echo   rollback   Rollback to previous version
echo   status     Show deployment status
echo   logs       Show application logs
echo   help       Show this help message
echo.
echo Environment Variables:
echo   OPENAI_API_KEY    OpenAI API key (required)
echo   NODE_ENV          Node environment (default: production)
echo.
echo Examples:
echo   %~nx0 deploy
echo   %~nx0 rollback
echo   %~nx0 status
goto :eof

REM Main script logic
if "%1"=="" goto deploy
if "%1"=="deploy" goto deploy
if "%1"=="rollback" goto rollback
if "%1"=="status" goto show_status
if "%1"=="logs" goto show_logs
if "%1"=="help" goto usage
if "%1"=="-h" goto usage
if "%1"=="--help" goto usage

call :error "Unknown command: %1. Use 'help' for usage information."
