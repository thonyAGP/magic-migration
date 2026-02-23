@echo off
REM ============================================================================
REM Script d'execution des tests MECANO
REM ============================================================================
REM Prerequis: SQL Server installe et accessible via sqlcmd
REM ============================================================================

echo.
echo ============================================================================
echo TESTS MIGRATION MECANO - Magic Unipaas vers SQL Server
echo ============================================================================
echo.

SET SERVER=localhost
SET /P SERVER="Serveur SQL Server [%SERVER%]: "

echo.
echo Execution des scripts SQL...
echo.

echo [1/4] Creation de la base de test et des tables...
sqlcmd -S %SERVER% -E -i "sql\00_create_test_database.sql"
if %ERRORLEVEL% NEQ 0 goto :error

echo [2/4] Insertion des donnees de test...
sqlcmd -S %SERVER% -E -i "sql\06_insert_test_data.sql"
if %ERRORLEVEL% NEQ 0 goto :error

echo [3/4] Execution des tests des vues...
sqlcmd -S %SERVER% -E -i "sql\07_test_views.sql"
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo ============================================================================
echo TOUS LES TESTS ONT ETE EXECUTES AVEC SUCCES
echo ============================================================================
echo.
echo Consultez les resultats dans SQL Server Management Studio
echo Base de donnees: PMS_Test
echo.
goto :end

:error
echo.
echo ============================================================================
echo ERREUR: Un des scripts a echoue
echo ============================================================================
echo.

:end
pause
