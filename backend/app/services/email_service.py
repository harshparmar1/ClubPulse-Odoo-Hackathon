import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings

logger = logging.getLogger("clubpulse.email")

class EmailService:
    @staticmethod
    def send_otp_email(to_email: str, otp: str, student_name: str = "Student") -> bool:
        """
        Sends registration verification OTP via Gmail SMTP.
        """
        smtp_host = settings.SMTP_HOST
        smtp_port = settings.SMTP_PORT
        sender_email = settings.SMTP_EMAIL
        sender_password = settings.SMTP_PASSWORD.replace(" ", "")

        subject = f"{otp} is your Skyline Verification Code"

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F7F8FC; margin: 0; padding: 24px; color: #171A2B; }}
            .container {{ max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #E7E9F1; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
            .brand {{ display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }}
            .logo-text {{ font-size: 20px; font-weight: 800; color: #625BF6; }}
            .title {{ font-size: 18px; font-weight: 700; color: #171A2B; margin-bottom: 12px; }}
            .desc {{ font-size: 13px; line-height: 1.6; color: #687086; margin-bottom: 24px; }}
            .otp-box {{ background: #F3F4FD; border: 2px dashed #625BF6; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px; }}
            .otp-code {{ font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #625BF6; font-family: monospace; }}
            .expiry {{ font-size: 11px; color: #8F95B2; margin-top: 6px; }}
            .footer {{ font-size: 11px; color: #8F95B2; text-align: center; border-top: 1px solid #E7E9F1; pt: 16px; margin-top: 24px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">
              <span class="logo-text">Skyline Organization</span>
            </div>
            <div class="title">Verify Your Student Registration</div>
            <p class="desc">
              Hello {student_name},<br>
              Thank you for registering on the Skyline Campus Intelligence Platform. Use the one-time verification code below to verify your email and activate your account:
            </p>
            <div class="otp-box">
              <div class="otp-code">{otp}</div>
              <div class="expiry">Valid for 10 minutes. Do not share this code with anyone.</div>
            </div>
            <p class="desc" style="font-size: 12px; margin-bottom: 0;">
              If you did not request this verification code, you can safely ignore this email.
            </p>
            <div class="footer">
              Skyline Student Organization Intelligence Platform &copy; 2026
            </div>
          </div>
        </body>
        </html>
        """

        text_body = f"""Skyline Student Organization Intelligence
Verify Your Student Registration

Hello {student_name},
Your verification code is: {otp}

This code is valid for 10 minutes. Do not share this code with anyone.

If you did not request this, you can ignore this email.
"""

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"Skyline Platform <{sender_email}>"
            msg["To"] = to_email

            part1 = MIMEText(text_body, "plain")
            part2 = MIMEText(html_body, "html")
            msg.attach(part1)
            msg.attach(part2)

            server = smtplib.SMTP(smtp_host, smtp_port, timeout=12)
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, [to_email], msg.as_string())
            server.quit()
            logger.info(f"Verification OTP email sent to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send OTP email to {to_email}: {e}")
            # Also log clearly in console for easy development testing
            print(f"[OTP-FALLBACK] OTP for {to_email} is {otp}. (SMTP error: {e})")
            return False
