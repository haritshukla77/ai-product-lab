"""
Job scheduler for AI News Agent.
Schedules daily digest delivery using APScheduler.
"""

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz
from typing import Callable
from datetime import datetime


class JobScheduler:
    """
    Schedule and run daily digest jobs.
    Uses APScheduler for reliable scheduling.
    """
    
    def __init__(self, timezone: str = 'Asia/Kolkata'):
        """
        Initialize job scheduler.
        
        Args:
            timezone: Timezone for scheduling (default: Asia/Kolkata)
        """
        self.scheduler = BlockingScheduler()
        self.timezone = pytz.timezone(timezone)
    
    def schedule_daily_digest(
        self,
        hour: int,
        minute: int,
        callback: Callable,
        job_id: str = 'daily_digest'
    ) -> None:
        """
        Schedule daily digest job.
        
        Args:
            hour: Hour to run (0-23)
            minute: Minute to run (0-59)
            callback: Function to call when job runs
            job_id: Unique identifier for the job
        """
        # Create cron trigger
        trigger = CronTrigger(
            hour=hour,
            minute=minute,
            timezone=self.timezone
        )
        
        # Add job to scheduler
        self.scheduler.add_job(
            callback,
            trigger=trigger,
            id=job_id,
            replace_existing=True,
            name=f'Daily AI News Digest at {hour:02d}:{minute:02d}'
        )
        
        print(f"✅ Scheduled daily digest for {hour:02d}:{minute:02d} {self.timezone}")
    
    def start(self) -> None:
        """
        Start the scheduler.
        This will block until the scheduler is shut down.
        """
        try:
            print(f"\n🚀 Scheduler started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print("Press Ctrl+C to stop\n")
            self.scheduler.start()
        except (KeyboardInterrupt, SystemExit):
            print("\n\n⏹️  Scheduler stopped")
            self.shutdown()
    
    def shutdown(self) -> None:
        """Shutdown the scheduler gracefully."""
        if self.scheduler.running:
            self.scheduler.shutdown(wait=False)
    
    def run_once(self, callback: Callable) -> None:
        """
        Run the job immediately once (for testing).
        
        Args:
            callback: Function to call
        """
        print(f"▶️  Running job immediately at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        try:
            callback()
            print("✅ Job completed successfully")
        except Exception as e:
            print(f"❌ Job failed: {e}")
            raise
    
    def list_jobs(self) -> None:
        """Print all scheduled jobs."""
        jobs = self.scheduler.get_jobs()
        if not jobs:
            print("No jobs scheduled")
            return
        
        print("\nScheduled Jobs:")
        for job in jobs:
            print(f"  - {job.name} (ID: {job.id})")
            print(f"    Next run: {job.next_run_time}")
    
    def remove_job(self, job_id: str) -> bool:
        """
        Remove a scheduled job.
        
        Args:
            job_id: Job identifier
            
        Returns:
            True if job was removed, False if not found
        """
        try:
            self.scheduler.remove_job(job_id)
            print(f"✅ Removed job: {job_id}")
            return True
        except Exception:
            print(f"❌ Job not found: {job_id}")
            return False


def create_cron_command(
    python_path: str,
    script_path: str,
    schedule_time: str = "08:00",
    log_path: str = "logs/cron.log"
) -> str:
    """
    Generate cron command for system cron.
    
    Args:
        python_path: Path to Python interpreter
        script_path: Path to main.py script
        schedule_time: Time in HH:MM format
        log_path: Path to log file
        
    Returns:
        Cron command string
    """
    hour, minute = schedule_time.split(':')
    
    cron_line = (
        f"{minute} {hour} * * * "
        f"cd {script_path.rsplit('/', 1)[0]} && "
        f"{python_path} {script_path} --once "
        f">> {log_path} 2>&1"
    )
    
    return cron_line


def create_launchd_plist(
    python_path: str,
    script_path: str,
    schedule_time: str = "08:00",
    log_path: str = "logs/launchd.log",
    error_log_path: str = "logs/launchd.error.log"
) -> str:
    """
    Generate launchd plist for macOS.
    
    Args:
        python_path: Path to Python interpreter
        script_path: Path to main.py script
        schedule_time: Time in HH:MM format
        log_path: Path to stdout log
        error_log_path: Path to stderr log
        
    Returns:
        Plist XML string
    """
    hour, minute = schedule_time.split(':')
    
    plist = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ainews.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>{python_path}</string>
        <string>{script_path}</string>
        <string>--once</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>{hour}</integer>
        <key>Minute</key>
        <integer>{minute}</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>{log_path}</string>
    <key>StandardErrorPath</key>
    <string>{error_log_path}</string>
</dict>
</plist>"""
    
    return plist


if __name__ == '__main__':
    # Test scheduler
    print("Testing Job Scheduler...\n")
    
    def test_job():
        """Test job function."""
        print(f"✅ Job executed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Create scheduler
    scheduler = JobScheduler('Asia/Kolkata')
    
    # Test run once
    print("Testing immediate execution:")
    scheduler.run_once(test_job)
    
    # Show how to schedule
    print("\n" + "="*50)
    print("To schedule daily execution:")
    print("="*50)
    
    # Example cron command
    cron_cmd = create_cron_command(
        '/usr/bin/python3',
        '/path/to/ai-news-agent/main.py',
        '08:00'
    )
    print("\nCron command:")
    print(cron_cmd)
    
    # Example launchd plist
    print("\nLaunchd plist (save to ~/Library/LaunchAgents/com.ainews.agent.plist):")
    plist = create_launchd_plist(
        '/usr/bin/python3',
        '/path/to/ai-news-agent/main.py',
        '08:00'
    )
    print(plist)
    
    print("\n" + "="*50)
    print("To start scheduler (will run continuously):")
    print("  python main.py")
    print("="*50)

# Made with Bob
