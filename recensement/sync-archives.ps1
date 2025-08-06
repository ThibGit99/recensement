$sourceRoot = "D:\ArchivesSites"
$targetRoot = ".\7z_files"

Get-ChildItem -Directory -Path $sourceRoot | ForEach-Object {
    $siteName = $_.Name
    $siteSource = $_.FullName
    $siteTarget = Join-Path $targetRoot $siteName

    New-Item -ItemType Directory -Force -Path $siteTarget | Out-Null

    Get-ChildItem -Path $siteSource -Filter *.7z | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $siteTarget -Force
    }
}
