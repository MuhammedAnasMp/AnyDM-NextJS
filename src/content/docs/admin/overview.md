# Admin Overview & System Settings

The Admin Panel is the control center for system administrators and staff to configure platform pricing, manage point reward economics, grant VIP Pro subscriptions, and monitor platform health.

> **View in Application →** [Open Admin Panel](/dashboard/admin)

![Screenshot placeholder: Admin Panel Overview](./images/admin-overview.png)
> **Screenshot:** Admin Panel dashboard displaying global platform metrics, plan pricing config cards, point reward rules, VIP Pro grant tools, and affiliate percentage settings.

## Overview

The Admin Overview provides platform-wide control over AnyDM operations. Only authenticated users with superuser or staff permissions can access this section. Administrators can adjust subscription prices, modify referral point reward formulas, manage affiliate commission splits, and oversee user lifecycles.

> [!IMPORTANT]
> The Admin Panel is strictly restricted to platform administrators and staff members.

## What You Can Do

- View sitewide active creators, total processed DMs, gross platform revenue, and pending KYC applications.
- Configure global subscription plan pricing (Creator Pro monthly/annual costs).
- Manage Point Economy rules (e.g., points awarded per referral signup, point redemption exchange rates).
- Grant sponsored VIP Free Pro access to designated creator accounts.
- Configure default affiliate commission percentages (e.g., 10.0% revenue share).
- Access administrative sub-queues: User Management, Verify KYC, Payment Settlements, and Order Settings.

## How to Use

### Step 1: Access the Admin Panel
Navigate to **Admin Panel** at the bottom of the main sidebar.

### Step 2: Configure Subscription & Plan Parameters
1. In the **Plan & Pricing Settings** card, adjust the standard monthly subscription cost for Creator Pro.
2. Click **Save Pricing Config**.

### Step 3: Configure Referral Point Rules
1. In the **Point Economy Rules** section, define how many points are awarded for peer referrals and social follow actions.
2. Set the redemption exchange rate (default: 100 points = 1 Month Pro Extension).
3. Click **Update Point Rules**.

### Step 4: Grant VIP Creator Pro
1. Under **VIP Free Pro Grant**, search for a creator's email or username.
2. Select the validity duration (e.g., 3 months, 6 months, 12 months).
3. Click **Grant VIP Access**.

## Available Admin Controls & System Parameters

| Parameter | Description |
|---|---|
| **Pro Monthly Price** | Global price charged for monthly Creator Pro subscriptions (Default: ₹499). |
| **Referral Signup Points** | Points credited to a user when a referred friend joins (Default: 50 pts). |
| **Pro Extension Cost** | Points required to redeem 1 month of Free Pro (Default: 100 pts). |
| **VIP Affiliate Split** | Percentage revenue share paid to VIP creators on subscription checkouts (Default: 10.0%). |
| **Minimum Payout** | Minimum accumulated creator balance required to submit a bank withdrawal (Default: ₹500). |
| **Superuser Privileges** | System access controls for user management, KYC approvals, and financial payouts. |

## Related Features

- [User Management](./users) — Inspect and manage registered users, points, and permissions.
- [Verify KYC Queue](./verify-kyc) — Review seller identity documents.
- [Payment Settlement](./payment-settlement) — Process seller and affiliate bank payouts.
- [Admin Reference Spec](./spec) — Full architectural documentation on membership rules and token economics.
