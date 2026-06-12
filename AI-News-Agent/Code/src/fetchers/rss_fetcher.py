"""
RSS feed fetcher for news sources.
Fetches and parses RSS feeds from various news sites.
"""

import feedparser
from datetime import datetime
from typing import List, Dict
import time
from email.utils import parsedate_to_datetime

from .base_fetcher import BaseFetcher


class RSSFetcher(BaseFetcher):
    """
    Fetcher for RSS feeds.
    Supports standard RSS 2.0 and Atom feeds.
    """
    
    def __init__(self, source_name: str, feed_url: str):
        """
        Initialize RSS fetcher.
        
        Args:
            source_name: Name of the news source
            feed_url: URL of the RSS feed
        """
        super().__init__(source_name)
        self.feed_url = feed_url
    
    def fetch_articles(self, hours_back: int = 24) -> List[Dict]:
        """
        Fetch articles from RSS feed.
        
        Args:
            hours_back: Number of hours to look back for articles
            
        Returns:
            List of standardized article dictionaries
            
        Raises:
            Exception: If feed parsing fails
        """
        try:
            # Parse the RSS feed
            feed = feedparser.parse(self.feed_url)
            
            # Check for errors
            if feed.bozo and not feed.entries:
                raise Exception(f"Failed to parse RSS feed: {feed.bozo_exception}")
            
            articles = []
            
            for entry in feed.entries:
                try:
                    # Parse publication date
                    published_date = self._parse_date(entry)
                    
                    # Skip if not recent enough
                    if not self._is_recent(published_date, hours_back):
                        continue
                    
                    # Extract article data
                    title = entry.get('title', '')
                    url = entry.get('link', '')
                    summary = self._get_summary(entry)
                    content = self._get_content(entry)
                    author = self._get_author(entry)
                    categories = self._get_categories(entry)
                    
                    # Create standardized article
                    article = self._create_article(
                        title=title,
                        url=url,
                        published_date=published_date,
                        summary=summary,
                        content=content,
                        author=author,
                        categories=categories,
                        raw_data=dict(entry)
                    )
                    
                    articles.append(article)
                    
                except Exception as e:
                    # Log error but continue with other entries
                    print(f"Error parsing entry from {self.source_name}: {e}")
                    continue
            
            return articles
            
        except Exception as e:
            raise Exception(f"Failed to fetch from {self.source_name}: {e}")
    
    def get_source_name(self) -> str:
        """Get the source name."""
        return self.source_name
    
    def _parse_date(self, entry: Dict) -> datetime:
        """
        Parse publication date from RSS entry.
        
        Args:
            entry: RSS feed entry
            
        Returns:
            Parsed datetime object
        """
        # Try different date fields
        date_fields = ['published_parsed', 'updated_parsed', 'created_parsed']
        
        for field in date_fields:
            if field in entry and entry[field]:
                try:
                    return datetime(*entry[field][:6])
                except (TypeError, ValueError):
                    continue
        
        # Try parsing date strings
        date_string_fields = ['published', 'updated', 'created']
        for field in date_string_fields:
            if field in entry and entry[field]:
                try:
                    return parsedate_to_datetime(entry[field])
                except (TypeError, ValueError):
                    continue
        
        # Default to current time if no date found
        return datetime.now()
    
    def _get_summary(self, entry: Dict) -> str:
        """
        Extract summary from RSS entry.
        
        Args:
            entry: RSS feed entry
            
        Returns:
            Article summary
        """
        # Try different summary fields
        if 'summary' in entry:
            return self._clean_html(entry['summary'])
        elif 'description' in entry:
            return self._clean_html(entry['description'])
        elif 'subtitle' in entry:
            return self._clean_html(entry['subtitle'])
        return ''
    
    def _get_content(self, entry: Dict) -> str:
        """
        Extract full content from RSS entry.
        
        Args:
            entry: RSS feed entry
            
        Returns:
            Article content
        """
        # Try to get full content
        if 'content' in entry and entry['content']:
            # Content is usually a list of dicts
            if isinstance(entry['content'], list) and entry['content']:
                return self._clean_html(entry['content'][0].get('value', ''))
        
        # Fall back to summary if no content
        return self._get_summary(entry)
    
    def _get_author(self, entry: Dict) -> str:
        """
        Extract author from RSS entry.
        
        Args:
            entry: RSS feed entry
            
        Returns:
            Author name
        """
        if 'author' in entry:
            return entry['author']
        elif 'author_detail' in entry and 'name' in entry['author_detail']:
            return entry['author_detail']['name']
        elif 'dc_creator' in entry:
            return entry['dc_creator']
        return ''
    
    def _get_categories(self, entry: Dict) -> List[str]:
        """
        Extract categories/tags from RSS entry.
        
        Args:
            entry: RSS feed entry
            
        Returns:
            List of categories
        """
        categories = []
        
        if 'tags' in entry:
            for tag in entry['tags']:
                if 'term' in tag:
                    categories.append(tag['term'])
        
        if 'category' in entry:
            if isinstance(entry['category'], str):
                categories.append(entry['category'])
            elif isinstance(entry['category'], list):
                categories.extend(entry['category'])
        
        return categories
    
    def _clean_html(self, text: str) -> str:
        """
        Remove HTML tags from text.
        
        Args:
            text: Text with HTML tags
            
        Returns:
            Clean text without HTML
        """
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(text, 'html.parser')
            return soup.get_text(separator=' ', strip=True)
        except ImportError:
            # Fallback: simple regex-based cleaning
            import re
            text = re.sub(r'<[^>]+>', '', text)
            text = re.sub(r'\s+', ' ', text)
            return text.strip()


if __name__ == '__main__':
    # Test RSS fetcher
    print("Testing RSS Fetcher...")
    
    # Test with TechCrunch AI feed
    fetcher = RSSFetcher(
        'TechCrunch',
        'https://techcrunch.com/category/artificial-intelligence/feed/'
    )
    
    try:
        articles = fetcher.fetch_articles(hours_back=168)  # Last week
        print(f"\n✅ Fetched {len(articles)} articles from {fetcher.source_name}")
        
        if articles:
            print("\nFirst article:")
            article = articles[0]
            print(f"  Title: {article['title']}")
            print(f"  URL: {article['url']}")
            print(f"  Date: {article['published_date']}")
            print(f"  Summary: {article['summary'][:200]}...")
            print(f"  Categories: {article['categories']}")
    except Exception as e:
        print(f"❌ Error: {e}")

# Made with Bob
