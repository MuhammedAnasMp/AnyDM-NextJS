# Admin Reference Specification

Comprehensive technical specification for membership plans, point rewards, VIP Free Pro lifecycle, affiliate commission economics, and automated settlement rules.

> **View in Application →** [Open Admin Reference Docs](/dashboard/admin/docs)

![Screenshot placeholder: Admin Reference Spec](./images/admin-docs-spec.png)
> **Screenshot:** Admin Reference Documentation view displaying system architecture diagrams, token rules, affiliate lifecycle formulas, and raw markdown export controls.

## Overview

This specification documents the platform mechanics, membership models, reward calculations, and financial workflows that govern the AnyDM operating system. It acts as the definitive reference manual for administrators and support leads.

## What You Can Do

- Review complete specifications for Free Trial, Creator Pro, and VIP Pro membership tiers.
- Inspect exact point distribution algorithms for user referrals and social follow actions.
- Review mathematical formulas for affiliate commission splits and minimum payout thresholds.
- Copy the raw markdown specification to your clipboard for external reference or compliance audits.
- Jump directly into Admin Settings to adjust these parameters.

## System Architecture & Model Specifications

### 1. Membership Plan Models

| Plan Tier | Pricing | DM Automations | Master AI Access | Duration |
|---|---|---|---|---|
| **Free / Trial Tier** | ₹0 | Standard rate limits (200 DMs/hr) | Custom API key required | 14 Days default |
| **Creator Pro Tier** | ₹499 / mo | Unlimited fast triggers | Built-in Master AI token | Monthly / Annual |
| **Creator VIP Pro** | ₹0 (Sponsored) | Unlimited fast triggers | Built-in Master AI token | 1–24 Months configurable |

### 2. Point Economy Rules

- **Referral Inbound**: When an existing user's referral code is used during signup, the referrer receives **+50 Points**.
- **Social Follow Task**: Following `@anydm.in` on Instagram awards **+10 Points** once per account upon automated verification.
- **Redemption**: **100 Points = 30 Days Free Pro Subscription Extension**.

### 3. VIP Creator Affiliate Economics

- **Commission Split**: Approved VIP creators earn **10.0% recurring revenue share** on all paid subscription checkouts generated through their affiliate tracking code.
- **Minimum Withdrawal**: Payout requests require a minimum cleared balance of **₹500**.
- **Compliance Lock**: All payouts strictly require an **APPROVED** Seller KYC document status.

## How to Export

1. Open **Admin Reference Docs** (`/dashboard/admin/docs`).
2. Click the **Copy Raw .MD** button in the header.
3. The complete system specification markdown is copied to your clipboard.

## Related Features

- [Admin Overview](./overview) — Modify global system pricing and points.
- [Verify KYC Queue](./verify-kyc) — Manage seller document verification.
- [Payment Settlement](./payment-settlement) — Execute seller and creator bank payouts.
