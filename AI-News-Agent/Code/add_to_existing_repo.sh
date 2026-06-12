#!/bin/bash
# AI News Agent - Add to Existing GitHub Repository Script
# This script adds the AI News Agent as a subfolder to your existing repo

echo "🚀 Adding AI News Agent to Existing GitHub Repository..."
echo ""

# Get the existing repo details
read -p "Enter your existing GitHub repository URL (e.g., https://github.com/username/my-projects.git): " repo_url

if [ -z "$repo_url" ]; then
    echo "❌ No repository URL provided"
    exit 1
fi

# Extract repo name from URL
repo_name=$(basename "$repo_url" .git)

# Ask for the folder name in the repo
echo ""
read -p "Enter folder name for this project in your repo (default: ai-news-agent): " folder_name
folder_name=${folder_name:-ai-news-agent}

echo ""
echo "📋 Summary:"
echo "   Repository: $repo_url"
echo "   Project folder: $folder_name/"
echo ""

# Create a temporary directory
temp_dir="/tmp/github_repo_$$"
echo "📦 Cloning your existing repository..."
git clone "$repo_url" "$temp_dir"

if [ $? -ne 0 ]; then
    echo "❌ Failed to clone repository"
    echo "   Make sure the URL is correct and you have access"
    exit 1
fi

echo "✅ Repository cloned"
echo ""

# Create the project folder
mkdir -p "$temp_dir/$folder_name"

# Copy all files except git-related and sensitive files
echo "📁 Copying AI News Agent files..."
rsync -av --progress \
    --exclude='.git' \
    --exclude='.env' \
    --exclude='logs/' \
    --exclude='__pycache__/' \
    --exclude='*.pyc' \
    --exclude='venv/' \
    --exclude='cache/' \
    ./ "$temp_dir/$folder_name/"

echo "✅ Files copied"
echo ""

# Change to repo directory
cd "$temp_dir"

# Show what will be committed
echo "📋 Files to be committed:"
git add "$folder_name/"
git status --short
echo ""

# Confirm before proceeding
read -p "Do you want to commit and push these files? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "❌ Aborted"
    rm -rf "$temp_dir"
    exit 1
fi

# Commit
echo ""
echo "💾 Creating commit..."
git commit -m "Add AI News Agent project

Added $folder_name/ - Automated daily AI news digest system

Features:
- Multi-source news aggregation (TechCrunch, VentureBeat, MIT Tech Review, ArXiv)
- Intelligent keyword-based filtering for AI/LLM content
- Beautiful HTML email formatting
- Gmail SMTP integration
- Automated daily scheduling via LaunchAgent
- Comprehensive logging and error handling

Built with Python 3.14"

if [ $? -eq 0 ]; then
    echo "✅ Commit created successfully"
    echo ""
else
    echo "❌ Commit failed"
    rm -rf "$temp_dir"
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main || git push origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🎉 Your AI News Agent is now in your repository!"
    echo "   Repository: $repo_url"
    echo "   Location: $folder_name/"
    echo ""
    echo "📝 View it on GitHub:"
    echo "   ${repo_url%.git}/tree/main/$folder_name"
    echo ""
    
    # Cleanup
    cd -
    rm -rf "$temp_dir"
    
    echo "✨ Done! Your project is now on GitHub."
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "   - Authentication failed (use personal access token)"
    echo "   - No permission to push"
    echo "   - Branch name might be 'master' instead of 'main'"
    echo ""
    echo "The repository is in: $temp_dir"
    echo "You can manually push from there:"
    echo "   cd $temp_dir"
    echo "   git push origin main"
    echo ""
fi

# Made with Bob
