"""
News source configurations and fetcher factory.
"""

from typing import List, Dict
from .base_fetcher import BaseFetcher
from .rss_fetcher import RSSFetcher
from .arxiv_fetcher import ArXivFetcher


def create_fetcher(source_config) -> BaseFetcher:
    """
    Create a fetcher instance based on source configuration.
    
    Args:
        source_config: SourceConfig object from config.py
        
    Returns:
        Appropriate fetcher instance
        
    Raises:
        ValueError: If source type is unknown
    """
    if source_config.type == 'rss':
        return RSSFetcher(source_config.name, source_config.url)
    elif source_config.type == 'api' and source_config.name == 'ArXiv':
        return ArXivFetcher()
    else:
        raise ValueError(f"Unknown source type: {source_config.type} for {source_config.name}")


def fetch_from_all_sources(source_configs: List, hours_back: int = 24) -> Dict[str, List[Dict]]:
    """
    Fetch articles from all enabled sources.
    
    Args:
        source_configs: List of SourceConfig objects
        hours_back: Number of hours to look back
        
    Returns:
        Dictionary mapping source names to lists of articles
    """
    results = {}
    errors = {}
    
    for source_config in source_configs:
        if not source_config.enabled:
            continue
        
        try:
            fetcher = create_fetcher(source_config)
            articles = fetcher.fetch_articles(hours_back=hours_back)
            results[source_config.name] = articles
            print(f"✅ Fetched {len(articles)} articles from {source_config.name}")
        except Exception as e:
            errors[source_config.name] = str(e)
            print(f"❌ Failed to fetch from {source_config.name}: {e}")
            results[source_config.name] = []
    
    # Log summary
    total_articles = sum(len(articles) for articles in results.values())
    print(f"\n📊 Total: {total_articles} articles from {len(results)} sources")
    
    if errors:
        print(f"⚠️  Errors: {len(errors)} sources failed")
    
    return results


def aggregate_articles(source_results: Dict[str, List[Dict]]) -> List[Dict]:
    """
    Aggregate articles from all sources into a single list.
    
    Args:
        source_results: Dictionary mapping source names to article lists
        
    Returns:
        Combined list of all articles
    """
    all_articles = []
    
    for source_name, articles in source_results.items():
        all_articles.extend(articles)
    
    # Sort by publication date (newest first)
    all_articles.sort(key=lambda x: x['published_date'], reverse=True)
    
    return all_articles


if __name__ == '__main__':
    # Test fetching from all sources
    print("Testing all news sources...\n")
    
    # Create mock source configs
    from dataclasses import dataclass
    
    @dataclass
    class MockSourceConfig:
        name: str
        url: str
        type: str
        enabled: bool = True
    
    sources = [
        MockSourceConfig(
            name='TechCrunch',
            url='https://techcrunch.com/category/artificial-intelligence/feed/',
            type='rss'
        ),
        MockSourceConfig(
            name='VentureBeat',
            url='https://venturebeat.com/category/ai/feed/',
            type='rss'
        ),
        MockSourceConfig(
            name='MIT Technology Review',
            url='https://www.technologyreview.com/topic/artificial-intelligence/feed',
            type='rss'
        ),
        MockSourceConfig(
            name='ArXiv',
            url='http://export.arxiv.org/api/query',
            type='api'
        )
    ]
    
    # Fetch from all sources
    results = fetch_from_all_sources(sources, hours_back=168)  # Last week
    
    # Aggregate articles
    all_articles = aggregate_articles(results)
    
    print(f"\n📰 Aggregated {len(all_articles)} total articles")
    
    if all_articles:
        print("\nMost recent article:")
        article = all_articles[0]
        print(f"  Source: {article['source']}")
        print(f"  Title: {article['title']}")
        print(f"  Date: {article['published_date']}")
        print(f"  URL: {article['url']}")

# Made with Bob
