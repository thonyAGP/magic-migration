# OpenSpec Viewer - Installation comme tache planifiee Windows
# Execute en tant qu'administrateur pour installer

param(
    [switch]$Install,
    [switch]$Uninstall,
    [switch]$Status
)

$taskName = "OpenSpecViewer"
$workingDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 3070

function Install-Service {
    Write-Host "`n  Installation du service OpenSpec Viewer..." -ForegroundColor Cyan

    # Creer le script de demarrage
    $startScript = @"
@echo off
cd /d "$workingDir"
npx serve -l $port . --no-clipboard
"@
    $startScriptPath = Join-Path $workingDir "start-service.cmd"
    $startScript | Set-Content $startScriptPath -Encoding ASCII

    # Supprimer si existe deja
    $existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($existing) {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    }

    # Creer la tache planifiee
    $action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$startScriptPath`"" -WorkingDirectory $workingDir
    $trigger = New-ScheduledTaskTrigger -AtLogOn
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 0)
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "OpenSpec Viewer - Serveur HTTP pour documentation"

    Write-Host "`n  [OK] Service installe !" -ForegroundColor Green
    Write-Host "  - Demarre automatiquement a la connexion"
    Write-Host "  - URL: http://localhost:${port}/viewer.html"
    Write-Host "`n  Pour demarrer maintenant: Start-ScheduledTask -TaskName '$taskName'" -ForegroundColor Yellow
}

function Uninstall-Service {
    Write-Host "`n  Desinstallation du service..." -ForegroundColor Cyan

    $existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($existing) {
        Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
        Write-Host "  [OK] Service desinstalle" -ForegroundColor Green
    } else {
        Write-Host "  Service non trouve" -ForegroundColor Yellow
    }
}

function Show-Status {
    Write-Host "`n  Statut du service OpenSpec Viewer" -ForegroundColor Cyan
    Write-Host "  ---------------------------------"

    $task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($task) {
        $info = Get-ScheduledTaskInfo -TaskName $taskName
        Write-Host "  Etat: $($task.State)" -ForegroundColor $(if ($task.State -eq 'Running') { 'Green' } else { 'Yellow' })
        Write-Host "  Derniere execution: $($info.LastRunTime)"
        Write-Host "  Resultat: $($info.LastTaskResult)"
    } else {
        Write-Host "  Service non installe" -ForegroundColor Red
    }

    # Verifier si le port est utilise
    $listening = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($listening) {
        Write-Host "`n  Port ${port}: ACTIF" -ForegroundColor Green
        Write-Host "  URL: http://localhost:${port}/viewer.html"
    } else {
        Write-Host "`n  Port ${port}: INACTIF" -ForegroundColor Yellow
    }
}

# Menu interactif si pas de parametre
if (-not $Install -and -not $Uninstall -and -not $Status) {
    Write-Host "`n  =============================================" -ForegroundColor Cyan
    Write-Host "   OpenSpec Viewer - Gestionnaire de Service" -ForegroundColor Cyan
    Write-Host "  =============================================" -ForegroundColor Cyan

    Show-Status

    Write-Host "`n  Options:" -ForegroundColor White
    Write-Host "    [I] Installer le service"
    Write-Host "    [U] Desinstaller le service"
    Write-Host "    [S] Demarrer maintenant"
    Write-Host "    [Q] Quitter"
    Write-Host ""

    $choice = Read-Host "  Choix"

    switch ($choice.ToUpper()) {
        "I" { Install-Service }
        "U" { Uninstall-Service }
        "S" {
            Start-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            Show-Status
        }
        "Q" { }
    }
} elseif ($Install) {
    Install-Service
} elseif ($Uninstall) {
    Uninstall-Service
} elseif ($Status) {
    Show-Status
}

Write-Host ""
