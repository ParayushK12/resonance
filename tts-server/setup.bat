@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo [TTS Server Setup] Initializing Python Environment
echo ===================================================

cd /d "%~dp0"

if not exist ".venv" (
    echo Creating virtual environment in .venv...
    python -m venv .venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment. Ensure Python 3.10 or 3.11 is installed.
        pause
        exit /b 1
    )
)

echo Activating virtual environment...
call .venv\Scripts\activate

echo Upgrading pip...
python -m pip install --upgrade pip

echo Installing PyTorch with CUDA support (cu121)...
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121

echo Installing Chatterbox and server dependencies...
pip install -r requirements.txt

echo.
echo ===================================================
echo [TTS Server Setup] Setup complete!
echo You can now start the server with run.bat
echo ===================================================
pause
