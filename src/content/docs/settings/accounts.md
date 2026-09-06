# Connected Accounts & Security

Manage your connected Instagram Business accounts, link Google or Email authentication credentials, and configure account security settings.

> **View in Application →** [Open Connected Accounts](/dashboard/settings/accounts)

![Screenshot placeholder: Connected Accounts Dashboard](./images/settings-accounts.png)
> **Screenshot:** Connected Accounts page showing connected Instagram profiles, Facebook Page bindings, Google SSO linking status, and account security controls.

## Overview

AnyDM connects directly to Instagram and Facebook via the official Meta Graph API. In the Connected Accounts settings, you can link multiple Instagram Business or Creator accounts, switch active accounts, renew expiring access tokens, and link authentication providers for seamless login.

## What You Can Do

- Connect and disconnect Instagram Professional (Business or Creator) accounts.
- View connected Instagram handle, follower count, profile avatar, and Facebook Page name.
- Switch the active Instagram account for your current AnyDM session.
- Re-authenticate or refresh Meta access tokens to ensure uninterrupted webhooks.
- Link or unlink Google SSO and Email/Password credentials for flexible login.
- Review account security details and active sessions.

## How to Use

### Step 1: Connect an Instagram Account
1. Navigate to **Settings > Manage Accounts**.
2. Click **+ Connect Instagram Account**.
3. You will be redirected to the secure Meta OAuth authorization dialog.
4. Select the Facebook Page and Instagram Professional Account you wish to manage with AnyDM.
5. Grant required permissions (Messaging, Comments, Insights) and confirm.
6. Once redirected back, your connected Instagram profile will appear in your account list.

### Step 2: Switch Active Account
- If managing multiple creator profiles, click **Switch Active** on the account card you wish to manage. The entire dashboard, inbox, and automation flows will update to reflect that account.

### Step 3: Link Login Providers
- Under **Authentication Providers**, click **Link with Google** to enable single-click Google Sign-In on your existing AnyDM workspace.

## Available Account Options & Statuses

| Option / Status | Meaning |
|---|---|
| **Active Instagram Account** | The currently selected profile receiving webhooks and sending automated replies. |
| **Meta Token Health** | Real-time status of your API authorization token (`Valid`, `Expiring Soon`, or `Needs Reconnection`). |
| **Facebook Page Binding** | The official Facebook Page linked to your Instagram professional account. |
| **Google Authentication** | Status of connected Google SSO account for passwordless sign-in. |
| **Disconnect Account** | Safely removes the Instagram account authorization from AnyDM. |

## Related Features

- [Dashboard Overview](../../dashboard) — Check hourly rate limits and API health for your active account.
- [Automations Catalog](../../automations/catalog) — Manage automation flows running on your active account.
- [Workspace Settings](./workspace) — Configure workspace profile and team attributes.
