# Admin Order Settings

Configure global store checkout parameters, default platform processing fees, tax percentage rules, and standard delivery fee structures.

> **View in Application →** [Open Order Settings](/dashboard/admin/order-settings)

![Screenshot placeholder: Admin Order Settings](./images/admin-order-settings.png)
> **Screenshot:** Admin Order Settings page displaying platform processing fee inputs, payment gateway fee settings, tax configuration, and default shipping rates.

## Overview

The Order Settings console lets platform administrators define the financial parameters governing customer checkouts. You can adjust default payment gateway processing fee percentages, configure platform transaction commissions, and manage sitewide tax and delivery defaults.

## What You Can Do

- Set global platform commission rates applied to seller product sales.
- Configure payment gateway processing fee passing rules (e.g., absorbed by platform vs. charged to buyer).
- Define default delivery fee recommendations for physical goods.
- Set GST / sales tax calculation parameters.
- Enable or disable specific payment gateway channels.

## How to Use

### Step 1: Open Order Settings
Navigate to **Admin Panel > Order Settings** (`/dashboard/admin/order-settings`).

### Step 2: Configure Platform Fee & Tax Rates
1. Update the **Platform Commission (%)** (e.g., `5.0%`).
2. Set the **Payment Gateway Processing Fee (%)** (e.g., `2.0%`).
3. Set standard **GST / Tax Percentage** if applicable.

### Step 3: Save Configuration
Click **Save Order Settings** to apply changes globally across all future store checkouts.

## Available Order Settings

| Parameter | Function |
|---|---|
| **Platform Commission (%)** | Percentage fee deducted from gross sales prior to seller payout. |
| **Payment Gateway Fee (%)** | Processing surcharge for Razorpay / payment network transactions. |
| **Default Shipping Fee** | Baseline delivery charge suggested for physical catalog items. |
| **Tax / GST Rate (%)** | Standard tax rate applied during final customer checkout calculation. |

## Related Features

- [Payment Settlement](./payment-settlement) — View settlements calculated based on these fee rules.
- [Orders Management](../../products/orders) — Seller-facing view of customer orders.
