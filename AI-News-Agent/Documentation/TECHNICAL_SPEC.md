# AI News Agent - Technical Specification

## Component Specifications

### 1. News Fetcher Module

#### Base Fetcher Interface
```python
from abc import ABC, abstractmethod
from typing import List, Dict
from datetime import datetime

class BaseFetcher(ABC):
    @abstractmethod
    def fetch_articles(self, hours_back: int = 24) -> List[Dict]:
        """
        Fetch articles from the source
        Returns: List of article dictionaries with standardized schema
        """
        pass
    
    @abstractmethod
    def get_source_name(self) -> str:
        """Return the name of the news source"""
        pass
```

#### Article Schema
```python
{
    'title': str,           # Article title
    'url': str,             # Article URL
    'source': str,          # Source name (TechCrunch, VentureBeat, etc.)
    'published_date': datetime,  # Publication timestamp
    'summary': str,         # Article summary/description
    'content': str,         # Full content (if available)
    'author': str,          # Author name (optional)
    'categories': List[str], # Article categories/tags
    'raw_data': Dict        # Original data for debugging
}
```

#### RSS Fetcher Implementation
```python
import feedparser
from datetime import datetime, timedelta

class RSSFetcher(BaseFetcher):
    def __init__(self, feed_url: str, source_name: str):
        self.feed_url = feed_url
        self.source_name = source_name
    
    def fetch_articles(self, hours_back: int = 24) -> List[Dict]:
        # Parse RSS feed
        # Filter by date
        # Transform to standard schema
        # Handle errors gracefully
        pass
```

#### ArXiv Fetcher Implementation
```python
import requests
from xml.etree import ElementTree

class ArXivFetcher(BaseFetcher):
    BASE_URL = 'http://export.arxiv.org/api/query'
    
    def __init__(self):
        self.categories = ['cs.AI', 'cs.CL', 'cs.LG']
    
    def fetch_articles(self, hours_back: int = 24) -> List[Dict]:
        # Build query with categories
        # Fetch from ArXiv API
        # Parse XML response
        # Transform to standard schema
        pass
```

### 2. Content Filter Module

#### Keyword Filter
```python
class KeywordFilter:
    PRIMARY_KEYWORDS = [
        'llm', 'large language model', 'gpt', 'transformer',
        'neural network', 'deep learning', 'generative ai'
    ]
    
    SECONDARY_KEYWORDS = [
        'ai breakthrough', 'artificial intelligence',
        'machine learning', 'natural language processing',
        'computer vision', 'reinforcement learning'
    ]
    
    EXCLUSION_KEYWORDS = [
        'cryptocurrency', 'blockchain', 'nft'
    ]
    
    def calculate_relevance_score(self, article: Dict) -> float:
        """
        Calculate relevance score (0-10)
        - Title match: +3 points
        - Summary match: +2 points
        - Multiple matches: +1 per additional
        - Exclusion keywords: -5 points
        """
        pass
    
    def filter_articles(self, articles: List[Dict], 
                       min_score: float = 3.0) -> List[Dict]:
        """Filter and sort articles by relevance score"""
        pass
```

#### AI-Powered Filter (Optional Enhancement)
```python
from openai import OpenAI

class AIFilter:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)
    
    def analyze_relevance(self, article: Dict) -> Dict:
        """
        Use GPT to analyze article relevance
        Returns: {
            'score': float,
            'reasoning': str,
            'category': str,
            'key_topics': List[str]
        }
        """
        pass
```

### 3. Email Formatter Module

#### HTML Template Structure
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        /* Responsive email styles */
        body { font-family: Arial, sans-serif; }
        .header { background: #1a73e8; color: white; }
        .article { border-left: 4px solid #1a73e8; }
        .score-badge { background: #34a853; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 AI News Daily Digest</h1>
        <p>{{ date }}</p>
    </div>
    
    <div class="summary">
        <p>{{ article_count }} articles curated for you</p>
    </div>
    
    <div class="section">
        <h2>🔥 Top Stories</h2>
        {% for article in top_stories %}
        <div class="article">
            <h3><a href="{{ article.url }}">{{ article.title }}</a></h3>
            <p class="meta">{{ article.source }} | {{ article.date }}</p>
            <p>{{ article.summary }}</p>
            <span class="score-badge">Score: {{ article.score }}</span>
        </div>
        {% endfor %}
    </div>
    
    <!-- More sections -->
</body>
</html>
```

#### Formatter Implementation
```python
from jinja2 import Template
from datetime import datetime

class EmailFormatter:
    def __init__(self, template_path: str):
        with open(template_path, 'r') as f:
            self.template = Template(f.read())
    
    def format_digest(self, articles: List[Dict]) -> str:
        """
        Format articles into HTML email
        - Categorize articles
        - Sort by relevance
        - Apply template
        """
        pass
    
    def create_plain_text_version(self, html: str) -> str:
        """Create plain text fallback"""
        pass
```

### 4. Gmail Sender Module

#### SMTP Implementation
```python
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

class GmailSender:
    SMTP_SERVER = 'smtp.gmail.com'
    SMTP_PORT = 587
    
    def __init__(self, username: str, app_password: str):
        self.username = username
        self.app_password = app_password
    
    def send_email(self, 
                   recipient: str,
                   subject: str,
                   html_content: str,
                   plain_content: str) -> bool:
        """
        Send email via Gmail SMTP
        - Create MIME message
        - Attach HTML and plain text
        - Send with TLS encryption
        - Handle errors
        """
        pass
    
    def test_connection(self) -> bool:
        """Test SMTP connection"""
        pass
```

### 5. Scheduler Module

#### APScheduler Implementation
```python
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz

class JobScheduler:
    def __init__(self, timezone: str = 'Asia/Kolkata'):
        self.scheduler = BlockingScheduler()
        self.timezone = pytz.timezone(timezone)
    
    def schedule_daily_digest(self, 
                             hour: int,
                             minute: int,
                             callback: callable):
        """Schedule daily job at specified time"""
        self.scheduler.add_job(
            callback,
            CronTrigger(
                hour=hour,
                minute=minute,
                timezone=self.timezone
            ),
            id='daily_digest',
            replace_existing=True
        )
    
    def start(self):
        """Start the scheduler"""
        self.scheduler.start()
    
    def run_once(self):
        """Run job immediately (for testing)"""
        pass
```

### 6. Configuration Manager

#### Config Structure
```python
from dataclasses import dataclass
from typing import List
import os
from dotenv import load_dotenv

@dataclass
class EmailConfig:
    gmail_user: str
    gmail_app_password: str
    recipient_email: str
    sender_name: str = "AI News Agent"

@dataclass
class ScheduleConfig:
    time: str  # "08:00"
    timezone: str = "Asia/Kolkata"

@dataclass
class FilterConfig:
    min_relevance_score: float = 3.0
    max_articles_per_digest: int = 20
    primary_keywords: List[str] = None
    exclusion_keywords: List[str] = None

@dataclass
class SourceConfig:
    name: str
    url: str
    type: str  # 'rss' or 'api'
    enabled: bool = True

class ConfigManager:
    def __init__(self, env_path: str = '.env'):
        load_dotenv(env_path)
        self.email = self._load_email_config()
        self.schedule = self._load_schedule_config()
        self.filter = self._load_filter_config()
        self.sources = self._load_sources_config()
    
    def _load_email_config(self) -> EmailConfig:
        return EmailConfig(
            gmail_user=os.getenv('GMAIL_USER'),
            gmail_app_password=os.getenv('GMAIL_APP_PASSWORD'),
            recipient_email=os.getenv('RECIPIENT_EMAIL')
        )
    
    # More config loaders...
```

### 7. Logging System

#### Logger Configuration
```python
import logging
from logging.handlers import RotatingFileHandler
import os

class LoggerSetup:
    @staticmethod
    def setup_logger(name: str, 
                    log_file: str,
                    level=logging.INFO) -> logging.Logger:
        """
        Create logger with file and console handlers
        - Rotating file handler (10MB, 5 backups)
        - Console handler for immediate feedback
        - Structured format with timestamps
        """
        logger = logging.getLogger(name)
        logger.setLevel(level)
        
        # File handler
        os.makedirs('logs', exist_ok=True)
        file_handler = RotatingFileHandler(
            f'logs/{log_file}',
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        
        # Console handler
        console_handler = logging.StreamHandler()
        
        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
        return logger
```

### 8. Main Application Flow

#### Main Entry Point
```python
import sys
from src.config import ConfigManager
from src.scheduler import JobScheduler
from src.logger_setup import LoggerSetup

def main():
    # Setup
    logger = LoggerSetup.setup_logger('main', 'app.log')
    config = ConfigManager()
    
    # Parse arguments
    if '--test' in sys.argv:
        logger.info("Running in test mode")
        run_digest_job(config, test_mode=True)
    elif '--once' in sys.argv:
        logger.info("Running once")
        run_digest_job(config)
    else:
        logger.info("Starting scheduler")
        scheduler = JobScheduler(config.schedule.timezone)
        hour, minute = map(int, config.schedule.time.split(':'))
        scheduler.schedule_daily_digest(
            hour, minute,
            lambda: run_digest_job(config)
        )
        scheduler.start()

def run_digest_job(config: ConfigManager, test_mode: bool = False):
    """Main job execution"""
    logger = logging.getLogger('main')
    
    try:
        # 1. Fetch articles from all sources
        articles = fetch_all_articles(config)
        logger.info(f"Fetched {len(articles)} articles")
        
        # 2. Filter and score articles
        filtered = filter_articles(articles, config)
        logger.info(f"Filtered to {len(filtered)} relevant articles")
        
        # 3. Format email
        html_content = format_email(filtered, config)
        
        # 4. Send email (or preview in test mode)
        if test_mode:
            save_preview(html_content)
            logger.info("Preview saved to preview.html")
        else:
            send_email(html_content, config)
            logger.info("Email sent successfully")
            
    except Exception as e:
        logger.error(f"Job failed: {str(e)}", exc_info=True)
        send_error_notification(config, str(e))

if __name__ == '__main__':
    main()
```

## Error Handling Strategy

### Retry Mechanism
```python
from functools import wraps
import time

def retry_on_failure(max_attempts=3, delay=1, backoff=2):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            attempt = 1
            while attempt <= max_attempts:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts:
                        raise
                    time.sleep(delay * (backoff ** (attempt - 1)))
                    attempt += 1
        return wrapper
    return decorator

@retry_on_failure(max_attempts=3)
def fetch_with_retry(url: str):
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    return response
```

### Graceful Degradation
```python
def fetch_all_articles(config: ConfigManager) -> List[Dict]:
    """Fetch from all sources, continue even if some fail"""
    all_articles = []
    failed_sources = []
    
    for source in config.sources:
        try:
            fetcher = create_fetcher(source)
            articles = fetcher.fetch_articles()
            all_articles.extend(articles)
            logger.info(f"Fetched {len(articles)} from {source.name}")
        except Exception as e:
            logger.error(f"Failed to fetch from {source.name}: {e}")
            failed_sources.append(source.name)
    
    if failed_sources and not all_articles:
        raise Exception("All sources failed")
    
    return all_articles
```

## Performance Considerations

### Caching Strategy
```python
from functools import lru_cache
import pickle
from datetime import datetime, timedelta

class ArticleCache:
    def __init__(self, cache_file: str = 'cache/articles.pkl'):
        self.cache_file = cache_file
    
    def save(self, articles: List[Dict]):
        """Save articles to cache"""
        with open(self.cache_file, 'wb') as f:
            pickle.dump({
                'timestamp': datetime.now(),
                'articles': articles
            }, f)
    
    def load(self, max_age_hours: int = 24) -> List[Dict]:
        """Load articles from cache if fresh"""
        try:
            with open(self.cache_file, 'rb') as f:
                data = pickle.load(f)
                age = datetime.now() - data['timestamp']
                if age < timedelta(hours=max_age_hours):
                    return data['articles']
        except FileNotFoundError:
            pass
        return []
```

### Rate Limiting
```python
import time
from collections import deque

class RateLimiter:
    def __init__(self, max_calls: int, period: int):
        self.max_calls = max_calls
        self.period = period
        self.calls = deque()
    
    def __call__(self, func):
        def wrapper(*args, **kwargs):
            now = time.time()
            # Remove old calls
            while self.calls and self.calls[0] < now - self.period:
                self.calls.popleft()
            
            if len(self.calls) >= self.max_calls:
                sleep_time = self.period - (now - self.calls[0])
                time.sleep(sleep_time)
            
            self.calls.append(time.time())
            return func(*args, **kwargs)
        return wrapper
```

## Testing Strategy

### Unit Test Example
```python
import unittest
from src.filters.keyword_filter import KeywordFilter

class TestKeywordFilter(unittest.TestCase):
    def setUp(self):
        self.filter = KeywordFilter()
    
    def test_relevance_score_high(self):
        article = {
            'title': 'New GPT-5 LLM Breakthrough',
            'summary': 'Large language model advances'
        }
        score = self.filter.calculate_relevance_score(article)
        self.assertGreater(score, 5.0)
    
    def test_exclusion_keywords(self):
        article = {
            'title': 'Cryptocurrency AI Trading',
            'summary': 'Blockchain meets AI'
        }
        score = self.filter.calculate_relevance_score(article)
        self.assertLess(score, 0)
```

### Integration Test Example
```python
def test_end_to_end_flow():
    """Test complete workflow"""
    config = ConfigManager('.env.test')
    
    # Fetch
    articles = fetch_all_articles(config)
    assert len(articles) > 0
    
    # Filter
    filtered = filter_articles(articles, config)
    assert len(filtered) <= len(articles)
    
    # Format
    html = format_email(filtered, config)
    assert '<html>' in html
    
    # Send (to test email)
    result = send_email(html, config)
    assert result is True
```

## Deployment Checklist

- [ ] Python 3.9+ installed
- [ ] Virtual environment created
- [ ] Dependencies installed from requirements.txt
- [ ] `.env` file configured with credentials
- [ ] Gmail App Password generated
- [ ] Test run successful: `python main.py --test`
- [ ] Preview email looks correct
- [ ] Single run successful: `python main.py --once`
- [ ] Email received successfully
- [ ] Cron job configured (if using cron)
- [ ] Logs directory created and writable
- [ ] Error notifications working
- [ ] Monitoring set up

## Monitoring & Maintenance

### Health Checks
```python
def health_check(config: ConfigManager) -> Dict:
    """Check system health"""
    return {
        'smtp_connection': test_smtp_connection(config),
        'sources_accessible': test_all_sources(config),
        'disk_space': check_disk_space(),
        'log_size': get_log_size(),
        'last_run': get_last_run_time()
    }
```

### Metrics to Track
- Email delivery success rate
- Average articles per digest
- Source fetch success rate
- Average relevance score
- Execution time
- Error frequency

## Security Best Practices

1. **Credential Management**
   - Never commit `.env` file
   - Use App Passwords, not account passwords
   - Rotate credentials regularly

2. **Input Validation**
   - Sanitize HTML content
   - Validate URLs before fetching
   - Limit content size

3. **Network Security**
   - Use HTTPS for all requests
   - Verify SSL certificates
   - Set request timeouts

4. **Dependency Security**
   - Regular `pip audit` checks
   - Keep dependencies updated
   - Use virtual environment