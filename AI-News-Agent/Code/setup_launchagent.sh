#!/bin/bash
# AI News Agent - LaunchAgent Setup Script
# This script creates and loads a macOS LaunchAgent for daily execution

echo "🚀 Setting up AI News Agent LaunchAgent..."
echo ""

# Get the absolute path to the project
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PYTHON_PATH=$(which python3)

echo "Project Directory: $PROJECT_DIR"
echo "Python Path: $PYTHON_PATH"
echo ""

# Create LaunchAgents directory if it doesn't exist
mkdir -p ~/Library/LaunchAgents

# Create the plist file
PLIST_FILE=~/Library/LaunchAgents/com.ainews.agent.plist

cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ainews.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>$PYTHON_PATH</string>
        <string>$PROJECT_DIR/main.py</string>
        <string>--once</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>8</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>$PROJECT_DIR/logs/launchd.log</string>
    <key>StandardErrorPath</key>
    <string>$PROJECT_DIR/logs/launchd.error.log</string>
    <key>RunAtLoad</key>
    <false/>
    <key>WorkingDirectory</key>
    <string>$PROJECT_DIR</string>
</dict>
</plist>
EOF

echo "✅ Created LaunchAgent plist file"
echo ""

# Unload if already loaded (ignore errors)
launchctl unload "$PLIST_FILE" 2>/dev/null

# Load the LaunchAgent
echo "Loading LaunchAgent..."
launchctl load "$PLIST_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ LaunchAgent loaded successfully!"
    echo ""
    echo "📅 Your AI News Agent will now run daily at 8:00 AM IST"
    echo ""
    echo "📊 To check status:"
    echo "   launchctl list | grep ainews"
    echo ""
    echo "📝 To view logs:"
    echo "   tail -f $PROJECT_DIR/logs/launchd.log"
    echo ""
    echo "🛑 To stop (if needed):"
    echo "   launchctl unload ~/Library/LaunchAgents/com.ainews.agent.plist"
    echo ""
    echo "🧪 To test now:"
    echo "   cd $PROJECT_DIR && python3 main.py --once"
    echo ""
else
    echo ""
    echo "❌ Failed to load LaunchAgent"
    echo "Please check the error messages above"
    exit 1
fi

# Made with Bob
