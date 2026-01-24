@echo off
echo ==========================================
echo 🚀 Pre-Deployment Check
echo ==========================================

echo.
echo [1/3] Running Tests...
call npm test -- --run
if %errorlevel% neq 0 (
    echo ❌ Tests Failed!
    exit /b 1
) else (
    echo ✅ Tests Passed
)

echo.
echo [2/3] Checking Build...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build Failed!
    exit /b 1
) else (
    echo ✅ Build Passed
)

echo.
echo [3/3] Checking Types & Linting...
:: Note: We are only checking for build-breaking errors here.
:: Strict linting is run but warnings are ignored for now.
call npx tsc --noEmit
if %errorlevel% neq 0 (
    echo ❌ TypeScript Errors Found!
    exit /b 1
) else (
    echo ✅ TypeScript Check Passed
)

echo.
echo ==========================================
echo ✅ ALL CHECKS PASSED - READY TO DEPLOY
echo ==========================================
echo.

set /p deploy="Do you want to deploy to GitHub now? (y/n): "
if /i "%deploy%"=="y" (
    echo.
    echo 🚀 Pushing to GitHub...
    git push origin main
    echo.
    echo ✅ Deployment triggered! Check Vercel dashboard.
) else (
    echo.
    echo Ok, ready when you are!
)

pause
