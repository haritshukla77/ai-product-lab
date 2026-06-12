#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test SMTP connection and send a test email.
"""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from config import load_config
from sender.gmail_sender import GmailSender


def main():
    print("Testing Gmail SMTP Connection")
    print("="*60 + "\n")
    
    try:
        # Load configuration
        print("Loading configuration...")
        config = load_config()
        print("[OK] Configuration loaded")
        print(f"   Gmail User: {config.email.gmail_user}")
        print(f"   Recipient: {config.email.recipient_email}\n")
        
        # Create sender
        sender = GmailSender(
            config.email.gmail_user,
            config.email.gmail_app_password,
            config.email.sender_name
        )
        
        # Test connection
        print("Testing SMTP connection...")
        if sender.test_connection():
            print("[OK] SMTP connection successful!\n")
            
            # Ask to send test email
            response = input("Send test email? (y/n): ").lower()
            if response == 'y':
                print(f"\nSending test email to {config.email.recipient_email}...")
                if sender.send_test_email(config.email.recipient_email):
                    print("[OK] Test email sent successfully!")
                    print(f"\nCheck your inbox at {config.email.recipient_email}")
                else:
                    print("[ERROR] Failed to send test email")
                    sys.exit(1)
        else:
            print("[ERROR] SMTP connection failed")
            print("\nTroubleshooting:")
            print("1. Check your Gmail App Password in .env file")
            print("2. Ensure 2-Factor Authentication is enabled")
            print("3. Verify GMAIL_USER and GMAIL_APP_PASSWORD are correct")
            sys.exit(1)
    
    except FileNotFoundError as e:
        print(f"[ERROR] {e}")
        print("\nPlease create .env file from .env.example and configure it.")
        sys.exit(1)
    
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()

# Made with Bob
