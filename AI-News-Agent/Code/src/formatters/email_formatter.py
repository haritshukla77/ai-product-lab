"""
Email formatter for AI news digest.
Generates HTML and plain text versions of the digest.
"""

from datetime import datetime
from typing import Dict, List
from jinja2 import Template, Environment, FileSystemLoader
import os
import html2text


class EmailFormatter:
    """
    Format articles into HTML and plain text email digest.
    """
    
    def __init__(self, template_path: str = None):
        """
        Initialize email formatter.
        
        Args:
            template_path: Path to HTML template file
        """
        if template_path is None:
            # Default template path
            current_dir = os.path.dirname(os.path.abspath(__file__))
            template_path = os.path.join(current_dir, 'templates', 'digest.html')
        
        self.template_path = template_path
        self.template = self._load_template()
    
    def _load_template(self) -> Template:
        """
        Load Jinja2 template from file.
        
        Returns:
            Jinja2 Template object
        """
        try:
            with open(self.template_path, 'r', encoding='utf-8') as f:
                template_content = f.read()
            return Template(template_content)
        except FileNotFoundError:
            raise FileNotFoundError(f"Template not found: {self.template_path}")
    
    def format_digest(
        self,
        categorized_articles: Dict[str, List[Dict]],
        date: datetime = None
    ) -> str:
        """
        Format articles into HTML email digest.
        
        Args:
            categorized_articles: Dictionary mapping category names to article lists
            date: Date for the digest (default: today)
            
        Returns:
            HTML email content
        """
        if date is None:
            date = datetime.now()
        
        # Count total articles and sources
        total_articles = sum(len(articles) for articles in categorized_articles.values())
        sources = set()
        for articles in categorized_articles.values():
            for article in articles:
                sources.add(article.get('source', 'Unknown'))
        
        # Prepare template data
        template_data = {
            'date': date.strftime('%A, %B %d, %Y'),
            'total_articles': total_articles,
            'source_count': len(sources),
            'categories': categorized_articles
        }
        
        # Render template
        html_content = self.template.render(**template_data)
        
        return html_content
    
    def create_plain_text_version(self, html_content: str) -> str:
        """
        Create plain text version of HTML email.
        
        Args:
            html_content: HTML email content
            
        Returns:
            Plain text version
        """
        try:
            # Use html2text for conversion
            h = html2text.HTML2Text()
            h.ignore_links = False
            h.ignore_images = True
            h.ignore_emphasis = False
            h.body_width = 0  # Don't wrap lines
            
            plain_text = h.handle(html_content)
            return plain_text
        except Exception as e:
            # Fallback: simple HTML stripping
            import re
            text = re.sub(r'<[^>]+>', '', html_content)
            text = re.sub(r'\s+', ' ', text)
            return text.strip()
    
    def create_subject_line(
        self,
        total_articles: int,
        date: datetime = None
    ) -> str:
        """
        Create email subject line.
        
        Args:
            total_articles: Number of articles in digest
            date: Date for the digest
            
        Returns:
            Email subject line
        """
        if date is None:
            date = datetime.now()
        
        date_str = date.strftime('%B %d, %Y')
        
        if total_articles == 0:
            return f"AI News Digest - {date_str} (No new articles)"
        elif total_articles == 1:
            return f"AI News Digest - {date_str} (1 article)"
        else:
            return f"AI News Digest - {date_str} ({total_articles} articles)"
    
    def format_preview(
        self,
        categorized_articles: Dict[str, List[Dict]],
        output_path: str = 'preview.html'
    ) -> str:
        """
        Create a preview HTML file for testing.
        
        Args:
            categorized_articles: Dictionary mapping category names to article lists
            output_path: Path to save preview file
            
        Returns:
            Path to preview file
        """
        html_content = self.format_digest(categorized_articles)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return os.path.abspath(output_path)


def format_article_summary(article: Dict, max_length: int = 200) -> str:
    """
    Format article summary with truncation.
    
    Args:
        article: Article dictionary
        max_length: Maximum length of summary
        
    Returns:
        Formatted summary
    """
    summary = article.get('summary', '')
    if len(summary) > max_length:
        summary = summary[:max_length].rsplit(' ', 1)[0] + '...'
    return summary


def get_article_excerpt(article: Dict, max_words: int = 50) -> str:
    """
    Get article excerpt with word limit.
    
    Args:
        article: Article dictionary
        max_words: Maximum number of words
        
    Returns:
        Article excerpt
    """
    content = article.get('content', '') or article.get('summary', '')
    words = content.split()
    
    if len(words) <= max_words:
        return content
    
    excerpt = ' '.join(words[:max_words]) + '...'
    return excerpt


if __name__ == '__main__':
    # Test email formatter
    print("Testing Email Formatter...\n")
    
    # Create test data
    test_articles = {
        'top_stories': [
            {
                'title': 'GPT-5 Achieves Breakthrough in Language Understanding',
                'url': 'https://example.com/article1',
                'source': 'TechCrunch',
                'published_date': datetime.now(),
                'summary': 'OpenAI announces major improvements in their latest language model, showing unprecedented understanding of context and nuance.',
                'relevance_score': 8.5,
                'categories': ['AI', 'LLM', 'NLP']
            },
            {
                'title': 'New Transformer Architecture Reduces Training Time by 50%',
                'url': 'https://example.com/article2',
                'source': 'MIT Technology Review',
                'published_date': datetime.now(),
                'summary': 'Researchers develop innovative attention mechanism that significantly speeds up model training.',
                'relevance_score': 7.8,
                'categories': ['Machine Learning', 'Research']
            }
        ],
        'llm_language_models': [
            {
                'title': 'Understanding Emergent Abilities in Large Language Models',
                'url': 'https://example.com/article3',
                'source': 'VentureBeat',
                'published_date': datetime.now(),
                'summary': 'Analysis of how LLMs develop unexpected capabilities as they scale.',
                'relevance_score': 6.5,
                'categories': ['LLM', 'AI Research']
            }
        ],
        'research_papers': [
            {
                'title': 'Attention Is All You Need: A Retrospective',
                'url': 'https://arxiv.org/abs/example',
                'source': 'ArXiv',
                'published_date': datetime.now(),
                'summary': 'Five years after the transformer paper, we examine its lasting impact on AI.',
                'author': 'John Doe, Jane Smith',
                'relevance_score': 7.2,
                'categories': ['cs.AI', 'cs.CL']
            }
        ],
        'industry_news': [
            {
                'title': 'Tech Giants Invest Billions in AI Infrastructure',
                'url': 'https://example.com/article4',
                'source': 'TechCrunch',
                'published_date': datetime.now(),
                'summary': 'Major technology companies announce massive investments in AI computing resources.',
                'relevance_score': 5.5,
                'categories': ['Business', 'AI']
            }
        ]
    }
    
    # Create formatter
    formatter = EmailFormatter()
    
    # Format digest
    html_content = formatter.format_digest(test_articles)
    print("✅ HTML digest created")
    
    # Create plain text version
    plain_text = formatter.create_plain_text_version(html_content)
    print("✅ Plain text version created")
    
    # Create subject line
    total = sum(len(articles) for articles in test_articles.values())
    subject = formatter.create_subject_line(total)
    print(f"✅ Subject: {subject}")
    
    # Create preview
    preview_path = formatter.format_preview(test_articles)
    print(f"✅ Preview saved to: {preview_path}")
    print("\nOpen preview.html in your browser to see the formatted email!")

# Made with Bob
