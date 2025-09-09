@echo off
:: Setup script for local subdomain testing on Windows
:: Run as Administrator

echo Setting up local domains for clearcontract.local...

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This script requires Administrator privileges.
    echo Please run as Administrator.
    pause
    exit /b 1
)

set HOSTS_FILE=%WINDIR%\System32\drivers\etc\hosts

:: Check if entries already exist
findstr /C:"clearcontract.local" "%HOSTS_FILE%" >nul 2>&1
if %errorlevel% equ 0 (
    echo ClearContract entries already exist in hosts file.
    echo To update, first remove existing entries manually.
    pause
    exit /b 0
)

:: Create backup
set BACKUP_FILE=%HOSTS_FILE%.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_FILE=%BACKUP_FILE: =0%
copy "%HOSTS_FILE%" "%BACKUP_FILE%" >nul
echo Backup created: %BACKUP_FILE%

:: Add entries to hosts file
echo. >> "%HOSTS_FILE%"
echo # ClearContract Local Development >> "%HOSTS_FILE%"
echo 127.0.0.1    clearcontract.local >> "%HOSTS_FILE%"
echo 127.0.0.1    en.clearcontract.local >> "%HOSTS_FILE%"
echo 127.0.0.1    de.clearcontract.local >> "%HOSTS_FILE%"
echo 127.0.0.1    ru.clearcontract.local >> "%HOSTS_FILE%"
echo 127.0.0.1    fr.clearcontract.local >> "%HOSTS_FILE%"
echo 127.0.0.1    es.clearcontract.local >> "%HOSTS_FILE%"
echo 127.0.0.1    it.clearcontract.local >> "%HOSTS_FILE%"
echo 127.0.0.1    pl.clearcontract.local >> "%HOSTS_FILE%"
echo 127.0.0.1    api.clearcontract.local >> "%HOSTS_FILE%"
echo # End ClearContract Local Development >> "%HOSTS_FILE%"

echo Local domains configured successfully!

:: Flush DNS cache
echo Flushing DNS cache...
ipconfig /flushdns >nul
echo DNS cache flushed!

echo.
echo You can now access the application at:
echo   - http://clearcontract.local:3098 (English, default)
echo   - http://de.clearcontract.local:3098 (German)
echo   - http://ru.clearcontract.local:3098 (Russian)
echo   - http://fr.clearcontract.local:3098 (French)
echo   - http://es.clearcontract.local:3098 (Spanish)
echo   - http://it.clearcontract.local:3098 (Italian)
echo   - http://pl.clearcontract.local:3098 (Polish)
echo.
echo Start the development server with: npm run dev
echo.
pause