$ErrorActionPreference = 'Stop'

$workspace = 'C:\Users\Admin\.openclaw\workspace'
$backupRoot = Join-Path $workspace 'backups'
$now = Get-Date

$weekStart = $now.Date.AddDays(-(([int]$now.DayOfWeek + 6) % 7))
$weekLabel = 'week-of-' + $weekStart.ToString('yyyy-MM-dd')
$dayLabel = $now.ToString('ddd').ToLower()

$weekDir = Join-Path $backupRoot $weekLabel
$dayDir = Join-Path $weekDir $dayLabel

New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null
New-Item -ItemType Directory -Force -Path $weekDir | Out-Null

if (Test-Path $dayDir) {
    Remove-Item -Recurse -Force $dayDir
}
New-Item -ItemType Directory -Force -Path $dayDir | Out-Null

$excludeDirs = @(
    'node_modules',
    '.git',
    'backups'
)

Get-ChildItem -Path $workspace -Force | ForEach-Object {
    if ($excludeDirs -contains $_.Name) {
        return
    }
    $dest = Join-Path $dayDir $_.Name
    if ($_.PSIsContainer) {
        Copy-Item $_.FullName -Destination $dest -Recurse -Force
    } else {
        Copy-Item $_.FullName -Destination $dest -Force
    }
}

Get-ChildItem -Path $backupRoot -Directory | Where-Object {
    $_.LastWriteTime -lt $weekStart.AddDays(-28)
} | Remove-Item -Recurse -Force

Write-Output ("Weekly workspace backup complete: {0}" -f $dayDir)
