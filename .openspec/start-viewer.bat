@echo off
title OpenSpec Viewer
cd /d "%~dp0"

echo.
echo  =============================================
echo   OpenSpec Viewer - Lecteur Magic
echo  =============================================
echo.

:: Update index first
echo [1/2] Mise a jour de l'index...
powershell -ExecutionPolicy Bypass -File "%~dp0update-index.ps1"

echo.
echo [2/2] Demarrage du serveur...
echo.
echo  URL: http://localhost:3070/viewer.html
echo.
echo  Appuyez sur Ctrl+C pour arreter le serveur
echo  =============================================
echo.

:: Start server
npx serve -l 3070 .

pause
