@echo off
cd /d "%~dp0"

if not exist ".venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found. Please run setup.bat first.
    pause
    exit /b 1
)

call .venv\Scripts\activate
echo [TTS Server] Starting Chatterbox TTS on http://127.0.0.1:8000 ...
python main.py
pause
