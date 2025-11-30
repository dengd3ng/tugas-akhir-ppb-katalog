# Decode all .b64 files in public/icons to .png files
$srcDir = Join-Path $PSScriptRoot '..\public\icons' | Resolve-Path
$files = Get-ChildItem -Path $srcDir -Filter "*.b64" -File -ErrorAction SilentlyContinue
if (-not $files) {
    Write-Host "No .b64 files found in $srcDir"
    exit 0
}
foreach ($f in $files) {
    $b64 = Get-Content $f.FullName -Raw
    try {
        $bytes = [System.Convert]::FromBase64String($b64)
    } catch {
        Write-Host "Failed to decode $($f.Name): $_" -ForegroundColor Red
        continue
    }
    $out = [System.IO.Path]::ChangeExtension($f.FullName, '.png')
    [System.IO.File]::WriteAllBytes($out, $bytes)
    Write-Host "Wrote $out"
}
Write-Host "Done. You can now use the PNG files at public/icons/*.png"