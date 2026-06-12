"""
Logging setup for AI News Agent.
Configures file and console logging with rotation.
"""

import logging
import os
from logging.handlers import RotatingFileHandler
from typing import Optional


class LoggerSetup:
    """Setup and configure loggers for the application."""
    
    @staticmethod
    def setup_logger(
        name: str,
        log_file: str,
        level: str = 'INFO',
        max_bytes: int = 10 * 1024 * 1024,  # 10MB
        backup_count: int = 5
    ) -> logging.Logger:
        """
        Create and configure a logger with file and console handlers.
        
        Args:
            name: Logger name
            log_file: Log file name (will be created in logs/ directory)
            level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            max_bytes: Maximum size of log file before rotation (default: 10MB)
            backup_count: Number of backup files to keep (default: 5)
            
        Returns:
            Configured logger instance
        """
        # Create logger
        logger = logging.getLogger(name)
        logger.setLevel(getattr(logging, level.upper()))
        
        # Avoid adding handlers multiple times
        if logger.handlers:
            return logger
        
        # Create logs directory if it doesn't exist
        log_dir = 'logs'
        os.makedirs(log_dir, exist_ok=True)
        
        # Create formatters
        detailed_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        simple_formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s',
            datefmt='%H:%M:%S'
        )
        
        # File handler with rotation
        file_handler = RotatingFileHandler(
            os.path.join(log_dir, log_file),
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding='utf-8'
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(detailed_formatter)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(simple_formatter)
        
        # Add handlers to logger
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
        return logger
    
    @staticmethod
    def setup_all_loggers(log_level: str = 'INFO') -> dict:
        """
        Setup all application loggers.
        
        Args:
            log_level: Default logging level
            
        Returns:
            Dictionary of logger names to logger instances
        """
        loggers = {
            'main': LoggerSetup.setup_logger('main', 'app.log', log_level),
            'fetcher': LoggerSetup.setup_logger('fetcher', 'fetcher.log', log_level),
            'filter': LoggerSetup.setup_logger('filter', 'filter.log', log_level),
            'formatter': LoggerSetup.setup_logger('formatter', 'formatter.log', log_level),
            'sender': LoggerSetup.setup_logger('sender', 'email.log', log_level),
            'scheduler': LoggerSetup.setup_logger('scheduler', 'scheduler.log', log_level),
        }
        
        return loggers
    
    @staticmethod
    def cleanup_old_logs(retention_days: int = 30) -> None:
        """
        Clean up log files older than retention period.
        
        Args:
            retention_days: Number of days to retain logs
        """
        import time
        from pathlib import Path
        
        log_dir = Path('logs')
        if not log_dir.exists():
            return
        
        current_time = time.time()
        retention_seconds = retention_days * 24 * 60 * 60
        
        for log_file in log_dir.glob('*.log.*'):
            file_age = current_time - log_file.stat().st_mtime
            if file_age > retention_seconds:
                try:
                    log_file.unlink()
                    print(f"Deleted old log file: {log_file}")
                except Exception as e:
                    print(f"Error deleting {log_file}: {e}")


def get_logger(name: str) -> logging.Logger:
    """
    Get or create a logger with the given name.
    
    Args:
        name: Logger name
        
    Returns:
        Logger instance
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        # If logger doesn't exist, create it with default settings
        LoggerSetup.setup_logger(name, f'{name}.log')
    return logger


if __name__ == '__main__':
    # Test logging setup
    print("Testing logging setup...")
    
    # Setup all loggers
    loggers = LoggerSetup.setup_all_loggers('DEBUG')
    
    # Test each logger
    for name, logger in loggers.items():
        logger.debug(f"Debug message from {name}")
        logger.info(f"Info message from {name}")
        logger.warning(f"Warning message from {name}")
        logger.error(f"Error message from {name}")
    
    print("\n✅ Logging test complete! Check logs/ directory for output.")
    
    # Test cleanup (won't delete anything if files are recent)
    LoggerSetup.cleanup_old_logs(30)

# Made with Bob
