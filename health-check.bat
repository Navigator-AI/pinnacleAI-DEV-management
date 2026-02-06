@echo off
echo ========================================
echo Pinnacle AI Project Tracker Health Check
echo ========================================
echo.

:: Check if containers are running
echo Checking container status...
docker compose ps

echo.
echo Checking application health...

:: Test database connection
echo Testing database connection...
docker compose exec -T postgres psql -U postgres -d project-tracker -c "SELECT COUNT(*) as user_count FROM users;" 2>nul
if %errorlevel% equ 0 (
    echo ✓ Database connection successful
) else (
    echo ✗ Database connection failed
)

:: Test application endpoint
echo Testing application endpoint...
curl -s -o nul -w "%%{http_code}" http://localhost:7855 > temp_status.txt
set /p status=<temp_status.txt
del temp_status.txt

if "%status%"=="200" (
    echo ✓ Application is responding (HTTP %status%)
) else (
    echo ✗ Application is not responding (HTTP %status%)
)

:: Test API endpoints
echo Testing API endpoints...
curl -s -o nul -w "%%{http_code}" http://localhost:7855/api/auth/me > temp_api.txt
set /p api_status=<temp_api.txt
del temp_api.txt

if "%api_status%"=="401" (
    echo ✓ API endpoints are working (authentication required)
) else (
    echo ✗ API endpoints may have issues (HTTP %api_status%)
)

:: Check disk usage
echo.
echo Checking disk usage...
docker system df

:: Show recent logs
echo.
echo Recent application logs:
docker compose logs --tail=10 app

echo.
echo Recent database logs:
docker compose logs --tail=5 postgres

echo.
echo ========================================
echo Health Check Complete
echo ========================================
echo.
echo If all checks passed, your application is ready!
echo Access it at: http://localhost:7855
echo.
pause