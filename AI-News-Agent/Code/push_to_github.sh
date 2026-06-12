#!/bin/bash
# AI News Agent - GitHub Push Script
# This script initializes git and pushes the project to GitHub

echo "🚀 Preparing AI News Agent for GitHub..."
echo ""

# Check if .env exists and warn user
if [ -f ".env" ]; then
    echo "⚠️  IMPORTANT: Your .env file contains sensitive information!"
    echo "   It is already in .gitignore and will NOT be pushed to GitHub."
    echo "   Only .env.example will be pushed (without your passwords)."
    echo ""
fi

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git initialized"
    echo ""
else
    echo "✅ Git already initialized"
    echo ""
fi

# Configure git user if not set
if [ -z "$(git config user.name)" ]; then
    echo "⚙️  Git user not configured. Please enter your details:"
    read -p "Enter your name: " git_name
    read -p "Enter your email: " git_email
    git config user.name "$git_name"
    git config user.email "$git_email"
    echo "✅ Git user configured"
    echo ""
fi

# Show what will be committed
echo "📋 Files to be committed:"
git add -A
git status --short
echo ""

# Confirm before proceeding
read -p "Do you want to commit these files? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "❌ Aborted"
    exit 1
fi

# Commit
echo ""
echo "💾 Creating commit..."
git commit -m "Initial commit: AI News Agent - Automated daily AI news digest system

Features:
- Multi-source news aggregation (TechCrunch, VentureBeat, MIT Tech Review, ArXiv)
- Intelligent keyword-based filtering for AI/LLM content
- Beautiful HTML email formatting
- Gmail SMTP integration
- Automated daily scheduling via LaunchAgent
- Comprehensive logging and error handling
- Modular, maintainable architecture

Built with Python 3.14"

if [ $? -eq 0 ]; then
    echo "✅ Commit created successfully"
    echo ""
else
    echo "❌ Commit failed"
    exit 1
fi

# Ask for GitHub repository URL
echo "📡 GitHub Repository Setup"
echo ""
echo "Please create a new repository on GitHub first:"
echo "   1. Go to https://github.com/new"
echo "   2. Create a new repository (e.g., 'ai-news-agent')"
echo "   3. Do NOT initialize with README, .gitignore, or license"
echo "   4. Copy the repository URL"
echo ""
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/ai-news-agent.git): " repo_url

if [ -z "$repo_url" ]; then
    echo "❌ No repository URL provided"
    exit 1
fi

# Add remote
echo ""
echo "🔗 Adding remote repository..."
git remote add origin "$repo_url" 2>/dev/null || git remote set-url origin "$repo_url"
echo "✅ Remote added: $repo_url"
echo ""

# Push to GitHub
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🎉 Your AI News Agent is now on GitHub!"
    echo "   Repository: $repo_url"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Visit your repository on GitHub"
    echo "   2. Add a description and topics (ai, news, automation, python)"
    echo "   3. Star your own repo! ⭐"
    echo ""
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "   - Repository doesn't exist on GitHub"
    echo "   - Authentication failed (use personal access token)"
    echo "   - Repository URL is incorrect"
    echo ""
    echo "To retry:"
    echo "   git push -u origin main"
    echo ""
fi

# Made with Bob
