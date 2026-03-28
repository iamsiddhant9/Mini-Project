import time
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.db import connection
from django.conf import settings

class Command(BaseCommand):
    help = 'Send welcome emails to all existing users who may not have received them.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Fetching all existing users from the database...")
        
        try:
            with connection.cursor() as cur:
                cur.execute("SELECT id, email, name FROM users WHERE is_active = TRUE")
                rows = cur.fetchall()
                
            if not rows:
                self.stdout.write(self.style.WARNING("No active users found."))
                return

            self.stdout.write(f"Found {len(rows)} users. Beginning email dispatch...")
            
            success_count = 0
            fail_count = 0
            
            for index, row in enumerate(rows):
                user_id, email, name = row
                
                try:
                    send_mail(
                        subject="Welcome to InternLink! 🎉",
                        message=f"Hi {name},\n\nWelcome to Internlink! We're excited to have you on board.\nMay you have a successful career and a happier life ahead ❤️.\n\nBest regards,\nThe Internlink Team",
                        from_email=getattr(settings, "EMAIL_HOST_USER", "noreply@internlink.com") or "noreply@internlink.com",
                        recipient_list=[email],
                        fail_silently=False,
                    )
                    success_count += 1
                    self.stdout.write(self.style.SUCCESS(f"[{index+1}/{len(rows)}] Sent to {email}"))
                except Exception as e:
                    fail_count += 1
                    self.stdout.write(self.style.ERROR(f"[{index+1}/{len(rows)}] Failed to send to {email}: {e}"))
                
                # Small sleep to prevent rate limiting from SMTP servers
                time.sleep(1)

            self.stdout.write(self.style.SUCCESS(f"Finished! Successfully sent: {success_count}, Failed: {fail_count}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"A database error occurred: {e}"))
