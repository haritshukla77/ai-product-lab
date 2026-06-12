# 🤖 AI News Agent

An automated system that delivers curated AI news from trusted sources directly to your inbox every morning at 8 AM IST.

## ✨ Features

- 📰 **Multi-Source Aggregation**: Fetches from TechCrunch, VentureBeat, MIT Technology Review, and ArXiv
- 🎯 **Smart Filtering**: Focuses on LLMs and AI breakthroughs using keyword-based scoring
- 📧 **Professional Emails**: Clean, readable HTML format with categorized sections
- ⏰ **Automated Delivery**: Daily digest at 8 AM IST
- 🔒 **Secure**: Uses Gmail App Passwords and environment variables
- 🧪 **Test Mode**: Preview emails before sending

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- Gmail account with App Password enabled
- Internet connection

### Installation

1. **Clone or download the project**
```bash
cd ~/Documents
git clone <repository-url> ai-news-agent
cd ai-news-agent
```

2. **Set up virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials
nano .env
```

5. **Set up Gmail App Password**
   - Go to Google Account → Security → 2-Step Verification
   - Generate App Password for "Mail"
   - Copy the 16-character password to `.env`

### Usage

**Test Mode** (Preview without sending):
```bash
python main.py --test
open preview.html  # View the preview
```

**Run Once** (Send email immediately):
```bash
python main.py --once
```

**Run Scheduler** (Daily at 8 AM IST):
```bash
python main.py
```

## 📁 Project Structure

```
ai-news-agent/
├── src/
│   ├── config.py              # Configuration management
│   ├── fetchers/              # News fetching modules
│   │   ├── base_fetcher.py    # Abstract base class
│   │   ├── rss_fetcher.py     # RSS feed parser
│   │   ├── arxiv_fetcher.py   # ArXiv API client
│   │   └── sources.py         # Source configurations
│   ├── filters/               # Content filtering
│   │   └── keyword_filter.py  # Keyword-based filtering
│   ├── formatters/            # Email formatting
│   │   ├── email_formatter.py # HTML email generator
│   │   └── templates/
│   │       └── digest.html    # Email template
│   ├── sender/                # Email sending
│   │   └── gmail_sender.py    # Gmail SMTP client
│   └── scheduler/             # Job scheduling
│       └── job_scheduler.py   # APScheduler wrapper
├── tests/                     # Unit and integration tests
├── logs/                      # Application logs
├── cache/                     # Cached articles
├── .env                       # Environment variables (not in git)
├── .env.example              # Example configuration
├── requirements.txt          # Python dependencies
├── main.py                   # Application entry point
└── README.md                 # This file
```

## ⚙️ Configuration

Edit `.env` file to customize:

```env
# Email settings
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-password
RECIPIENT_EMAIL=recipient@example.com

# Schedule
SCHEDULE_TIME=08:00
TIMEZONE=Asia/Kolkata

# Filtering
MIN_RELEVANCE_SCORE=3.0
MAX_ARTICLES_PER_DIGEST=20

# Sources (comma-separated)
ENABLED_SOURCES=techcrunch,venturebeat,mit_tech_review,arxiv
```

## 🔧 Scheduling Options

### Option 1: APScheduler (Built-in)
```bash
python main.py
# Runs continuously, executes at scheduled time
```

### Option 2: Cron (Recommended for production)
```bash
crontab -e
# Add: 0 8 * * * cd /path/to/ai-news-agent && /path/to/venv/bin/python main.py --once
```

### Option 3: launchd (macOS)
See `SETUP_GUIDE.md` in the planning documentation for details.

## 🧪 Testing

Run tests:
```bash
pytest tests/
pytest --cov=src tests/  # With coverage
```

Test individual components:
```bash
python test_smtp.py      # Test email connection
python test_fetch.py     # Test news fetching
```

## 📊 News Sources

| Source | Type | Focus |
|--------|------|-------|
| TechCrunch | RSS | AI industry news |
| VentureBeat | RSS | AI business & tech |
| MIT Technology Review | RSS | AI research & analysis |
| ArXiv | API | AI research papers |

## 🎯 Content Filtering

Articles are scored based on:
- **Primary keywords** (+3 points): LLM, GPT, transformer, neural network
- **Secondary keywords** (+2 points): AI breakthrough, machine learning
- **Multiple matches** (+1 point each)
- **Exclusion keywords** (-5 points): cryptocurrency, blockchain

Minimum score threshold: 3.0 (configurable)

## 📧 Email Format

The digest includes:
1. **Header** with date and summary
2. **Top Stories** (highest scored articles)
3. **LLM & Language Models** section
4. **Research Papers** from ArXiv
5. **Industry News** from tech publications

## 🔍 Troubleshooting

### SMTP Authentication Failed
- Verify 2-Factor Authentication is enabled
- Regenerate App Password
- Check for typos in `.env` file

### No Articles Found
- Lower `MIN_RELEVANCE_SCORE` in `.env`
- Check internet connection
- Verify RSS feed URLs are accessible

### Email Not Received
- Check spam/junk folder
- Review logs: `tail -f logs/app.log`
- Test SMTP: `python test_smtp.py`

For more troubleshooting, see the planning documentation in `AI News Agent Dossier/SETUP_GUIDE.md`.

## 📝 Logging

Logs are stored in `logs/` directory:
- `app.log` - Main application log
- `fetcher.log` - News fetching log
- `email.log` - Email sending log

View logs:
```bash
tail -f logs/app.log
grep ERROR logs/app.log
```

## 🔒 Security

- Environment variables stored in `.env` (never committed)
- Gmail App Passwords instead of account passwords
- HTTPS for all external requests
- Input validation and sanitization
- Regular dependency updates

## 🚧 Development

### Setup Development Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -e .
```

### Code Style
```bash
black src/          # Format code
flake8 src/         # Lint code
pytest tests/       # Run tests
```

### Adding New Sources
1. Create fetcher in `src/fetchers/`
2. Add source config in `src/fetchers/sources.py`
3. Update `.env.example` with new source name
4. Write tests in `tests/`

## 📚 Documentation

Comprehensive planning documentation is available in `AI News Agent Dossier/`:
- `PLAN.md` - System architecture and implementation plan
- `TECHNICAL_SPEC.md` - Detailed technical specifications
- `SETUP_GUIDE.md` - Complete installation guide
- `IMPLEMENTATION_ROADMAP.md` - Phase-by-phase development guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- News sources: TechCrunch, VentureBeat, MIT Technology Review, ArXiv
- Built with Python, feedparser, APScheduler, and Jinja2

## 📞 Support

For issues or questions:
1. Check logs: `logs/app.log`
2. Review troubleshooting section
3. Consult planning documentation
4. Open an issue on GitHub

---

**Made with ❤️ for AI enthusiasts**

Stay informed about the latest AI developments without the noise! 🚀