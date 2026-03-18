@echo off
chcp 65001 > nul
echo ========================================================
echo         Vlubvi - Скрипт полного запуска проекта
echo ========================================================
echo.
echo Открываем 5 окон консоли:
echo 1. Бэкенд (FastAPI)
echo 2. Бот (Telegram)
echo 3. Фронтенд (React/Vite)
echo 4. Туннель для Бэкенда (API)
echo 5. Туннель для Фронтенда (UI)
echo.

:: 1. Backend Server
start "Backend Server" cmd /k "color 0A && echo Запуск Бэкенда (FastAPI)... && cd /d "%~dp0backend" && call venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000"

:: 2. Telegram Bot
start "Telegram Bot" cmd /k "color 0B && echo Запуск Telegram-бота... && cd /d "%~dp0backend" && call venv\Scripts\activate && python bot.py"

:: 3. Frontend Server
start "Frontend (UI Server)" cmd /k "color 0E && echo Запуск Фронтенда (npm run dev)... && cd /d "%~dp0frontend" && npm run dev"

:: 4. API Tunnel (Localtunnel)
start "Backend API Tunnel (vpoiske-demo-api)" cmd /k "color 0D && echo Запуск туннеля для API... && npx localtunnel --port 8000 --subdomain vpoiske-demo-api"

:: 5. UI Tunnel (Localtunnel)
start "Frontend WebApp Tunnel (vpoiske-demo-ui)" cmd /k "color 0C && echo Запуск туннеля для MiniApp... && npx localtunnel --port 5173 --subdomain vpoiske-demo-ui"

echo Окна успешно открыты. 
echo Пожалуйста, подождите несколько секунд, пока все сервисы запустятся.
echo.
pause
