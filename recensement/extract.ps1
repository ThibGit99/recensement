# Liste des sites
$sites = @('armement', 'bibliotheque', 'securite-info', 'challenge')

# Chemin de base du projet
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$importBase = Join-Path $scriptDir "importer"
$destBase = Join-Path $scriptDir "public\files"

# Chemin vers 7-Zip à changer selon l'emplacement
$sevenZipExe = "C:\7-Zip\7z.exe"

# Vérification que 7-Zip existe
if (-not (Test-Path $sevenZipExe)) {
    Write-Error "7-Zip introuvable à l'emplacement $sevenZipExe"
    exit 1
}

# Boucle sur chaque site
foreach ($site in $sites) {
    $siteImportPath = Join-Path $importBase $site

    if (-not (Test-Path $siteImportPath)) {
        Write-Warning "Dossier introuvable pour le site : $site"
        continue
    }

    # Recherche des fichiers .7z dans le dossier du site
    $zipFiles = Get-ChildItem -Path $siteImportPath -Filter "*.7z"

    foreach ($zipFile in $zipFiles) {
        $dateStr = [System.IO.Path]::GetFileNameWithoutExtension($zipFile.Name)

        # Vérifie le format de date
        if ($dateStr -notmatch '^\d{4}-\d{2}-\d{2}$') {
            Write-Warning "Nom de fichier invalide (attendu : yyyy-MM-dd.7z) : $($zipFile.Name)"
            continue
        }

        # Création du chemin de destination
        $dateParts = $dateStr.Split('-')
        $destPath = Join-Path $destBase "$site\$($dateParts[0])\$($dateParts[1])\$($dateParts[2])"

        # Crée le dossier destination si nécessaire
        try {
            New-Item -ItemType Directory -Force -Path $destPath | Out-Null
        } catch {
            Write-Error "Impossible de créer le dossier de destination pour $site - $dateStr"
            continue
        }

        # Décompression
        Write-Host "`nDécompression de $($zipFile.Name) pour le site '$site'..."
        try {
            & $sevenZipExe x "`"$($zipFile.FullName)`"" "`"-o$destPath`"" -y
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Décompression réussie vers : $destPath" -ForegroundColor Green
            } else {
                Write-Error " Erreur lors de la décompression (code : $LASTEXITCODE)"
            }
        } catch {
            Write-Error "Erreur d’exécution avec 7-Zip : $($_.Exception.Message)"
        }
    }
}

Write-Host "`nScript terminé." -ForegroundColor Cyan
