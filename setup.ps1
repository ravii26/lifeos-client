# One-time setup for the Ally / LifeOS web app on Windows. Safe to run again.
# Run with: powershell -ExecutionPolicy Bypass -File setup.ps1
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Step($message) { Write-Host "`n==> $message" -ForegroundColor Cyan }
function Run($command, [string[]]$arguments) {
    & $command @arguments
    if ($LASTEXITCODE -ne 0) { throw "Failed: $command $($arguments -join ' ')" }
}

Step 'Checking tools'
if (-not (Get-Command 'node' -ErrorAction SilentlyContinue)) {
    throw 'node is missing. Install it with: winget install --id OpenJS.NodeJS.LTS -e   then open a new terminal and run this again.'
}
if ([int]((node -v) -replace '^v(\d+).*', '$1') -lt 20) { throw 'Node 20 or newer is required.' }

Step 'Creating .env (an existing .env is never overwritten)'
$envPath = Join-Path $PSScriptRoot '.env'
if (Test-Path $envPath) {
    Write-Host '.env already exists, keeping it.'
} else {
    # Without a BOM, because Vite would otherwise read it as part of the first key.
    [IO.File]::WriteAllLines($envPath, [string[]]@('VITE_API_BASE_URL=http://localhost:3000/api/v1'), (New-Object Text.UTF8Encoding($false)))
    Write-Host 'Created .env pointing at the local API.'
}

Step 'Installing npm packages'
Run 'npm' @('ci')

Step 'Done'
Write-Host 'Start the API first (see ..\lifeos-server), then:  npm run dev   and open http://localhost:5173'
