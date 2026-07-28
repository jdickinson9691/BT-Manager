function Test-MechLocationBuild {
    param (
        [Parameter(Mandatory=$true)][int]$MaxTonnage,
        [Parameter(Mandatory=$true)][hashtable]$LocationEquipment, # e.g. @{ "RA" = @("PPC", "Medium Laser"); "LT" = @("LRM15", "Heatsink") }
        [string]$TechBase = "Inner Sphere"
    )

    # Standard Critical Slot Capacities (Free Slots Available for Weapons/Equip)
    $MaxSlotsPerLocation = @{
        "HD" = 3   # Head
        "CT" = 2   # Center Torso (after engine/gyro)
        "LT" = 12  # Left Torso
        "RT" = 12  # Right Torso
        "LA" = 8   # Left Arm (Standard Hand Actuator)
        "RA" = 8   # Right Arm (Standard Hand Actuator)
        "LL" = 2   # Left Leg
        "RL" = 2   # Right Leg
    }

    # Component Database
    $ComponentDB = @{
        "PPC"          = @{ Tonnage = 7.0;  Slots = 3; Cost = 300000; BV2 = 176; Type = "Energy" }
        "Medium Laser" = @{ Tonnage = 1.0;  Slots = 1; Cost = 40000;  BV2 = 46;  Type = "Energy" }
        "Small Laser"  = @{ Tonnage = 0.5;  Slots = 1; Cost = 11250;  BV2 = 9;   Type = "Energy" }
        "AC10"         = @{ Tonnage = 12.0; Slots = 7; Cost = 200000; BV2 = 123; Type = "Ballistic" }
        "AC20"         = @{ Tonnage = 14.0; Slots = 10; Cost = 300000; BV2 = 178; Type = "Ballistic" }
        "LRM15"        = @{ Tonnage = 7.0;  Slots = 3; Cost = 100000; BV2 = 136; Type = "Missile" }
        "SRM6"         = @{ Tonnage = 3.0;  Slots = 2; Cost = 80000;  BV2 = 59;  Type = "Missile" }
        "Heatsink"     = @{ Tonnage = 1.0;  Slots = 1; Cost = 2000;   BV2 = 0;   Type = "Equipment" }
        "Ammo (AC10)"  = @{ Tonnage = 1.0;  Slots = 1; Cost = 10000;  BV2 = 15;  Type = "Ammo" }
        "Ammo (LRM15)" = @{ Tonnage = 1.0;  Slots = 1; Cost = 30000;  BV2 = 17;  Type = "Ammo" }
    }

    $totalTonnage = 0
    $totalSlotsUsed = 0
    $totalCBillCost = 0
    $totalBV2 = 0
    $locationValidation = @{}
    $isBuildValid = $true
    $errors = @()

    # Track usage per location
    foreach ($loc in $MaxSlotsPerLocation.Keys) {
        $usedInLoc = 0
        if ($LocationEquipment.ContainsKey($loc)) {
            $items = $LocationEquipment[$loc]
            foreach ($item in $items) {
                if ($ComponentDB.ContainsKey($item)) {
                    $spec = $ComponentDB[$item]
                    $usedInLoc += $spec.Slots
                    $totalTonnage += $spec.Tonnage
                    $totalCBillCost += $spec.Cost
                    $totalBV2 += $spec.BV2
                    $totalSlotsUsed += $spec.Slots
                } else {
                    $errors += "Unknown component '$item' in $loc"
                }
            }
        }

        $maxLoc = $MaxSlotsPerLocation[$loc]
        $locValid = $usedInLoc -le $maxLoc
        if (-not $locValid) {
            $isBuildValid = $false
            $errors += "Location $loc exceeded capacity! ($usedInLoc / $maxLoc slots)"
        }

        $locationValidation[$loc] = @{
            Used = $usedInLoc
            Max  = $maxLoc
            Fits = $locValid
        }
    }

    # Weight check
    $chassisWeight = $MaxTonnage * 0.5
    $finalTonnage = $totalTonnage + $chassisWeight
    if ($finalTonnage -gt $MaxTonnage) {
        $isBuildValid = $false
        $errors += "Exceeded tonnage limit! ($finalTonnage Tons / $MaxTonnage Tons)"
    }

    # Refit classification
    $refitClass = if ($totalSlotsUsed -le 2) { "Class A (Field Weapon Swap)" }
                  elseif ($totalSlotsUsed -le 6) { "Class B (Complex Weapon Swap)" }
                  elseif ($totalSlotsUsed -le 10) { "Class C (Maintenance Refit)" }
                  else { "Class D/E (Factory Overhaul)" }

    $multiplier = if ($TechBase -eq "Clan") { 1.5 } else { 1.0 }
    $spCost = [Math]::Round(($MaxTonnage * 0.4) * $multiplier, 2)
    $laborHours = [Math]::Round(($totalSlotsUsed * 2.5) * $multiplier, 1)

    [PSCustomObject]@{
        Valid              = $isBuildValid
        MaxTonnage         = $MaxTonnage
        FinalTonnage       = $finalTonnage
        FreeTonnage        = ($MaxTonnage - $finalTonnage)
        TotalSlotsUsed     = $totalSlotsUsed
        EstimatedBV2       = $totalBV2
        RefitClass         = $refitClass
        SPCost             = $spCost
        CBillEquipmentCost = $totalCBillCost
        LaborHours         = $laborHours
        LocationBreakdown  = $locationValidation
        ValidationErrors   = $errors
    }
}
