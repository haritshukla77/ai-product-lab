#!/usr/bin/env python3
"""
AI News Agent - Main Entry Point
Automated daily AI news digest delivery system.
"""

import sys
import os
from datetime import datetime

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from config import load_config
from logger_setup import LoggerSetup
from fetchers.sources import fetch_from_all_sources, aggregate_articles
from filters.keyword_filter import KeywordFilter
from formatters.email_formatter import EmailFormatter
from sender.gmail_sender import GmailSender
from scheduler.job_scheduler import JobScheduler


def run_digest_job(test_mode: bool = False) -> bool:
    """
    Main job execution function.
    Fetches, filters, formats, and sends the daily digest.
    
    Args:
        test_mode: If True, creates preview instead of sending email
        
    Returns:
        True if successful, False otherwise
    """
    # Setup logging
    logger = LoggerSetup.setup_logger('main', 'app.log')
    
    try:
        logger.info("="*60)
        logger.info("Starting AI News Digest Job")
        logger.info(f"Mode: {'TEST' if test_mode else 'PRODUCTION'}")
        logger.info(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info("="*60)
        
        # Load configuration
        logger.info("Loading configuration...")
        config = load_config()
        logger.info(f"Configuration loaded: {len(config.get_enabled_sources())} sources enabled")
        
        # Fetch articles from all sources
        logger.info("\n📰 Fetching articles from sources...")
        source_results = fetch_from_all_sources(
            config.get_enabled_sources(),
            hours_back=24
        )
        
        # Aggregate articles
        all_articles = aggregate_articles(source_results)
        logger.info(f"Total articles fetched: {len(all_articles)}")
        
        if not all_articles:
            logger.warning("No articles fetched. Skipping digest.")
            return False
        
        # Filter and score articles
        logger.info("\n🎯 Filtering articles...")
        keyword_filter = KeywordFilter(config.filter)
        filtered_articles = keyword_filter.filter_articles(all_articles)
        logger.info(f"Filtered to {len(filtered_articles)} relevant articles")
        
        # Get statistics
        stats = keyword_filter.get_statistics(all_articles)
        logger.info(f"Average relevance score: {stats['average_score']}")
        logger.info(f"Top score: {stats['top_score']}")
        
        if not filtered_articles:
            logger.warning("No articles passed filtering. Skipping digest.")
            return False
        
        # Categorize articles
        logger.info("\n📂 Categorizing articles...")
        categorized = keyword_filter.categorize_articles(filtered_articles)
        for category, articles in categorized.items():
            if articles:
                logger.info(f"  {category}: {len(articles)} articles")
        
        # Format email
        logger.info("\n✉️  Formatting email...")
        formatter = EmailFormatter()
        html_content = formatter.format_digest(categorized)
        plain_content = formatter.create_plain_text_version(html_content)
        subject = formatter.create_subject_line(len(filtered_articles))
        logger.info(f"Subject: {subject}")
        
        # Send or preview
        if test_mode:
            # Create preview file
            logger.info("\n🔍 Creating preview...")
            preview_path = formatter.format_preview(categorized)
            logger.info(f"✅ Preview saved to: {preview_path}")
            print(f"\n✅ Preview created: {preview_path}")
            print("Open this file in your browser to see the formatted email.")
            return True
        else:
            # Send email
            logger.info("\n📧 Sending email...")
            sender = GmailSender(
                config.email.gmail_user,
                config.email.gmail_app_password,
                config.email.sender_name
            )
            
            success = sender.send_email(
                config.email.recipient_email,
                subject,
                html_content,
                plain_content
            )
            
            if success:
                logger.info(f"✅ Email sent successfully to {config.email.recipient_email}")
                print(f"\n✅ Digest sent to {config.email.recipient_email}")
                return True
            else:
                logger.error("❌ Failed to send email")
                print("\n❌ Failed to send email")
                return False
    
    except Exception as e:
        logger.error(f"❌ Job failed with error: {e}", exc_info=True)
        print(f"\n❌ Error: {e}")
        
        # Try to send error notification
        try:
            send_error_notification(config, str(e))
        except:
            pass
        
        return False
    
    finally:
        logger.info("="*60)
        logger.info("Job completed")
        logger.info("="*60 + "\n")


def send_error_notification(config, error_message: str) -> None:
    """
    Send error notification email.
    
    Args:
        config: Configuration object
        error_message: Error message to include
    """
    try:
        sender = GmailSender(
            config.email.gmail_user,
            config.email.gmail_app_password,
            config.email.sender_name
        )
        
        subject = "AI News Agent - Error Notification"
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #dc3545;">⚠️ AI News Agent Error</h2>
            <p>The AI News Agent encountered an error:</p>
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
{error_message}
            </pre>
            <p>Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p>Please check the logs for more details.</p>
        </body>
        </html>
        """
        
        sender.send_email(
            config.email.recipient_email,
            subject,
            html_content
        )
    except Exception as e:
        print(f"Failed to send error notification: {e}")


def main():
    """Main entry point."""
    print("🤖 AI News Agent")
    print("="*60)
    
    # Parse command line arguments
    test_mode = '--test' in sys.argv
    run_once = '--once' in sys.argv
    
    if test_mode:
        print("Running in TEST mode (preview only)")
        print("="*60 + "\n")
        run_digest_job(test_mode=True)
    
    elif run_once:
        print("Running ONCE (single execution)")
        print("="*60 + "\n")
        success = run_digest_job(test_mode=False)
        sys.exit(0 if success else 1)
    
    else:
        # Run scheduler
        print("Starting SCHEDULER (continuous operation)")
        print("="*60 + "\n")
        
        try:
            # Load config for schedule time
            config = load_config()
            hour, minute = map(int, config.schedule.time.split(':'))
            
            # Create scheduler
            scheduler = JobScheduler(config.schedule.timezone)
            
            # Schedule daily job
            scheduler.schedule_daily_digest(
                hour,
                minute,
                lambda: run_digest_job(test_mode=False)
            )
            
            # List scheduled jobs
            scheduler.list_jobs()
            
            # Start scheduler (blocks)
            scheduler.start()
            
        except KeyboardInterrupt:
            print("\n\n⏹️  Scheduler stopped by user")
            sys.exit(0)
        except Exception as e:
            print(f"\n❌ Scheduler error: {e}")
            sys.exit(1)


if __name__ == '__main__':
    main()

# Made with Bob
