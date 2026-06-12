"""
Keyword-based content filtering for AI news articles.
Scores articles based on relevance to AI/LLM topics.
"""

import re
from typing import List, Dict, Tuple


class KeywordFilter:
    """
    Filter and score articles based on keyword matching.
    Focuses on LLMs and AI breakthroughs.
    """
    
    def __init__(self, filter_config):
        """
        Initialize keyword filter.
        
        Args:
            filter_config: FilterConfig object from config.py
        """
        self.min_score = filter_config.min_relevance_score
        self.max_articles = filter_config.max_articles_per_digest
        self.primary_keywords = [kw.lower() for kw in filter_config.primary_keywords]
        self.secondary_keywords = [kw.lower() for kw in filter_config.secondary_keywords]
        self.exclusion_keywords = [kw.lower() for kw in filter_config.exclusion_keywords]
    
    def calculate_relevance_score(self, article: Dict) -> float:
        """
        Calculate relevance score for an article.
        
        Scoring system:
        - Title match (primary keyword): +3 points
        - Title match (secondary keyword): +2 points
        - Summary match (primary): +2 points
        - Summary match (secondary): +1 point
        - Multiple matches: +1 per additional match
        - Exclusion keyword: -5 points
        
        Args:
            article: Article dictionary
            
        Returns:
            Relevance score (can be negative)
        """
        score = 0.0
        title = article.get('title', '').lower()
        summary = article.get('summary', '').lower()
        content = article.get('content', '').lower()
        
        # Combine text for matching
        full_text = f"{title} {summary} {content}"
        
        # Check for exclusion keywords first
        for keyword in self.exclusion_keywords:
            if self._contains_keyword(full_text, keyword):
                score -= 5.0
        
        # Count primary keyword matches
        primary_matches = 0
        for keyword in self.primary_keywords:
            # Title matches are worth more
            if self._contains_keyword(title, keyword):
                score += 3.0
                primary_matches += 1
            # Summary matches
            elif self._contains_keyword(summary, keyword):
                score += 2.0
                primary_matches += 1
            # Content matches (less weight)
            elif self._contains_keyword(content, keyword):
                score += 1.0
                primary_matches += 1
        
        # Count secondary keyword matches
        secondary_matches = 0
        for keyword in self.secondary_keywords:
            if self._contains_keyword(title, keyword):
                score += 2.0
                secondary_matches += 1
            elif self._contains_keyword(summary, keyword):
                score += 1.0
                secondary_matches += 1
            elif self._contains_keyword(content, keyword):
                score += 0.5
                secondary_matches += 1
        
        # Bonus for multiple matches
        total_matches = primary_matches + secondary_matches
        if total_matches > 2:
            score += (total_matches - 2) * 0.5
        
        # Bonus for ArXiv papers (research papers are valuable)
        if article.get('source') == 'ArXiv':
            score += 1.0
        
        return round(score, 2)
    
    def _contains_keyword(self, text: str, keyword: str) -> bool:
        """
        Check if text contains keyword (case-insensitive, word boundary aware).
        
        Args:
            text: Text to search in
            keyword: Keyword to search for
            
        Returns:
            True if keyword is found
        """
        # Use word boundaries for better matching
        pattern = r'\b' + re.escape(keyword) + r'\b'
        return bool(re.search(pattern, text, re.IGNORECASE))
    
    def filter_articles(self, articles: List[Dict]) -> List[Dict]:
        """
        Filter and score articles, keeping only relevant ones.
        
        Args:
            articles: List of article dictionaries
            
        Returns:
            Filtered and sorted list of articles with scores
        """
        # Calculate scores for all articles
        scored_articles = []
        for article in articles:
            score = self.calculate_relevance_score(article)
            if score >= self.min_score:
                article['relevance_score'] = score
                scored_articles.append(article)
        
        # Sort by score (highest first)
        scored_articles.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        # Limit to max articles
        return scored_articles[:self.max_articles]
    
    def categorize_articles(self, articles: List[Dict]) -> Dict[str, List[Dict]]:
        """
        Categorize articles into different sections.
        
        Args:
            articles: List of scored articles
            
        Returns:
            Dictionary mapping category names to article lists
        """
        categories = {
            'top_stories': [],
            'llm_language_models': [],
            'research_papers': [],
            'industry_news': []
        }
        
        # LLM-related keywords
        llm_keywords = ['llm', 'large language model', 'gpt', 'transformer', 
                       'natural language', 'nlp', 'language model']
        
        for article in articles:
            title_lower = article.get('title', '').lower()
            summary_lower = article.get('summary', '').lower()
            text = f"{title_lower} {summary_lower}"
            
            # Top stories (highest scored)
            if article['relevance_score'] >= 6.0:
                categories['top_stories'].append(article)
            
            # LLM & Language Models
            if any(self._contains_keyword(text, kw) for kw in llm_keywords):
                categories['llm_language_models'].append(article)
            
            # Research Papers (ArXiv)
            if article.get('source') == 'ArXiv':
                categories['research_papers'].append(article)
            
            # Industry News (everything else)
            if (article not in categories['top_stories'] and 
                article not in categories['llm_language_models'] and
                article not in categories['research_papers']):
                categories['industry_news'].append(article)
        
        # Limit each category
        max_per_category = max(5, self.max_articles // 4)
        for category in categories:
            categories[category] = categories[category][:max_per_category]
        
        return categories
    
    def get_statistics(self, articles: List[Dict]) -> Dict:
        """
        Get filtering statistics.
        
        Args:
            articles: List of articles (before filtering)
            
        Returns:
            Dictionary with statistics
        """
        if not articles:
            return {
                'total_articles': 0,
                'filtered_articles': 0,
                'average_score': 0.0,
                'top_score': 0.0
            }
        
        # Calculate scores
        scores = [self.calculate_relevance_score(article) for article in articles]
        filtered_count = sum(1 for score in scores if score >= self.min_score)
        
        return {
            'total_articles': len(articles),
            'filtered_articles': filtered_count,
            'average_score': round(sum(scores) / len(scores), 2) if scores else 0.0,
            'top_score': round(max(scores), 2) if scores else 0.0,
            'min_score_threshold': self.min_score
        }


if __name__ == '__main__':
    # Test keyword filter
    print("Testing Keyword Filter...\n")
    
    # Create mock filter config
    from dataclasses import dataclass, field
    from typing import List
    
    @dataclass
    class MockFilterConfig:
        min_relevance_score: float = 3.0
        max_articles_per_digest: int = 20
        primary_keywords: List[str] = field(default_factory=lambda: [
            'llm', 'large language model', 'gpt', 'transformer'
        ])
        secondary_keywords: List[str] = field(default_factory=lambda: [
            'ai breakthrough', 'artificial intelligence', 'machine learning'
        ])
        exclusion_keywords: List[str] = field(default_factory=lambda: [
            'cryptocurrency', 'blockchain'
        ])
    
    config = MockFilterConfig()
    filter = KeywordFilter(config)
    
    # Test articles
    test_articles = [
        {
            'title': 'New GPT-5 LLM Shows Breakthrough Performance',
            'summary': 'Large language model achieves state-of-the-art results',
            'content': 'Detailed analysis of transformer architecture improvements',
            'source': 'TechCrunch'
        },
        {
            'title': 'Cryptocurrency Market Update',
            'summary': 'Bitcoin and blockchain news',
            'content': 'Latest crypto trends',
            'source': 'VentureBeat'
        },
        {
            'title': 'Machine Learning in Healthcare',
            'summary': 'AI applications in medical diagnosis',
            'content': 'Artificial intelligence helping doctors',
            'source': 'MIT Technology Review'
        },
        {
            'title': 'Attention Mechanisms in Neural Networks',
            'summary': 'Research on transformer models for NLP',
            'content': 'Deep learning architecture study',
            'source': 'ArXiv'
        }
    ]
    
    # Calculate scores
    print("Article Scores:")
    for article in test_articles:
        score = filter.calculate_relevance_score(article)
        print(f"  {article['title'][:50]}... = {score}")
    
    # Filter articles
    filtered = filter.filter_articles(test_articles)
    print(f"\n✅ Filtered to {len(filtered)} relevant articles")
    
    # Categorize
    categories = filter.categorize_articles(filtered)
    print("\nCategories:")
    for cat_name, cat_articles in categories.items():
        if cat_articles:
            print(f"  {cat_name}: {len(cat_articles)} articles")
    
    # Statistics
    stats = filter.get_statistics(test_articles)
    print(f"\nStatistics:")
    print(f"  Total: {stats['total_articles']}")
    print(f"  Filtered: {stats['filtered_articles']}")
    print(f"  Avg Score: {stats['average_score']}")
    print(f"  Top Score: {stats['top_score']}")

# Made with Bob
