# Ottoman Archives - Automated GitHub Setup Script (PowerShell)
# Bu script GitHub setup'ını otomatikleştirir

Write-Host "🚀 Ottoman Archives - GitHub Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Get GitHub username
$GITHUB_USERNAME = Read-Host "GitHub kullanıcı adınız"

# Set repository URL
$REPO_URL = "https://github.com/$GITHUB_USERNAME/ottoman-archives.git"

Write-Host ""
Write-Host "📦 Git remote ekleniyor..." -ForegroundColor Yellow
git remote add origin $REPO_URL

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Remote zaten var, güncelleniyor..." -ForegroundColor Yellow
    git remote set-url origin $REPO_URL
}

Write-Host ""
Write-Host "🔄 GitHub'a push ediliyor..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ GitHub setup tamamlandı!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository URL: $REPO_URL" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎯 Sonraki adım: Vercel'e deploy" -ForegroundColor Magenta
    Write-Host "   1. Şu adresi açın: https://vercel.com/new" -ForegroundColor White
    Write-Host "   2. Repository'nizi import edin: ottoman-archives" -ForegroundColor White
    Write-Host "   3. Deploy'a tıklayın (varsayılan ayarlar yeterli)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Push başarısız oldu. GitHub'da repository oluşturdunuz mu?" -ForegroundColor Red
    Write-Host ""
    Write-Host "Adımlar:" -ForegroundColor Yellow
    Write-Host "1. https://github.com/new adresine gidin" -ForegroundColor White
    Write-Host "2. Repository name: ottoman-archives" -ForegroundColor White
    Write-Host "3. 'Create repository' butonuna tıklayın" -ForegroundColor White
    Write-Host "4. Bu script'i tekrar çalıştırın" -ForegroundColor White
    Write-Host ""
}
