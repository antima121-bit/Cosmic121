# Setup Environment Variables for Mythos Engine
# This script will create the .env.local file with your API key

Write-Host "Setting up Mythos Engine Environment Variables..." -ForegroundColor Green

$envContent = @"
# Mythos Engine Environment Variables

# OpenAI Configuration (Primary Service)
OPENAI_API_KEY=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
OPENAI_MODEL=gpt-4-turbo-preview

# Image Generation APIs
DALLE_API_KEY=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

# Content Safety & Validation
OPENAI_MODERATION_API_KEY=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
CONTENT_FILTER_LEVEL=strict

# Application Configuration
NODE_ENV=development
MAX_GENERATION_ATTEMPTS=3
CONTENT_SAFETY_ENABLED=true
QUALITY_VALIDATION_ENABLED=true

# Rate Limiting (More generous for development)
RATE_LIMIT_REQUESTS_PER_MINUTE=50
RATE_LIMIT_WINDOW_MS=60000
"@

try {
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host ".env.local file created successfully!" -ForegroundColor Green
    Write-Host "File location: $(Get-Location)\.env.local" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Restart your development server: pnpm dev" -ForegroundColor White
    Write-Host "2. Try generating a comic panel" -ForegroundColor White
    Write-Host "3. The app will now use real AI generation!" -ForegroundColor White
    
} catch {
    Write-Host "Error creating .env.local file: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please create the file manually with the content above" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "If you need to reset rate limits, run: .\scripts\reset-limits.ps1" -ForegroundColor Cyan
