"""
Base fetcher class for news sources.
Defines the interface that all fetchers must implement.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Dict, Optional


class BaseFetcher(ABC):
    """
    Abstract base class for news fetchers.
    All fetchers must implement the fetch_articles method.
    """
    
    def __init__(self, source_name: str):
        """
        Initialize the fetcher.
        
        Args:
            source_name: Name of the news source
        """
        self.source_name = source_name
    
    @abstractmethod
    def fetch_articles(self, hours_back: int = 24) -> List[Dict]:
        """
        Fetch articles from the source.
        
        Args:
            hours_back: Number of hours to look back for articles (default: 24)
            
        Returns:
            List of article dictionaries with standardized schema:
            {
                'title': str,           # Article title
                'url': str,             # Article URL
                'source': str,          # Source name
                'published_date': datetime,  # Publication timestamp
                'summary': str,         # Article summary/description
                'content': str,         # Full content (if available)
                'author': str,          # Author name (optional)
                'categories': List[str], # Article categories/tags
                'raw_data': Dict        # Original data for debugging
            }
            
        Raises:
            Exception: If fetching fails
        """
        pass
    
    @abstractmethod
    def get_source_name(self) -> str:
        """
        Get the name of the news source.
        
        Returns:
            Source name
        """
        pass
    
    def _create_article(
        self,
        title: str,
        url: str,
        published_date: datetime,
        summary: str = '',
        content: str = '',
        author: str = '',
        categories: Optional[List[str]] = None,
        raw_data: Optional[Dict] = None
    ) -> Dict:
        """
        Create a standardized article dictionary.
        
        Args:
            title: Article title
            url: Article URL
            published_date: Publication date
            summary: Article summary
            content: Full article content
            author: Author name
            categories: List of categories/tags
            raw_data: Original data from source
            
        Returns:
            Standardized article dictionary
        """
        return {
            'title': title.strip() if title else '',
            'url': url.strip() if url else '',
            'source': self.source_name,
            'published_date': published_date,
            'summary': summary.strip() if summary else '',
            'content': content.strip() if content else '',
            'author': author.strip() if author else '',
            'categories': categories or [],
            'raw_data': raw_data or {}
        }
    
    def _is_recent(self, published_date: datetime, hours_back: int) -> bool:
        """
        Check if an article is recent enough.
        
        Args:
            published_date: Article publication date
            hours_back: Number of hours to consider recent
            
        Returns:
            True if article is recent, False otherwise
        """
        from datetime import timedelta
        
        now = datetime.now(published_date.tzinfo) if published_date.tzinfo else datetime.now()
        cutoff = now - timedelta(hours=hours_back)
        return published_date >= cutoff
    
    def __repr__(self) -> str:
        """String representation of the fetcher."""
        return f"{self.__class__.__name__}(source='{self.source_name}')"

# Made with Bob
