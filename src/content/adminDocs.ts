export const adminSystemDocsMarkdown = `# AnyDM System Documentation: Plans, Points & Creator Programs

This document outlines the architecture, rules, lifecycle, and administrative parameters of the AnyDM platform.

---

## 1. Membership Plans & Features

AnyDM operates on a **Freemium + Pro Subscription** model.

### 🌟 Plan Comparison Matrix

| Feature / Capability | Free / Trial Tier | Pro Member Tier (₹499/mo) | Creator VIP Pro |
| :--- | :--- | :--- | :--- |
| **Direct Message Automation** | Active (Standard Limit) | Unlimited Fast Triggers | Unlimited Fast Triggers |
| **Keyword & Story Triggers** | ✅ Included | ✅ Included | ✅ Included |
| **Catalog & Product Cards** | Up to 3 Products | Unlimited Products | Unlimited Products |
| **Order Automation & KYC** | Standard | Priority Processing | Priority Processing |
| **AI Smart Autopilot** | Custom API Key required | Included via Master Key | Included via Master Key |
| **Duration / Validity** | Default 14 Days | Monthly / Annual Recurring | Configurable (1–24 Mos) |
| **Cost** | ₹0 | Configurable (Default: ₹499) | ₹0 (Sponsored) |

---

## 2. Point Economy & Reward System

Points incentivize viral platform growth through peer invites and social engagement.

\`\`\`
       [ New User Signs Up ]
                 │
   ┌─────────────┴─────────────┐
   ▼                           ▼
Follow @anydm.in       Invited by Referral Code
(+50 pts once)                 │
                               ▼
                    Referrer receives:
                    • Normal User: +50 pts
                    • Active VIP Creator: +0 pts (Free Pro active)
                    • Active Comm. Creator: +0 pts (Commission active)
                    • Expired Program: +50 pts (Standard fallback)
\`\`\`

### 🪙 Point Rules & Values
1. **Referral Invite Points (\`referral_points\`)**:
   - Default: \`50 pts\` per registered user using a referral link or code.
2. **Social Follow Reward (\`official_follow_points\`)**:
   - Default: \`50 pts\` awarded once upon following the official Instagram \`@anydm.in\`.
3. **Points Redemption (\`points_to_redeem\`)**:
   - Default: \`100 pts = 1 Month of Pro Access\` extension.
4. **Trial Extension (\`extend_days\`)**:
   - Default: \`7 Days\` extension on user manual request.

---

## 3. Creator & Affiliate Programs

AnyDM provides two distinct partner models tailored for influencers and community builders.

---

### 🎁 Model A: Creator VIP Free Pro
Designed for content creators and brand ambassadors who prefer **full platform access with zero subscription fees**.

* **Core Benefits**:
  - 100% Free Pro Tier membership for the designated term.
  - Extended initial trial duration for referred community members (Default: \`15 Days\`).
* **Conversion Reward**:
  - Creator earns **+20 points** (Default: \`creator_vip_points_per_paid_sub\`) whenever an invitee upgrades to a paid plan.
* **Point Redemption Ceiling**:
  - Up to \`5 Months\` maximum pro redemption allowed from bonus conversion points.
* **Term & Expiration**:
  - Global Default: \`3 Months\` (Customizable per user: 1, 3, 6, 12, 24 months or exact calendar date).
  - When expired: Pro access lapses and standard referral points resume for new referrals.

---

### 💰 Model B: Commission Earnings Partner
Designed for affiliates, marketing agencies, and high-volume promoters earning **cash payouts**.

* **Core Benefits**:
  - Real-time revenue share on all successful subscription payments made by invitees.
* **Commission Rate (\`creator_commission_percent\`)**:
  - Default: \`10.0%\` of invoice amount per paid conversion.
* **No Dual-Dipping Rule**:
  - While active, the creator **does not receive referral points** for signup or payment events. All rewards are cash commissions.
* **Payout & Settlements**:
  - Minimum Payout Threshold (\`creator_min_payout_amount\`) : \`₹500.00\`
  - Settlement Cycle (\`creator_payout_cycle_days\`): \`30 Days\` (Monthly reconciliation).
* **Term & Expiration**:
  - Global Default: \`6 Months\` (Customizable per user).
  - When expired: Commission generation halts on subsequent payments; creator reverts to standard referral points.

---

## 4. Lifecycle & Program State Transitions

| Creator Program State | Free Pro Status | Signup Referral Reward | Paid Conversion Reward |
| :--- | :--- | :--- | :--- |
| **VIP Pro Active** | ✅ Active Free Pro | 🚫 0 pts | 🎁 +20 pts (VIP sub bonus) |
| **VIP Pro Expired** | ❌ Expired (Reverts to Free) | 🪙 +50 pts (Standard) | 🚫 0 pts (Standard model) |
| **Commission Active** | ❌ Standard Paid User | 🚫 0 pts | 💰 10% Cash Commission |
| **Commission Expired**| ❌ Standard Paid User | 🪙 +50 pts (Standard) | 🚫 0 pts (Standard model) |
| **Standard User** | Standard Plan | 🪙 +50 pts (Standard) | 🚫 0 pts |

---

## 5. Master AI Autopilot Architecture

* **Global AI Toggle (\`enable_ai\`)**: Platform-wide kill-switch for automated replies and LLM triggers.
* **Subscription AI Master Key (\`enable_subscription_ai\`)**:
  - When \`ON\`: Pro subscribers utilize the platform master Google Gemini key seamlessly.
  - When \`OFF\`: Users must supply their own Gemini API key in their account settings.
* **Master Token (\`business_gemini_api_key\`)**: The system-level token used to process bot interactions.

---

## 6. Admin Navigation & Management Shortcuts

* **Global Settings**: Configure platform constants, point costs, pricing, and master keys at \`/dashboard/admin\`.
* **User VIP Management**: Grant and manage partner terms with date pickers at \`/dashboard/admin/users\`.
* **Payout Settlements**: Review pending commissions and execute creator payouts at \`/dashboard/admin/payment-settlement\`.
* **KYC Approvals**: Inspect banking & tax details for cash withdrawals at \`/dashboard/admin/verify-kyc\`.
`;
