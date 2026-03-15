$maxRetries = 20
$retryCount = 0
$success = $false

while (-not $success -and $retryCount -lt $maxRetries) {
    Write-Host "Attempting docker-compose up..."
    docker-compose up -d --build
    if ($LASTEXITCODE -eq 0) {
        $success = $true
        Write-Host "Successfully started containers!"
    } else {
        $retryCount++
        Write-Host "Failed. Retrying in 10 seconds..."
        Start-Sleep -Seconds 10
    }
}
