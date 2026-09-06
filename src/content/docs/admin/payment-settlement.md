# Admin Payment Settlement

Process seller payout transfers, review creator withdrawal requests, monitor transaction fees, and log bank settlement disbursements.

> **View in Application →** [Open Payment Settlement](/dashboard/admin/payment-settlement)

![Screenshot placeholder: Admin Payment Settlement Dashboard](./images/admin-payment-settlement.png)
> **Screenshot:** Payment Settlement dashboard displaying pending payout requests table, disbursement amounts, bank IFSC routing, batch settlement trigger, and transaction status chips.

## Overview

The Payment Settlement console handles the disbursement of funds from platform escrow to sellers and affiliate creators. Administrators can review pending payouts, confirm seller KYC compliance, initiate batch transfers, and mark transactions as completed.

## What You Can Do

- View all pending seller earnings and creator affiliate payout requests.
- Verify seller KYC verification status and bank details prior to disbursement.
- Filter payouts by status (`Pending`, `Processing`, `Completed`, `Failed`).
- Execute individual or batch payout transfers via bank integration or manual NEFT/IMPS entry.
- Export payout settlement logs for financial auditing.

## How to Use

### Step 1: Open Payment Settlement
Navigate to **Admin Panel > Payment Settlement** (`/dashboard/admin/payment-settlement`).

### Step 2: Inspect Pending Payouts
1. Review the list of requested withdrawals.
2. Confirm the seller's KYC status is marked `APPROVED`.
3. Check gross sales amount, platform commission deductions, and net payout payable.

### Step 3: Process Transfer
1. Initiate the bank transfer using the listed bank account and IFSC.
2. Enter the bank transaction reference number (UTR).
3. Click **Mark as Settled**. The seller's pending balance will update to cleared.

## Settlement Data Fields

| Field | Meaning |
|---|---|
| **Seller / Creator** | Account name and email of the payee. |
| **Gross Sales / Commission** | Total earnings before platform fees. |
| **Net Payable Amount** | Exact monetary sum to be transferred to the seller. |
| **Bank Account & IFSC** | Receiving bank destination information. |
| **UTR / Reference No.** | Bank transaction reference tracking code entered upon completion. |
| **Settlement Status** | `PENDING`, `PROCESSING`, `SETTLED`, or `REJECTED`. |

## Related Features

- [Verify KYC Queue](./verify-kyc) — Ensure sellers are verified before settling funds.
- [Creator Hub](../../creator) — User portal where creators submit withdrawal requests.
- [Order Settings](./order-settings) — Configure platform commission rates.
