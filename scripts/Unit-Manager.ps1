param (
    [string]$DataPath = "$PSScriptRoot\..\data\roster.json"
)

$Dir = Split-Path $DataPath
if (-not (Test-Path $Dir)) { New-Item -ItemType Directory -Path $Dir | Out-Null }
if (-not (Test-Path $DataPath)) { "[]" | Out-File $DataPath -Encoding utf8 }

function Get-Roster {
    $content = Get-Content $DataPath -Raw | ConvertFrom-Json
    if ($null -eq $content) { return @() }
    # Force result to always be an array even if 0 or 1 item exists
    return @($content)
}

function Add-Unit {
    param (
        [Parameter(Mandatory=$true)][string]$Chassis,
        [Parameter(Mandatory=$true)][string]$Model,
        [Parameter(Mandatory=$true)][int]$Tonnage,
        [ValidateSet("BattleMech", "Vehicle", "VTOL", "Hover")][string]$UnitType = "BattleMech",
        [ValidateSet("Inner Sphere", "Clan")][string]$TechBase = "Inner Sphere",
        [int]$BV2 = 1000
    )

    [array]$roster = Get-Roster
    $newId = if ($roster.Count -gt 0) { ($roster | Measure-Object -Property Id -Maximum).Maximum + 1 } else { 1 }

    $unit = [PSCustomObject]@{
        Id              = $newId
        UnitType        = $UnitType
        Chassis         = $Chassis
        Model           = $Model
        Tonnage         = $Tonnage
        TechBase        = $TechBase
        BV2             = $BV2
        ArmorDamage     = 0
        StructureDamage = 0
        MotiveDamage    = 0
    }

    $roster += $unit
    $roster | ConvertTo-Json -Depth 5 | Out-File $DataPath -Encoding utf8
    Write-Host "Added $UnitType`: $Chassis ($Model) [ID: $newId]" -ForegroundColor Green
}

function Set-UnitDamage {
    param (
        [Parameter(Mandatory=$true)][int]$Id,
        [int]$ArmorDamage = 0,
        [int]$StructureDamage = 0,
        [int]$MotiveDamage = 0
    )

    [array]$roster = Get-Roster
    $unit = $roster | Where-Object { $_.Id -eq $Id }

    if (-not $unit) {
        Write-Error "Unit ID $Id not found!"
        return
    }

    $unit.ArmorDamage = [Math]::Max(0, $ArmorDamage)
    $unit.StructureDamage = [Math]::Max(0, $StructureDamage)
    $unit.MotiveDamage = [Math]::Max(0, $MotiveDamage)

    $roster | ConvertTo-Json -Depth 5 | Out-File $DataPath -Encoding utf8
    Write-Host "Updated damage for $($unit.Chassis) ($($unit.Model))" -ForegroundColor Yellow
}
