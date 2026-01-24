#!/bin/bash
# Ottoman Archives - Automated GitHub Setup Script
# This script will guide you through the GitHub setup

echo "🚀 Ottoman Archives - GitHub Setup"
echo "=================================="
echo ""

# Get GitHub username
read -p "GitHub kullanıcı adınız: " GITHUB_USERNAME

# Set repository URL
REPO_URL="https://github.com/$GITHUB_USERNAME/ottoman-archives.git"

echo ""
echo "📦 Setting up Git remote..."
git remote add origin $REPO_URL

echo ""
echo "🔄 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ GitHub setup complete!"
echo ""
echo "Repository URL: $REPO_URL"
echo ""
echo "🎯 Next: Deploy to Vercel"
echo "   1. Go to: https://vercel.com/new"
echo "   2. Import your repository: ottoman-archives"
echo "   3. Click Deploy (default settings are fine)"
echo ""
