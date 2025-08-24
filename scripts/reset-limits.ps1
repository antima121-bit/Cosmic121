# Reset Rate Limits Script for Mythos Engine Development
# Run this script when you hit rate limit errors during development

param(
    [string]$Port = "3001"
)

Write-Host "🔄 Resetting rate limits for Mythos Engine..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:$Port/api/reset-rate-limits" -Method POST
    
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "✅ Rate limits reset successfully!" -ForegroundColor Green
        Write-Host "📅 Reset at: $($result.timestamp)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Failed to reset rate limits. Status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error resetting rate limits: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure the development server is running on port $Port" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 You can now continue generating comic panels!" -ForegroundColor Green
