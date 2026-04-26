param(
    [string]$FirebaseProjectId = 'whisper-wall-campus',
    [string]$FirebaseWebApiKey = 'AIzaSyCg5jwzJVauo_OATf9O9-QYM30UWKwoYEI',
    [string]$FirebaseCredentialsPath = '',
    [string]$FirestoreDatabaseId = 'default'
)

$ErrorActionPreference = 'Stop'

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path $workspaceRoot 'whisperwall'
$frontendRoot = Join-Path $workspaceRoot 'whisper-wall'

if ($FirebaseWebApiKey) {
    $env:FIREBASE_PROJECT_ID = $FirebaseProjectId
    $env:FIREBASE_WEB_API_KEY = $FirebaseWebApiKey
    $env:FIREBASE_CREDENTIALS_PATH = $FirebaseCredentialsPath
    $env:FIRESTORE_DATABASE_ID = $FirestoreDatabaseId
}

Write-Host 'Backend folder:' $backendRoot
Write-Host 'Frontend folder:' $frontendRoot
Write-Host ''
Write-Host 'Backend checks:'
Push-Location $backendRoot
python manage.py check
python manage.py test core
Pop-Location
Write-Host ''
Write-Host 'Seed demo data:'
Push-Location $backendRoot
python manage.py seed_test_data
Pop-Location
Write-Host ''
Write-Host 'Frontend install and checks:'
Push-Location $frontendRoot
npm install
npm run build
npm test -- --watch=false
Pop-Location
Write-Host ''
Write-Host 'Start the apps manually if you want to try them:'
Write-Host '  Backend:  Set-Location whisperwall; python manage.py runserver 8000'
Write-Host '  Frontend: Set-Location whisper-wall; npm start'
