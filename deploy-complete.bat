@echo off
echo ========================================
echo Pinnacle AI Project Tracker Deployment
echo ========================================
echo.

:: Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running
    echo Please install Docker Desktop and make sure it's running
    pause
    exit /b 1
)

echo ✓ Docker is available

:: Check if Docker Compose is available
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not available
    echo Please make sure Docker Desktop includes Docker Compose
    pause
    exit /b 1
)

echo ✓ Docker Compose is available

:: Stop any existing containers
echo.
echo Stopping existing containers...
docker compose down --remove-orphans

:: Remove existing volumes to ensure fresh start
echo.
echo Cleaning up existing data...
docker volume rm pinnacle-ai_postgres_data 2>nul

:: Build and start the application
echo.
echo Building and starting Pinnacle AI Project Tracker...
docker compose up --build -d

:: Wait for services to be ready
echo.
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

:: Check if services are running
echo.
echo Checking service status...
docker compose ps

:: Wait for database to be fully ready
echo.
echo Waiting for database initialization...
timeout /t 15 /nobreak >nul

:: Show logs to verify everything is working
echo.
echo Recent application logs:
docker compose logs --tail=20 app

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Your Pinnacle AI Project Tracker is now running at:
echo http://localhost:7855
echo.
echo Login Credentials:
echo ==================
echo Admin User:
echo   Email: girish.desai@pinnacle.ai
echo   Password: admin123
echo.
echo Team Members:
echo   Email: dinesh@pinnacle.ai     Password: user123
echo   Email: yaswanth@pinnacle.ai   Password: user123
echo   Email: raviteja@pinnacle.ai   Password: user123
echo   Email: eswar@pinnacle.ai      Password: user123
echo.
echo Features Available:
echo ==================
echo ✓ Complete project management system
echo ✓ Task tracking with Kanban boards
echo ✓ Team collaboration tools
echo ✓ Issue tracking and management
echo ✓ File upload and document management
echo ✓ Real-time activity feeds
echo ✓ Dashboard with analytics
echo ✓ User authentication and authorization
echo ✓ Responsive design for all devices
echo.
echo Useful Commands:
echo ================
echo View logs:           docker compose logs -f
echo Stop application:    docker compose down
echo Restart:            docker compose restart
echo Database access:     docker compose exec postgres psql -U postgres -d project-tracker
echo.
echo The application includes realistic sample data:
echo - 5 projects across different portfolios
echo - Multiple tasks in various stages
echo - Issues and bug reports
echo - Team activities and comments
echo - Document folders structure
echo.
pause