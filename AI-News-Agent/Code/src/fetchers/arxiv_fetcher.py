"""
ArXiv API fetcher for research papers.
Fetches AI-related papers from ArXiv.
"""

import requests
from datetime import datetime, timedelta
from typing import List, Dict
from xml.etree import ElementTree as ET

from .base_fetcher import BaseFetcher


class ArXivFetcher(BaseFetcher):
    """
    Fetcher for ArXiv research papers.
    Uses the ArXiv API to fetch papers from AI-related categories.
    """
    
    BASE_URL = 'http://export.arxiv.org/api/query'
    
    # ArXiv categories for AI research
    CATEGORIES = [
        'cs.AI',  # Artificial Intelligence
        'cs.CL',  # Computation and Language (NLP)
        'cs.LG',  # Machine Learning
        'cs.CV',  # Computer Vision
        'cs.NE',  # Neural and Evolutionary Computing
    ]
    
    def __init__(self):
        """Initialize ArXiv fetcher."""
        super().__init__('ArXiv')
    
    def fetch_articles(self, hours_back: int = 24, max_results: int = 50) -> List[Dict]:
        """
        Fetch papers from ArXiv.
        
        Args:
            hours_back: Number of hours to look back for papers
            max_results: Maximum number of results to fetch
            
        Returns:
            List of standardized article dictionaries
            
        Raises:
            Exception: If API request fails
        """
        try:
            # Build search query for AI categories
            category_query = ' OR '.join([f'cat:{cat}' for cat in self.CATEGORIES])
            
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(hours=hours_back)
            
            # Build API parameters
            params = {
                'search_query': category_query,
                'start': 0,
                'max_results': max_results,
                'sortBy': 'submittedDate',
                'sortOrder': 'descending'
            }
            
            # Make API request
            response = requests.get(self.BASE_URL, params=params, timeout=30)
            response.raise_for_status()
            
            # Parse XML response
            articles = self._parse_arxiv_response(response.text, start_date)
            
            return articles
            
        except requests.RequestException as e:
            raise Exception(f"Failed to fetch from ArXiv: {e}")
        except Exception as e:
            raise Exception(f"Error processing ArXiv data: {e}")
    
    def get_source_name(self) -> str:
        """Get the source name."""
        return self.source_name
    
    def _parse_arxiv_response(self, xml_text: str, start_date: datetime) -> List[Dict]:
        """
        Parse ArXiv API XML response.
        
        Args:
            xml_text: XML response from ArXiv API
            start_date: Filter papers after this date
            
        Returns:
            List of article dictionaries
        """
        articles = []
        
        try:
            # Parse XML
            root = ET.fromstring(xml_text)
            
            # Define namespace
            ns = {
                'atom': 'http://www.w3.org/2005/Atom',
                'arxiv': 'http://arxiv.org/schemas/atom'
            }
            
            # Find all entry elements
            for entry in root.findall('atom:entry', ns):
                try:
                    # Extract data
                    title = self._get_text(entry, 'atom:title', ns)
                    url = self._get_text(entry, 'atom:id', ns)
                    summary = self._get_text(entry, 'atom:summary', ns)
                    published_str = self._get_text(entry, 'atom:published', ns)
                    updated_str = self._get_text(entry, 'atom:updated', ns)
                    
                    # Parse dates
                    published_date = self._parse_arxiv_date(published_str)
                    
                    # Skip if not recent enough
                    if published_date < start_date:
                        continue
                    
                    # Extract authors
                    authors = []
                    for author in entry.findall('atom:author', ns):
                        name = self._get_text(author, 'atom:name', ns)
                        if name:
                            authors.append(name)
                    author_str = ', '.join(authors) if authors else ''
                    
                    # Extract categories
                    categories = []
                    for category in entry.findall('atom:category', ns):
                        term = category.get('term', '')
                        if term:
                            categories.append(term)
                    
                    # Get PDF link
                    pdf_url = url.replace('/abs/', '/pdf/') + '.pdf'
                    
                    # Create article
                    article = self._create_article(
                        title=self._clean_text(title),
                        url=url,
                        published_date=published_date,
                        summary=self._clean_text(summary),
                        content=self._clean_text(summary),  # ArXiv doesn't provide full text
                        author=author_str,
                        categories=categories,
                        raw_data={
                            'pdf_url': pdf_url,
                            'updated': updated_str
                        }
                    )
                    
                    articles.append(article)
                    
                except Exception as e:
                    print(f"Error parsing ArXiv entry: {e}")
                    continue
            
        except ET.ParseError as e:
            raise Exception(f"Failed to parse ArXiv XML: {e}")
        
        return articles
    
    def _get_text(self, element: ET.Element, path: str, namespaces: Dict) -> str:
        """
        Safely extract text from XML element.
        
        Args:
            element: XML element
            path: XPath to text
            namespaces: XML namespaces
            
        Returns:
            Extracted text or empty string
        """
        found = element.find(path, namespaces)
        return found.text if found is not None and found.text else ''
    
    def _parse_arxiv_date(self, date_str: str) -> datetime:
        """
        Parse ArXiv date string.
        
        Args:
            date_str: Date string from ArXiv (ISO 8601 format)
            
        Returns:
            Parsed datetime object
        """
        try:
            # ArXiv uses ISO 8601 format: 2024-01-15T12:30:00Z
            # Remove timezone indicator and parse
            date_str = date_str.replace('Z', '+00:00')
            return datetime.fromisoformat(date_str.replace('+00:00', ''))
        except (ValueError, AttributeError):
            return datetime.now()
    
    def _clean_text(self, text: str) -> str:
        """
        Clean text by removing extra whitespace and newlines.
        
        Args:
            text: Text to clean
            
        Returns:
            Cleaned text
        """
        if not text:
            return ''
        
        # Replace multiple whitespace with single space
        import re
        text = re.sub(r'\s+', ' ', text)
        return text.strip()


if __name__ == '__main__':
    # Test ArXiv fetcher
    print("Testing ArXiv Fetcher...")
    
    fetcher = ArXivFetcher()
    
    try:
        articles = fetcher.fetch_articles(hours_back=168, max_results=10)  # Last week
        print(f"\n✅ Fetched {len(articles)} papers from {fetcher.source_name}")
        
        if articles:
            print("\nFirst paper:")
            article = articles[0]
            print(f"  Title: {article['title']}")
            print(f"  URL: {article['url']}")
            print(f"  Date: {article['published_date']}")
            print(f"  Authors: {article['author']}")
            print(f"  Categories: {article['categories']}")
            print(f"  Summary: {article['summary'][:200]}...")
    except Exception as e:
        print(f"❌ Error: {e}")

# Made with Bob
