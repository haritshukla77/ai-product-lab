# AI News Agent - Deployment Guide

## 🎉 Congratulations!

Your AI News Agent is fully functional and ready for daily automated execution!

## ✅ What's Working

- ✅ Gmail SMTP connection successful
- ✅ News fetching from TechCrunch and MIT Technology Review
- ✅ AI-focused content filtering
- ✅ Beautiful HTML email formatting
- ✅ Email delivery confirmed

## 📅 Daily Automation Options

### Option 1: Python Scheduler (Recommended for Testing)

Run the agent with built-in scheduler:

```bash
cd ai-news-agent
python3 main.py
```

This will:
- Run continuously in the background
- Send digest daily at 8:00 AM IST
- Log all activities to `logs/ai_news_agent.log`

**To stop**: Press `Ctrl+C`

### Option 2: macOS LaunchAgent (Recommended for Production)

Create a LaunchAgent to run automatically on system startup:

1. **Create LaunchAgent file**:
```bash
nano ~/Library/LaunchAgents/com.ainews.agent.plist
```

2. **Paste this configuration**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ainews.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/python3</string>
        <string>/Users/haritshukla/Documents/00_Harit Office/00_Harit_Preparation/AI/2026/AI Projects/IBM_BOB_HaritProjects/ai-news-agent/main.py</string>
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
    <string>/Users/haritshukla/Documents/00_Harit Office/00_Harit_Preparation/AI/2026/AI Projects/IBM_BOB_HaritProjects/ai-news-agent/logs/launchd.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/haritshukla/Documents/00_Harit Office/00_Harit_Preparation/AI/2026/AI Projects/IBM_BOB_HaritProjects/ai-news-agent/logs/launchd.error.log</string>
    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>
```

3. **Load the LaunchAgent**:
```bash
launchctl load ~/Library/LaunchAgents/com.ainews.agent.plist
```

4. **Verify it's loaded**:
```bash
launchctl list | grep ainews
```

5. **To unload** (if needed):
```bash
launchctl unload ~/Library/LaunchAgents/com.ainews.agent.plist
```

### Option 3: Cron Job (Alternative)

1. **Edit crontab**:
```bash
crontab -e
```

2. **Add this line** (runs at 8:00 AM daily):
```
0 8 * * * cd /Users/haritshukla/Documents/00_Harit\ Office/00_Harit_Preparation/AI/2026/AI\ Projects/IBM_BOB_HaritProjects/ai-news-agent && /usr/local/bin/python3 main.py --once >> logs/cron.log 2>&1
```

3. **Save and exit** (`:wq` in vim)

## 🧪 Testing Commands

### Test Email Sending
```bash
cd ai-news-agent
python3 test_smtp.py
```

### Test News Fetching
```bash
python3 test_fetch.py
```

### Generate Preview (No Email)
```bash
python3 main.py --test
```

### Send One Digest Now
```bash
python3 main.py --once
```

## ⚙️ Configuration

Edit `.env` file to customize:

```bash
# Email Settings
GMAIL_USER=harryshukla613@gmail.com
RECIPIENT_EMAIL=harryshukla613@gmail.com

# Schedule (24-hour format)
SCHEDULE_TIME=08:00
TIMEZONE=Asia/Kolkata

# Content Filtering
MIN_RELEVANCE_SCORE=1.0        # Lower = more articles
MAX_ARTICLES_PER_DIGEST=20     # Maximum articles per email

# News Sources (comma-separated)
ENABLED_SOURCES=techcrunch,venturebeat,mit_tech_review,arxiv
```

## 📊 Monitoring

### View Logs
```bash
# Real-time log monitoring
tail -f logs/ai_news_agent.log

# View last 50 lines
tail -n 50 logs/ai_news_agent.log

# Search for errors
grep ERROR logs/ai_news_agent.log
```

### Log Files Location
- Main log: `logs/ai_news_agent.log`
- LaunchAgent log: `logs/launchd.log`
- LaunchAgent errors: `logs/launchd.error.log`

## 🔧 Troubleshooting

### No Email Received
1. Check logs: `tail -f logs/ai_news_agent.log`
2. Verify Gmail App Password is correct
3. Check spam folder
4. Test SMTP: `python3 test_smtp.py`

### No Articles Found
1. Lower `MIN_RELEVANCE_SCORE` in `.env`
2. Check if sources are accessible: `python3 test_fetch.py`
3. Review keyword filters in `src/config.py`

### Scheduler Not Running
1. Check if process is running: `ps aux | grep main.py`
2. For LaunchAgent: `launchctl list | grep ainews`
3. Check system time matches schedule time

## 🚀 Quick Start Commands

```bash
# Start daily scheduler (runs continuously)
python3 main.py

# Or use LaunchAgent (runs at 8 AM daily)
launchctl load ~/Library/LaunchAgents/com.ainews.agent.plist
```

## 📝 Notes

- **First Run**: May take 1-2 minutes to fetch and process articles
- **Email Delivery**: Usually arrives within 30 seconds
- **Logs**: Automatically rotated after 30 days
- **Updates**: Pull latest code and restart scheduler

## 🎯 Next Steps

1. ✅ **System is ready!** Email will arrive daily at 8:00 AM IST
2. Monitor logs for first few days
3. Adjust `MIN_RELEVANCE_SCORE` if too many/few articles
4. Add more sources if needed (edit `src/config.py`)

## 📧 Support

Check logs first, then review:
- `README.md` - General documentation
- `SETUP_GUIDE.md` - Installation instructions
- `TECHNICAL_SPEC.md` - Architecture details

---

**Made with ❤️ by Bob**