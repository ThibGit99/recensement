# Parametres passes depuis l'API
param(
    [Parameter(Mandatory=$false)]
    [string]$Site,
    
    [Parameter(Mandatory=$false)]
    [string]$DateStr
)

# Liste des sites
$sites = @('armement', 'bibliotheque', 'secureinfo', 'challenge')

# Chemin de base du projet
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$importBase = Join-Path $scriptDir "importer"
$destBase = Join-Path $scriptDir "public\files"

# Chemin vers 7-Zip a changer selon l'emplacement
$sevenZipExe = "C:\7-Zip\7z.exe"

# Verification que 7-Zip existe
if (-not (Test-Path $sevenZipExe)) {
    Write-Error "7-Zip introuvable a l'emplacement $sevenZipExe"
    exit 1
}

# Verification des parametres
if ([string]::IsNullOrEmpty($Site)) {
    Write-Error "Parametre Site manquant. Utilisation: .\extract.ps1 -Site 'nomdusite' -DateStr 'yyyy-mm-dd'"
    exit 1
}

if ([string]::IsNullOrEmpty($DateStr)) {
    Write-Error "Parametre DateStr manquant. Utilisation: .\extract.ps1 -Site 'nomdusite' -DateStr 'yyyy-mm-dd'"
    exit 1
}

# Verification que le site est valide
if ($Site -notin $sites) {
    Write-Error "Site invalide : $Site. Sites disponibles: $($sites -join ', ')"
    exit 1
}

# Verification du format de date
if ($DateStr -notmatch '^\d{4}-\d{2}-\d{2}$') {
    Write-Error "Format de date invalide (attendu : yyyy-MM-dd) : $DateStr"
    exit 1
}

# Construction des chemins
$siteImportPath = Join-Path $importBase $Site
$zipFileName = "$DateStr.7z"
$zipFilePath = Join-Path $siteImportPath $zipFileName

# Verification que le fichier 7z existe
if (-not (Test-Path $zipFilePath)) {
    Write-Error "Fichier 7z introuvable : $zipFilePath"
    exit 1
}

# Creation du chemin de destination
$dateParts = $DateStr.Split('-')
$destPath = Join-Path $destBase "$Site\$($dateParts[0])\$($dateParts[1])\$($dateParts[2])"

# Cree le dossier destination si necessaire
try {
    New-Item -ItemType Directory -Force -Path $destPath | Out-Null
    Write-Host "Dossier de destination cree/verifie : $destPath"
} catch {
    Write-Error "Impossible de creer le dossier de destination pour $Site - $DateStr : $($_.Exception.Message)"
    exit 1
}

# Decompression
Write-Host "Decompression de $zipFileName pour le site '$Site'..."
try {
    $arguments = @(
        'x',
        "`"$zipFilePath`"",
        "`"-o$destPath`"",
        '-y'
    )
    
    Write-Host "Execution de : $sevenZipExe $($arguments -join ' ')"
    & $sevenZipExe @arguments
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Decompression reussie vers : $destPath" -ForegroundColor Green
    } else {
        Write-Error "Erreur lors de la decompression (code : $LASTEXITCODE)"
        exit 1
    }
} catch {
    Write-Error "Erreur d'execution avec 7-Zip : $($_.Exception.Message)"
    exit 1
}

Write-Host "Extraction terminee avec succes." -ForegroundColor Green