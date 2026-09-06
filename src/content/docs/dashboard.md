# Dashboard Overview

The Dashboard Overview is your central command center for real-time account safety monitoring, Instagram API rate limits, interaction metrics, and automated sales conversion funnels.

> **View in Application →** [Open Dashboard](/dashboard)

![Screenshot placeholder: Dashboard Overview](./images/dashboard-overview.png)
> **Screenshot:** Dashboard overview showing KPI summary cards, rate limit health indicators, live activity stream, and conversion funnel.

## Overview

The Dashboard provides creators and businesses with instant visibility into how their Instagram automation is operating. It tracks outbound direct messages, revenue generated from automated customer checkouts, active reply flows, and account safety health in real time.

## What You Can Do

- Monitor overall business performance through 30-day KPI cards.
- Track Instagram API rate limits to prevent account throttling or bans.
- Inspect real-time live activity feeds of automated customer conversations and replies.
- Analyze sales conversion progression across Impression, Engagement, DM Started, and Conversion stages.
- Review engagement summary metrics including response speed and DM open rate.
- Manually refresh live telemetry data at any moment.

## How to Use

### Step 1: Check Account Safety Status
At the top of the dashboard, review the **Instagram Account Safety & Health** panel. Ensure the badge indicates `Account Safe`. Check your hourly DM quota bar and daily publish post limits before launching major marketing campaigns.

### Step 2: Track Business KPIs
Review the top metric strip for:
- **Active Automations**: Total running rules and flows.
- **Messages Sent (30d)**: Total direct messages dispatched to customers.
- **Total Revenue (30d)**: Value of completed customer purchases originating from DMs and storefront.
- **New Customers Reached**: Total unique leads engaged.

### Step 3: Monitor Live Customer Interactions
Scroll through the **Activity Feed** to view inbound queries, keyword triggers, and bot responses with timestamps and agent tags. Use the pagination controls at the bottom of the feed to inspect older activity history.

### Step 4: Evaluate the Conversion Funnel
Check the right-side **Conversion Funnel** to see drop-off rates between impressions, chat interactions, DM conversations, and final checkouts.

## Available Options & Metrics

| Metric / Control | Description |
|---|---|
| **Refresh Button** | Instantly re-fetches latest telemetry, rate limits, and analytics from the server. |
| **Hourly DM Quota** | Live progress bar of hourly DMs sent vs. Instagram API limit (default 200/hr) with remaining count. |
| **Meta API Capacity** | Percentage of API capacity utilized with countdown timer to the next reset window. |
| **24h Post Slots** | Daily publishing quota used and remaining slots available for posts and reels. |
| **Health Status Badge** | Color-coded status (`SAFE`, `MODERATE`, `WARNING`, or `THROTTLED`). |
| **Activity Pagination** | Navigate through pages of customer interactions and automated reply logs. |
| **Avg Response Speed** | Average response latency for automated DM and comment replies. |
| **DM Open Rate** | Percentage of dispatched direct messages opened and read by customers. |

## Related Features

- [Automations Catalog](../automations/catalog) — Manage the automation rules that generate dashboard activity.
- [Instagram Post Scheduler](../schedule) — Schedule posts and reels within your daily limits.
- [Unified DM Inbox](../inbox/chat) — Jump into live customer conversations triggered on the dashboard.
