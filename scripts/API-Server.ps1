$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { "$PWD\scripts" }

. "$ScriptDir\Unit-Manager.ps1"
. "$ScriptDir\Mech-Builder.ps1"

$Port = 8085
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

try {
    $listener.Start()
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host " PowerShell BT-Manager API Server Online! " -ForegroundColor Green
    Write-Host " Listening on http://localhost:$Port/          " -ForegroundColor Yellow
    Write-Host "==============================================" -ForegroundColor Cyan

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # CORS Headers for Web Dashboard
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        $rawUrl = $request.RawUrl
        $method = $request.HttpMethod
        $responseData = $null

        # Route: GET /roster
        if ($method -eq "GET" -and $rawUrl -eq "/roster") {
            $responseData = Get-Roster
        }
        # Route: POST /builder/validate
        elseif ($method -eq "POST" -and $rawUrl -eq "/builder/validate") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
            $bodyJson = $reader.ReadToEnd() | ConvertFrom-Json
            
            # Convert JSON object to Hashtable for Test-MechLocationBuild
            $locHash = @{}
            if ($bodyJson.LocationEquipment) {
                foreach ($prop in $bodyJson.LocationEquipment.psobject.Properties) {
                    $locHash[$prop.Name] = $prop.Value
                }
            }

            $responseData = Test-MechLocationBuild -MaxTonnage $bodyJson.MaxTonnage -LocationEquipment $locHash
        }
        else {
            $responseData = @{ error = "Route not found" }
            $response.StatusCode = 404
        }

        # Send JSON Response
        $jsonString = $responseData | ConvertTo-Json -Depth 5
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonString)
        $response.ContentType = "application/json"
        $response.ContentLength64 = $buffer.Length
        $output = $response.OutputStream
        $output.Write($buffer, 0, $buffer.Length)
        $output.Close()
    }
}
catch {
    Write-Error "Failed to start server: $_"
}
finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
}
