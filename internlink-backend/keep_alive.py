"""
Keep-Alive Script for Render Free Tier
---------------------------------------
Run this script locally while developing to prevent the Render backend
from spinning down due to inactivity.

Usage:
    python keep_alive.py

RECOMMENDED: Use a free external service instead so you don't need to
keep your computer running:
  1. Go to https://cron-job.org (free account)
  2. Create a new cron job
  3. Set URL to: https://<your-render-url>/
  4. Set schedule to: every 10 minutes
  5. Done! Your backend will never sleep.
"""

import time
import urllib.request

import os

# ── CONFIGURATION ──────────────────────────────────────────────────────────────
# Automatically uses Render's assigned URL in production, or localhost locally.
BACKEND_URL = os.environ.get("RENDER_EXTERNAL_URL", "http://localhost:8000/") + "api/health/"
PING_INTERVAL_SECONDS = 600  # 10 minutes — Render sleeps after 15 min
# ───────────────────────────────────────────────────────────────────────────────


def ping():
    try:
        with urllib.request.urlopen(BACKEND_URL, timeout=10) as resp:
            print(f"[{time.strftime('%H:%M:%S')}] Ping OK — status {resp.status}")
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] Ping FAILED — {e}")


if __name__ == "__main__":
    # Wait 20 seconds initially to allow Gunicorn to fully spin up
    time.sleep(20)
    print(f"Keep-alive started. Pinging {BACKEND_URL} every {PING_INTERVAL_SECONDS // 60} minutes.")
    while True:
        ping()
        time.sleep(PING_INTERVAL_SECONDS)
