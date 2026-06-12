"""
Gmail SMTP sender for email delivery.
Sends formatted email digests via Gmail.
"""

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
import time


class GmailSender:
    """
    Send emails via Gmail SMTP.
    Uses App Passwords for authentication.
    """
    
    SMTP_SERVER = 'smtp.gmail.com'
    SMTP_PORT = 587
    
    def __init__(self, username: str, app_password: str, sender_name: str = "AI News Agent"):
        """
        Initialize Gmail sender.
        
        Args:
            username: Gmail email address
            app_password: Gmail App Password (16 characters)
            sender_name: Display name for sender
        """
        self.username = username
        self.app_password = app_password
        self.sender_name = sender_name
    
    def send_email(
        self,
        recipient: str,
        subject: str,
        html_content: str,
        plain_content: Optional[str] = None,
        retry_count: int = 3,
        retry_delay: int = 5
    ) -> bool:
        """
        Send email via Gmail SMTP.
        
        Args:
            recipient: Recipient email address
            subject: Email subject line
            html_content: HTML email content
            plain_content: Plain text fallback (optional)
            retry_count: Number of retry attempts on failure
            retry_delay: Delay between retries in seconds
            
        Returns:
            True if email sent successfully, False otherwise
        """
        for attempt in range(retry_count):
            try:
                # Create message
                msg = self._create_message(
                    recipient,
                    subject,
                    html_content,
                    plain_content
                )
                
                # Connect to SMTP server
                server = smtplib.SMTP(self.SMTP_SERVER, self.SMTP_PORT, timeout=30)
                server.starttls()  # Enable TLS encryption
                
                # Login
                server.login(self.username, self.app_password)
                
                # Send email
                server.send_message(msg)
                
                # Close connection
                server.quit()
                
                return True
                
            except smtplib.SMTPAuthenticationError as e:
                raise Exception(
                    f"SMTP Authentication failed: {e}\n"
                    f"Please check your Gmail App Password."
                )
            
            except smtplib.SMTPException as e:
                if attempt < retry_count - 1:
                    print(f"SMTP error (attempt {attempt + 1}/{retry_count}): {e}")
                    time.sleep(retry_delay)
                    continue
                else:
                    raise Exception(f"Failed to send email after {retry_count} attempts: {e}")
            
            except Exception as e:
                if attempt < retry_count - 1:
                    print(f"Error sending email (attempt {attempt + 1}/{retry_count}): {e}")
                    time.sleep(retry_delay)
                    continue
                else:
                    raise Exception(f"Failed to send email: {e}")
        
        return False
    
    def _create_message(
        self,
        recipient: str,
        subject: str,
        html_content: str,
        plain_content: Optional[str] = None
    ) -> MIMEMultipart:
        """
        Create MIME message with HTML and plain text parts.
        
        Args:
            recipient: Recipient email address
            subject: Email subject
            html_content: HTML content
            plain_content: Plain text content (optional)
            
        Returns:
            MIMEMultipart message
        """
        # Create message container
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{self.sender_name} <{self.username}>"
        msg['To'] = recipient
        
        # Add plain text part (if provided)
        if plain_content:
            part1 = MIMEText(plain_content, 'plain', 'utf-8')
            msg.attach(part1)
        
        # Add HTML part
        part2 = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(part2)
        
        return msg
    
    def test_connection(self) -> bool:
        """
        Test SMTP connection and authentication.
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            server = smtplib.SMTP(self.SMTP_SERVER, self.SMTP_PORT, timeout=10)
            server.starttls()
            server.login(self.username, self.app_password)
            server.quit()
            return True
        except smtplib.SMTPAuthenticationError:
            print("❌ Authentication failed. Check your Gmail App Password.")
            return False
        except Exception as e:
            print(f"❌ Connection test failed: {e}")
            return False
    
    def send_test_email(self, recipient: str) -> bool:
        """
        Send a test email to verify setup.
        
        Args:
            recipient: Recipient email address
            
        Returns:
            True if test email sent successfully
        """
        subject = "AI News Agent - Test Email"
        html_content = """
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #667eea;">🤖 AI News Agent Test</h2>
            <p>This is a test email from your AI News Agent.</p>
            <p>If you're seeing this, your email configuration is working correctly!</p>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="color: #666; font-size: 14px;">
                Next steps:
                <ul>
                    <li>Run the agent with <code>--once</code> flag to send a real digest</li>
                    <li>Set up scheduling for daily delivery</li>
                    <li>Customize your preferences in .env file</li>
                </ul>
            </p>
        </body>
        </html>
        """
        plain_content = """
        AI News Agent Test
        
        This is a test email from your AI News Agent.
        If you're seeing this, your email configuration is working correctly!
        
        Next steps:
        - Run the agent with --once flag to send a real digest
        - Set up scheduling for daily delivery
        - Customize your preferences in .env file
        """
        
        try:
            return self.send_email(recipient, subject, html_content, plain_content)
        except Exception as e:
            print(f"❌ Failed to send test email: {e}")
            return False


if __name__ == '__main__':
    # Test Gmail sender
    import os
    from dotenv import load_dotenv
    
    print("Testing Gmail Sender...\n")
    
    # Load environment variables
    load_dotenv()
    
    gmail_user = os.getenv('GMAIL_USER')
    gmail_password = os.getenv('GMAIL_APP_PASSWORD')
    recipient = os.getenv('RECIPIENT_EMAIL')
    
    if not all([gmail_user, gmail_password, recipient]):
        print("❌ Missing environment variables. Please configure .env file:")
        print("   - GMAIL_USER")
        print("   - GMAIL_APP_PASSWORD")
        print("   - RECIPIENT_EMAIL")
        exit(1)
    
    # Create sender
    sender = GmailSender(gmail_user, gmail_password)
    
    # Test connection
    print("Testing SMTP connection...")
    if sender.test_connection():
        print("✅ SMTP connection successful!\n")
        
        # Send test email
        print(f"Sending test email to {recipient}...")
        if sender.send_test_email(recipient):
            print("✅ Test email sent successfully!")
            print(f"\nCheck your inbox at {recipient}")
        else:
            print("❌ Failed to send test email")
    else:
        print("❌ SMTP connection failed")

# Made with Bob
