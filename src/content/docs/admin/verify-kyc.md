# Admin Verify KYC Queue

Review submitted Seller KYC applications, verify PAN and bank document details, and approve or reject seller payout capabilities.

> **View in Application →** [Open Verify KYC Queue](/dashboard/admin/verify-kyc)

![Screenshot placeholder: Admin KYC Verification Queue](./images/admin-verify-kyc.png)
> **Screenshot:** Admin KYC verification queue showing pending verification cards, applicant PAN and Aadhaar records, bank details, approve button, and rejection dialog.

## Overview

The Verify KYC Queue ensures regulatory compliance by allowing administrators to review seller tax identifiers and bank account information. Approving a KYC application unlocks automated payout settlements and creator withdrawals for that seller.

## What You Can Do

- View all pending, approved, and rejected KYC applications.
- Inspect applicant full names, PAN numbers, Aadhaar numbers, and bank account/IFSC data.
- Validate matching details against tax and banking records.
- Approve verified applications with a single click.
- Reject non-compliant or mismatched applications with specific feedback reasons for the user.

## How to Use

### Step 1: Filter Pending Applications
1. Open **Admin Panel > Verify KYC** (`/dashboard/admin/verify-kyc`).
2. Select the **Pending Review** filter tab to inspect newly submitted applications.

### Step 2: Review Submitted Data
1. Review the legal name against the provided PAN and Aadhaar numbers.
2. Confirm the bank account number format and IFSC branch code.

### Step 3: Approve or Reject
- **To Approve**: Click **Approve KYC**. The user's status updates immediately to `APPROVED`, enabling their payout settlements.
- **To Reject**: Click **Reject**, enter the specific rejection reason (e.g., *"PAN name does not match bank account holder name"*), and confirm. The user will receive instructions to resubmit.

## KYC Verification Fields

| Field | Check Requirement |
|---|---|
| **Applicant Name** | Must match PAN card and official bank account holder records. |
| **PAN Number** | 10-character alphanumeric Indian tax identifier. |
| **Aadhaar Number** | 12-digit Indian national identity number. |
| **Bank Account & IFSC** | Valid receiving bank account number and branch routing code. |
| **Review Actions** | `Approve` (Grants payout capabilities) or `Reject` (With feedback reason). |

## Related Features

- [Seller KYC Settings](../../settings/kyc) — The user-facing KYC submission form.
- [Payment Settlement](./payment-settlement) — Process bank payouts for approved sellers.
