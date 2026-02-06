@echo off
echo 🚀 Starting Pinnacle AI Project Tracker deployment...

REM Stop existing containers
echo 📦 Stopping existing containers...
docker-compose down -v

REM Build and start containers
echo 🔨 Building and starting containers...
docker-compose up --build -d

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak > nul

REM Copy migration files
echo 📋 Setting up database...
docker cp migrations/0000_slippery_layla_miller.sql pinnacle-ai-db:/tmp/migration.sql
docker cp sample-data.sql pinnacle-ai-db:/tmp/sample-data.sql

REM Run migrations
echo 🗄️ Running database migrations...
docker-compose exec -T postgres psql -U postgres -d project-tracker -f /tmp/migration.sql

REM Insert sample data
echo 📊 Inserting sample data...
docker-compose exec -T postgres psql -U postgres -d project-tracker -f /tmp/sample-data.sql

REM Check application status
echo ✅ Checking application status...
docker-compose logs app --tail=5

echo 🎉 Deployment complete!
echo 🌐 Application is running at: http://localhost:7855
echo 👤 Login credentials:
echo    Admin: admin@pinnacle.ai / admin123
echo    Manager: jane@pinnacle.ai / user123
echo    Member: john@pinnacle.ai / user123

pause