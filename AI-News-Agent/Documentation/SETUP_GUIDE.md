# AI News Agent - Setup & Installation Guide

## Prerequisites

### System Requirements
- **Operating System**: macOS, Linux, or Windows
- **Python**: Version 3.9 or higher
- **Internet Connection**: Required for fetching news and sending emails
- **Gmail Account**: With App Password enabled

### Required Accounts
1. **Gmail Account** for sending emails
2. **Optional**: OpenAI API key (for AI-powered filtering enhancement)

## Installation Steps

### 1. Clone or Download the Project

```bash
cd ~/Documents
git clone <repository-url> ai-news-agent
cd ai-news-agent
```

Or create the project structure manually:
```bash
mkdir -p ai-news-agent
cd ai-news-agent
```

### 2. Set Up Python Virtual Environment

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies

Create `requirements.txt`:
```txt
feedparser==6.0.10
requests==2.31.0
beautifulsoup4==4.12.2
python-dotenv==1.0.0
APScheduler==3.10.4
Jinja2==3.1.2
pytz==2023.3
lxml==4.9.3
html2text==2020.1.16

# Optional: AI-powered filtering
openai==1.3.0

# Development/Testing
pytest==7.4.3
pytest-cov==4.1.0
black==23.11.0
flake8==6.1.0
```

Install dependencies:
```bash
pip install -r requirements.txt
```

### 4. Configure Gmail App Password

#### Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** if not already enabled

#### Generate App Password
1. Go to **Security** → **2-Step Verification**
2. Scroll down to **App passwords**
3. Select **Mail** and **Other (Custom name)**
4. Name it "AI News Agent"
5. Click **Generate**
6. **Copy the 16-character password** (you'll need this for `.env`)

### 5. Create Configuration File

Create `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# Edit with your credentials
nano .env  # or use your preferred editor
```

`.env` file contents:
```env
# Email Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
RECIPIENT_EMAIL=recipient@example.com
SENDER_NAME=AI News Agent

# Scheduling
SCHEDULE_TIME=08:00
TIMEZONE=Asia/Kolkata

# Content Filtering
MIN_RELEVANCE_SCORE=3.0
MAX_ARTICLES_PER_DIGEST=20

# Logging
LOG_LEVEL=INFO
LOG_RETENTION_DAYS=30

# Optional: AI-powered filtering (leave empty if not using)
OPENAI_API_KEY=

# News Sources (comma-separated, leave empty to use all)
ENABLED_SOURCES=techcrunch,venturebeat,mit_tech_review,arxiv
```

### 6. Create `.env.example` Template

```bash
cat > .env.example << 'EOF'
# Email Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
RECIPIENT_EMAIL=recipient@example.com
SENDER_NAME=AI News Agent

# Scheduling
SCHEDULE_TIME=08:00
TIMEZONE=Asia/Kolkata

# Content Filtering
MIN_RELEVANCE_SCORE=3.0
MAX_ARTICLES_PER_DIGEST=20

# Logging
LOG_LEVEL=INFO
LOG_RETENTION_DAYS=30

# Optional: AI-powered filtering
OPENAI_API_KEY=

# News Sources
ENABLED_SOURCES=techcrunch,venturebeat,mit_tech_review,arxiv
EOF
```

### 7. Create `.gitignore`

```bash
cat > .gitignore << 'EOF'
# Environment variables
.env

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

# Logs
logs/
*.log

# Cache
cache/
*.pkl

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
.pytest_cache/
.coverage
htmlcov/

# Email previews
preview.html
EOF
```

## Testing the Setup

### 1. Test SMTP Connection

Create a test script `test_smtp.py`:
```python
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os

load_dotenv()

def test_smtp():
    try:
        # Connect to Gmail SMTP
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        
        # Login
        username = os.getenv('GMAIL_USER')
        password = os.getenv('GMAIL_APP_PASSWORD')
        server.login(username, password)
        
        print("✅ SMTP connection successful!")
        
        # Send test email
        msg = MIMEText("This is a test email from AI News Agent")
        msg['Subject'] = 'AI News Agent - Test Email'
        msg['From'] = username
        msg['To'] = os.getenv('RECIPIENT_EMAIL')
        
        server.send_message(msg)
        print("✅ Test email sent successfully!")
        
        server.quit()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    test_smtp()
```

Run the test:
```bash
python test_smtp.py
```

### 2. Test News Fetching

Create a test script `test_fetch.py`:
```python
import feedparser

def test_rss_feeds():
    feeds = {
        'TechCrunch': 'https://techcrunch.com/category/artificial-intelligence/feed/',
        'VentureBeat': 'https://venturebeat.com/category/ai/feed/',
        'MIT Tech Review': 'https://www.technologyreview.com/topic/artificial-intelligence/feed'
    }
    
    for name, url in feeds.items():
        try:
            feed = feedparser.parse(url)
            print(f"✅ {name}: {len(feed.entries)} articles")
        except Exception as e:
            print(f"❌ {name}: {e}")

if __name__ == '__main__':
    test_rss_feeds()
```

Run the test:
```bash
python test_fetch.py
```

### 3. Run Full Test

Once the implementation is complete:
```bash
# Test mode (creates preview.html without sending email)
python main.py --test

# Check the preview
open preview.html  # macOS
xdg-open preview.html  # Linux
start preview.html  # Windows

# Run once (sends actual email)
python main.py --once
```

## Scheduling Options

### Option 1: APScheduler (Built-in)

Simply run the main script:
```bash
python main.py
```

The script will run continuously and execute at the scheduled time (8 AM IST by default).

**To run in background:**
```bash
# macOS/Linux
nohup python main.py > output.log 2>&1 &

# Check if running
ps aux | grep main.py

# Stop
pkill -f main.py
```

### Option 2: System Cron (Recommended for Production)

**macOS/Linux:**

1. Open crontab editor:
```bash
crontab -e
```

2. Add the following line (adjust paths):
```bash
# Run at 8:00 AM IST every day
0 8 * * * cd /Users/haritshukla/Documents/ai-news-agent && /Users/haritshukla/Documents/ai-news-agent/venv/bin/python main.py --once >> logs/cron.log 2>&1
```

3. Save and exit

4. Verify cron job:
```bash
crontab -l
```

**Note**: Make sure to use absolute paths in cron jobs.

### Option 3: launchd (macOS Alternative)

Create `~/Library/LaunchAgents/com.ainews.agent.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ainews.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/haritshukla/Documents/ai-news-agent/venv/bin/python</string>
        <string>/Users/haritshukla/Documents/ai-news-agent/main.py</string>
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
    <string>/Users/haritshukla/Documents/ai-news-agent/logs/launchd.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/haritshukla/Documents/ai-news-agent/logs/launchd.error.log</string>
</dict>
</plist>
```

Load the agent:
```bash
launchctl load ~/Library/LaunchAgents/com.ainews.agent.plist
```

## Troubleshooting

### Common Issues

#### 1. SMTP Authentication Failed
**Error**: `535 Authentication failed`

**Solutions**:
- Verify 2-Factor Authentication is enabled
- Regenerate App Password
- Check for typos in `.env` file
- Ensure no spaces in the App Password

#### 2. RSS Feed Not Loading
**Error**: `Failed to fetch from [source]`

**Solutions**:
- Check internet connection
- Verify RSS feed URL is still valid
- Check if source website is blocking requests
- Add User-Agent header to requests

#### 3. No Articles Found
**Possible causes**:
- Relevance score threshold too high
- No recent articles matching keywords
- Date filter too restrictive

**Solutions**:
- Lower `MIN_RELEVANCE_SCORE` in `.env`
- Expand keyword list
- Check logs for filtering details

#### 4. Email Not Received
**Check**:
- Spam/Junk folder
- Email logs: `logs/email.log`
- SMTP connection test
- Recipient email address

#### 5. Cron Job Not Running
**Debug**:
```bash
# Check cron logs
grep CRON /var/log/syslog  # Linux
log show --predicate 'process == "cron"' --last 1h  # macOS

# Test cron command manually
cd /path/to/ai-news-agent && /path/to/python main.py --once

# Check cron environment
* * * * * env > /tmp/cron-env.txt
```

### Logging

Check logs for debugging:
```bash
# View recent logs
tail -f logs/app.log

# Search for errors
grep ERROR logs/app.log

# View specific component logs
tail -f logs/fetcher.log
tail -f logs/email.log
```

## Maintenance

### Regular Tasks

**Weekly**:
- Check logs for errors
- Verify email delivery
- Review article relevance

**Monthly**:
- Update dependencies: `pip install --upgrade -r requirements.txt`
- Clean old logs: `find logs/ -name "*.log.*" -mtime +30 -delete`
- Review and update keywords

**Quarterly**:
- Rotate Gmail App Password
- Review and update news sources
- Check for Python updates

### Updating the Agent

```bash
# Activate virtual environment
source venv/bin/activate

# Pull latest changes (if using git)
git pull

# Update dependencies
pip install --upgrade -r requirements.txt

# Test
python main.py --test

# Restart scheduler/cron if needed
```

### Backup Configuration

```bash
# Backup .env file (store securely)
cp .env .env.backup

# Backup logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/
```

## Performance Optimization

### Reduce Execution Time
- Enable caching for articles
- Limit articles per source
- Use concurrent fetching

### Reduce Email Size
- Limit articles per digest
- Compress images
- Use plain text fallback

### Reduce Resource Usage
- Run during off-peak hours
- Use lightweight HTML templates
- Clean up old cache files

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use App Passwords**, not account passwords
3. **Rotate credentials** every 3-6 months
4. **Keep dependencies updated** for security patches
5. **Monitor logs** for suspicious activity
6. **Use HTTPS** for all external requests
7. **Validate and sanitize** all external content

## Getting Help

### Resources
- Python documentation: https://docs.python.org/3/
- feedparser docs: https://feedparser.readthedocs.io/
- Gmail SMTP guide: https://support.google.com/mail/answer/7126229

### Debugging Tips
1. Enable DEBUG logging in `.env`
2. Run with `--test` flag first
3. Check each component individually
4. Review logs for error messages
5. Test SMTP connection separately

## Next Steps

After successful setup:
1. ✅ Run test mode: `python main.py --test`
2. ✅ Review preview email
3. ✅ Run once: `python main.py --once`
4. ✅ Verify email received
5. ✅ Set up scheduling (cron or APScheduler)
6. ✅ Monitor for first few days
7. ✅ Customize keywords and sources as needed

## Customization

### Adding New Sources

Edit `src/fetchers/sources.py`:
```python
SOURCES = [
    {
        'name': 'Your Source',
        'url': 'https://example.com/feed',
        'type': 'rss',
        'enabled': True
    }
]
```

### Modifying Keywords

Edit `src/filters/keyword_filter.py`:
```python
PRIMARY_KEYWORDS = [
    'your', 'custom', 'keywords'
]
```

### Changing Email Template

Edit `src/formatters/templates/digest.html` to customize the email design.

### Adjusting Schedule

Modify `.env`:
```env
SCHEDULE_TIME=09:30  # 9:30 AM
TIMEZONE=America/New_York
```

## Support

For issues or questions:
1. Check logs: `logs/app.log`
2. Review this guide
3. Test individual components
4. Check environment variables
5. Verify internet connectivity

---

**Congratulations!** Your AI News Agent is now set up and ready to deliver daily AI news digests. 🎉