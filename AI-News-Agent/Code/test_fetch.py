#!/usr/bin/env python3
"""
Test news fetching from all sources.
"""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from config import load_config
from fetchers.sources import fetch_from_all_sources, aggregate_articles


def main():
    print("🧪 Testing News Fetching")
    print("="*60 + "\n")
    
    try:
        # Load configuration
        print("Loading configuration...")
        config = load_config()
        enabled_sources = config.get_enabled_sources()
        print(f"✅ Configuration loaded")
        print(f"   Enabled sources: {len(enabled_sources)}\n")
        
        for source in enabled_sources:
            print(f"   - {source.name} ({source.type})")
        
        print("\n" + "="*60)
        print("Fetching articles (last 7 days)...")
        print("="*60 + "\n")
        
        # Fetch from all sources
        results = fetch_from_all_sources(enabled_sources, hours_back=168)
        
        # Show results
        print("\n" + "="*60)
        print("Results Summary")
        print("="*60 + "\n")
        
        total = 0
        for source_name, articles in results.items():
            count = len(articles)
            total += count
            status = "✅" if count > 0 else "⚠️"
            print(f"{status} {source_name}: {count} articles")
        
        print(f"\n📊 Total: {total} articles from {len(results)} sources")
        
        if total > 0:
            # Aggregate and show sample
            all_articles = aggregate_articles(results)
            print("\n" + "="*60)
            print("Sample Articles (most recent 3)")
            print("="*60 + "\n")
            
            for i, article in enumerate(all_articles[:3], 1):
                print(f"{i}. {article['title']}")
                print(f"   Source: {article['source']}")
                print(f"   Date: {article['published_date']}")
                print(f"   URL: {article['url']}")
                print()
        
        print("✅ Fetch test completed successfully!")
        
    except FileNotFoundError as e:
        print(f"❌ {e}")
        print("\nPlease create .env file from .env.example and configure it.")
        sys.exit(1)
    
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

# Made with Bob
