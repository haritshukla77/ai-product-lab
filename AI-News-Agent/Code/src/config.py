"""
Configuration management for AI News Agent.
Loads and validates configuration from environment variables.
"""

import os
from dataclasses import dataclass, field
from typing import List, Optional
from dotenv import load_dotenv


@dataclass
class EmailConfig:
    """Email configuration settings."""
    gmail_user: str
    gmail_app_password: str
    recipient_email: str
    sender_name: str = "AI News Agent"
    
    def validate(self) -> None:
        """Validate email configuration."""
        if not self.gmail_user or '@' not in self.gmail_user:
            raise ValueError("Invalid GMAIL_USER: must be a valid email address")
        if not self.gmail_app_password or len(self.gmail_app_password) < 16:
            raise ValueError("Invalid GMAIL_APP_PASSWORD: must be at least 16 characters")
        if not self.recipient_email or '@' not in self.recipient_email:
            raise ValueError("Invalid RECIPIENT_EMAIL: must be a valid email address")


@dataclass
class ScheduleConfig:
    """Scheduling configuration settings."""
    time: str = "08:00"
    timezone: str = "Asia/Kolkata"
    
    def validate(self) -> None:
        """Validate schedule configuration."""
        try:
            hour, minute = map(int, self.time.split(':'))
            if not (0 <= hour <= 23 and 0 <= minute <= 59):
                raise ValueError
        except (ValueError, AttributeError):
            raise ValueError(f"Invalid SCHEDULE_TIME: {self.time}. Must be in HH:MM format")


@dataclass
class FilterConfig:
    """Content filtering configuration settings."""
    min_relevance_score: float = 3.0
    max_articles_per_digest: int = 20
    primary_keywords: List[str] = field(default_factory=lambda: [
        'llm', 'large language model', 'gpt', 'transformer',
        'neural network', 'deep learning', 'generative ai', 'chatgpt',
        'claude', 'gemini', 'openai', 'anthropic'
    ])
    secondary_keywords: List[str] = field(default_factory=lambda: [
        'ai breakthrough', 'artificial intelligence', 'ai',
        'machine learning', 'natural language processing', 'ml',
        'computer vision', 'reinforcement learning', 'ai model',
        'ai tool', 'ai technology', 'automation', 'robotics'
    ])
    exclusion_keywords: List[str] = field(default_factory=lambda: [
        'cryptocurrency', 'blockchain', 'nft'
    ])
    
    def validate(self) -> None:
        """Validate filter configuration."""
        if self.min_relevance_score < 0:
            raise ValueError("MIN_RELEVANCE_SCORE must be non-negative")
        if self.max_articles_per_digest < 1:
            raise ValueError("MAX_ARTICLES_PER_DIGEST must be at least 1")


@dataclass
class SourceConfig:
    """News source configuration."""
    name: str
    url: str
    type: str  # 'rss' or 'api'
    enabled: bool = True
    
    def validate(self) -> None:
        """Validate source configuration."""
        if not self.name:
            raise ValueError("Source name cannot be empty")
        if not self.url:
            raise ValueError(f"Source URL cannot be empty for {self.name}")
        if self.type not in ['rss', 'api']:
            raise ValueError(f"Invalid source type for {self.name}: {self.type}")


@dataclass
class LogConfig:
    """Logging configuration settings."""
    level: str = "INFO"
    retention_days: int = 30
    
    def validate(self) -> None:
        """Validate logging configuration."""
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if self.level.upper() not in valid_levels:
            raise ValueError(f"Invalid LOG_LEVEL: {self.level}. Must be one of {valid_levels}")
        if self.retention_days < 1:
            raise ValueError("LOG_RETENTION_DAYS must be at least 1")


class ConfigManager:
    """
    Main configuration manager.
    Loads configuration from .env file and provides validated config objects.
    """
    
    def __init__(self, env_path: str = '.env'):
        """
        Initialize configuration manager.
        
        Args:
            env_path: Path to .env file (default: '.env')
        """
        # Load environment variables
        load_dotenv(env_path)
        
        # Load all configurations
        self.email = self._load_email_config()
        self.schedule = self._load_schedule_config()
        self.filter = self._load_filter_config()
        self.sources = self._load_sources_config()
        self.log = self._load_log_config()
        
        # Optional: OpenAI API key for AI-powered filtering
        self.openai_api_key = os.getenv('OPENAI_API_KEY', '')
        
        # Validate all configurations
        self.validate()
    
    def _load_email_config(self) -> EmailConfig:
        """Load email configuration from environment variables."""
        return EmailConfig(
            gmail_user=os.getenv('GMAIL_USER', ''),
            gmail_app_password=os.getenv('GMAIL_APP_PASSWORD', ''),
            recipient_email=os.getenv('RECIPIENT_EMAIL', ''),
            sender_name=os.getenv('SENDER_NAME', 'AI News Agent')
        )
    
    def _load_schedule_config(self) -> ScheduleConfig:
        """Load schedule configuration from environment variables."""
        return ScheduleConfig(
            time=os.getenv('SCHEDULE_TIME', '08:00'),
            timezone=os.getenv('TIMEZONE', 'Asia/Kolkata')
        )
    
    def _load_filter_config(self) -> FilterConfig:
        """Load filter configuration from environment variables."""
        return FilterConfig(
            min_relevance_score=float(os.getenv('MIN_RELEVANCE_SCORE', '3.0')),
            max_articles_per_digest=int(os.getenv('MAX_ARTICLES_PER_DIGEST', '20'))
        )
    
    def _load_sources_config(self) -> List[SourceConfig]:
        """Load news sources configuration."""
        # Default sources
        all_sources = [
            SourceConfig(
                name='TechCrunch',
                url='https://techcrunch.com/category/artificial-intelligence/feed/',
                type='rss'
            ),
            SourceConfig(
                name='VentureBeat',
                url='https://venturebeat.com/category/ai/feed/',
                type='rss'
            ),
            SourceConfig(
                name='MIT Technology Review',
                url='https://www.technologyreview.com/topic/artificial-intelligence/feed',
                type='rss'
            ),
            SourceConfig(
                name='ArXiv',
                url='http://export.arxiv.org/api/query',
                type='api'
            )
        ]
        
        # Check if specific sources are enabled
        enabled_sources_str = os.getenv('ENABLED_SOURCES', '')
        if enabled_sources_str:
            enabled_names = [s.strip().lower() for s in enabled_sources_str.split(',')]
            source_map = {
                'techcrunch': 'TechCrunch',
                'venturebeat': 'VentureBeat',
                'mit_tech_review': 'MIT Technology Review',
                'arxiv': 'ArXiv'
            }
            
            # Enable only specified sources
            for source in all_sources:
                source_key = next(
                    (k for k, v in source_map.items() if v == source.name),
                    None
                )
                source.enabled = source_key in enabled_names if source_key else False
        
        return all_sources
    
    def _load_log_config(self) -> LogConfig:
        """Load logging configuration from environment variables."""
        return LogConfig(
            level=os.getenv('LOG_LEVEL', 'INFO'),
            retention_days=int(os.getenv('LOG_RETENTION_DAYS', '30'))
        )
    
    def validate(self) -> None:
        """Validate all configurations."""
        self.email.validate()
        self.schedule.validate()
        self.filter.validate()
        self.log.validate()
        
        for source in self.sources:
            source.validate()
        
        # Check if at least one source is enabled
        if not any(source.enabled for source in self.sources):
            raise ValueError("At least one news source must be enabled")
    
    def get_enabled_sources(self) -> List[SourceConfig]:
        """Get list of enabled news sources."""
        return [source for source in self.sources if source.enabled]
    
    def __repr__(self) -> str:
        """String representation of configuration."""
        enabled_sources = [s.name for s in self.get_enabled_sources()]
        return (
            f"ConfigManager(\n"
            f"  Email: {self.email.gmail_user} -> {self.email.recipient_email}\n"
            f"  Schedule: {self.schedule.time} {self.schedule.timezone}\n"
            f"  Filter: min_score={self.filter.min_relevance_score}, "
            f"max_articles={self.filter.max_articles_per_digest}\n"
            f"  Sources: {', '.join(enabled_sources)}\n"
            f"  Log Level: {self.log.level}\n"
            f")"
        )


# Convenience function to load configuration
def load_config(env_path: str = '.env') -> ConfigManager:
    """
    Load and validate configuration.
    
    Args:
        env_path: Path to .env file
        
    Returns:
        ConfigManager instance
        
    Raises:
        ValueError: If configuration is invalid
        FileNotFoundError: If .env file is not found
    """
    if not os.path.exists(env_path):
        raise FileNotFoundError(
            f"Configuration file not found: {env_path}\n"
            f"Please copy .env.example to .env and configure it."
        )
    
    return ConfigManager(env_path)


if __name__ == '__main__':
    # Test configuration loading
    try:
        config = load_config()
        print("✅ Configuration loaded successfully!")
        print(config)
    except Exception as e:
        print(f"❌ Configuration error: {e}")

# Made with Bob
