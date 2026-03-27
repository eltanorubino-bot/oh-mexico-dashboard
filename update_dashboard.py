#!/usr/bin/env python3
"""
Oh! Mexico Dashboard — Daily Data Updater
==========================================
Fetches Instagram metrics via the Graph API and updates index.html.

Required environment variables:
  INSTAGRAM_ACCESS_TOKEN  — Long-lived token from Facebook Developer portal
  INSTAGRAM_BUSINESS_ID   — The IG Business/Creator account ID

When no token is set the script exits silently (keeps demo data).
"""

import json, os, re, sys, urllib.request, urllib.error
from datetime import datetime, timedelta

TOKEN = os.environ.get("INSTAGRAM_ACCESS_TOKEN", "")
IG_ID = os.environ.get("INSTAGRAM_BUSINESS_ID", "")
HTML_FILE = os.path.join(os.path.dirname(__file__), "index.html")


# ── Instagram Graph API helpers ──────────────────────────────────────

def ig_get(endpoint, params=None):
    """GET request to the Instagram Graph API."""
    base = f"https://graph.facebook.com/v19.0/{endpoint}"
    p = {"access_token": TOKEN}
    if params:
        p.update(params)
    qs = "&".join(f"{k}={v}" for k, v in p.items())
    url = f"{base}?{qs}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def fetch_account_info():
    """Basic account info: followers, media count, name."""
    data = ig_get(IG_ID, {
        "fields": "followers_count,media_count,username,name,biography,profile_picture_url"
    })
    return data


def fetch_account_insights(period="day", days=30):
    """Account-level insights: impressions, reach, profile_views."""
    since = int((datetime.utcnow() - timedelta(days=days)).timestamp())
    until = int(datetime.utcnow().timestamp())
    data = ig_get(f"{IG_ID}/insights", {
        "metric": "impressions,reach,profile_views,follower_count",
        "period": period,
        "since": since,
        "until": until,
    })
    return data.get("data", [])


def fetch_recent_media(limit=25):
    """Fetch recent media with engagement metrics."""
    data = ig_get(f"{IG_ID}/media", {
        "fields": "id,caption,timestamp,media_type,like_count,comments_count,"
                  "impressions,reach,saved,shares,permalink,thumbnail_url,media_url",
        "limit": limit,
    })
    return data.get("data", [])


def compute_metrics(account, insights, media):
    """Crunch API responses into dashboard-friendly numbers."""
    followers = account.get("followers_count", 0)

    # Engagement rate = avg(likes+comments) / followers * 100
    total_eng = sum(m.get("like_count", 0) + m.get("comments_count", 0) for m in media)
    eng_rate = round((total_eng / max(len(media), 1)) / max(followers, 1) * 100, 1)

    # Monthly reach from insights
    reach_values = []
    for metric in insights:
        if metric["name"] == "reach":
            for v in metric.get("values", []):
                reach_values.append(v.get("value", 0))
    monthly_reach = sum(reach_values)

    # Best performer
    best = max(media, key=lambda m: m.get("like_count", 0) + m.get("comments_count", 0),
               default={})
    best_eng = best.get("like_count", 0) + best.get("comments_count", 0)

    # Follower growth data (last 6 months)
    follower_series = []
    for metric in insights:
        if metric["name"] == "follower_count":
            for v in metric.get("values", []):
                follower_series.append(v.get("value", 0))

    # Engagement by day of week
    day_eng = {i: [] for i in range(7)}
    for m in media:
        ts = m.get("timestamp", "")
        if ts:
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            eng = m.get("like_count", 0) + m.get("comments_count", 0)
            day_eng[dt.weekday()].append(eng)
    avg_day_eng = {}
    day_names = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    for i, name in enumerate(day_names):
        vals = day_eng[i]
        avg_day_eng[name] = round(sum(vals) / max(len(vals), 1))

    # Reach & impressions weekly
    impressions_values = []
    for metric in insights:
        if metric["name"] == "impressions":
            for v in metric.get("values", []):
                impressions_values.append(v.get("value", 0))

    return {
        "followers": followers,
        "engagement_rate": eng_rate,
        "monthly_reach": monthly_reach,
        "best_performer_eng": best_eng,
        "best_performer_type": best.get("media_type", "IMAGE"),
        "follower_series": follower_series[-6:] if follower_series else [],
        "day_engagement": avg_day_eng,
        "impressions_series": impressions_values[-4:] if impressions_values else [],
        "reach_series": reach_values[-4:] if reach_values else [],
        "last_updated": datetime.utcnow().strftime("%b %Y"),
    }


# ── HTML updater ─────────────────────────────────────────────

def format_number(n):
    """20100 -> '20,100' or '20.1K'."""
    if n >= 1_000_000:
        return f"{n/1_000_000:.1f}M"
    if n >= 10_000:
        return f"{n/1_000:.1f}K"
    return f"{n:,}"


def update_html(metrics):
    """Replace hardcoded data in index.html with live metrics."""
    with open(HTML_FILE, "r", encoding="utf-8") as f:
        html = f.read()

    # Update KPI cards
    html = re.sub(
        r"(followers:\s*)\d[\d,]*",
        f"\\g<1>{metrics['followers']:,}",
        html, count=1
    )
    html = re.sub(
        r"(engagementRate:\s*['"]?)\d+\.?\d*(%?)",
        f"\\g<1>{metrics['engagement_rate']}\\2",
        html, count=1
    )
    html = re.sub(
        r"(monthlyReach:\s*)\d[\d,]*",
        f"\\g<1>{metrics['monthly_reach']}",
        html, count=1
    )

    # Update follower growth series
    if metrics["follower_series"]:
        series_str = json.dumps(metrics["follower_series"])
        html = re.sub(
            r"(followerGrowth:\s*\[)[^\]]+(])",
            f"\\g<1>{series_str[1:-1]}\\2",
            html, count=1
        )

    # Update day engagement
    if metrics["day_engagement"]:
        for day_name, value in metrics["day_engagement"].items():
            pattern = rf"(\{{\s*day:\s*['"]" + re.escape(day_name) + rf"['"],\s*\w+:\s*)\d+"
            html = re.sub(pattern, f"\\g<1>{value}", html)

    # Update timestamp
    html = re.sub(
        r"Last updated:\s*\w+ \d{4}",
        f"Last updated: {metrics['last_updated']}",
        html
    )

    # Remove Demo Mode flag when real data is active
    html = html.replace('"Demo Mode"', '"Instagram Graph API"')

    with open(HTML_FILE, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"Dashboard updated: {metrics['followers']:,} followers, "
          f"{metrics['engagement_rate']}% engagement, "
          f"reach {format_number(metrics['monthly_reach'])}")


# ── Main ───────────────────────────────────────────────────

def main():
    if not TOKEN or not IG_ID:
        print("No INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_BUSINESS_ID set.")
        print("Dashboard stays in Demo Mode. Add secrets to enable live data.")
        sys.exit(0)

    try:
        print("Fetching Instagram data...")
        account = fetch_account_info()
        insights = fetch_account_insights()
        media = fetch_recent_media()

        metrics = compute_metrics(account, insights, media)
        update_html(metrics)

    except urllib.error.HTTPError as e:
        print(f"Instagram API error: {e.code}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
