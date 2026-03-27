This is a vital update. Integrating the official "NS Foundation Policy" adds necessary legal and structural constraints—such as the specific 5-year term, the "NS 12 Batch" restriction, and the 3-month default rule. 

Since you intend to sell this as a product, these rules will now be treated as **"Default Policy Templates"** that a client can toggle or edit in the settings.

---

## 🏛️ NS Foundation: Final Integrated System Requirements

### 1. 📅 Lifecycle & Membership Logic
* **Fixed-Term Tracking:** System follows a 5-year lifecycle (**Jan 1, 2024 – Dec 31, 2028**). The dashboard should show a "Days Remaining" or "Cycle Progress" bar.
* **Batch-Restricted Registration:** A field for "Batch/Identity" (default: NS 12) during signup.
* **Share Purchase Window:** * Members can buy shares freely until **Dec 31, 2024**. 
    * After this date, the "Buy Shares" button is disabled unless the Admin manually re-assigns shares from a member who left (Rule 8).
* **Special Admission:** If a member joins after **Jan 31, 2024**, the system must calculate a "Catch-up Amount" (all previous months' fees) before they are verified.

### 2. 💸 Dynamic Payment & Penalty Engine
* **Share Price:** 500 BDT (Editable in Settings).
* **Monthly Window:** Jan–Dec. Deadline is the **15th**.
* **Automated Penalty:** If `paymentDate > 15th`, apply **20 BDT per share** (not a flat fee, but per share).
* **Transaction Charges:** * **Mobile Banking:** UI must remind users to include "Cashout Charges."
    * **Bank Transfer:** UI must remind users to ensure the "Net Amount" received is exactly 500 BDT/share.
* **Advance Payments:** Members can pay for future months; the system must prioritize clearing "Dues" before applying "Advance."

### 3. 📉 Exit & Suspension Policy
* **The 1-Year Lock-in:** The "Leave Organization" button is hidden/disabled for members who have not completed **12 months** of membership.
* **The 9.99% Exit Deduction:** (Updated from 9.9% to 9.99% per policy).
    * **Logic:** `Refund = (Total Principal) - 9.99%`. 
    * **Profit:** 0% (Profits remain with the pool).
    * **Payout Schedule:** Record the refund as a "Payable" due over the next **4 months**.
* **The 3-Month Default Rule:** If a member has 3 consecutive months of unpaid shares, the system flags the account as **"Suspended/Action Required"** for the Admin to review.

### 4. 🏦 Virtual Wallet, Investment & Halal Compliance
* **Shariah-Compliant Labeling:** Since it is a "Loss-Sharing/Halal" model, the UI should use terms like "Profit/Loss Distribution" instead of "Interest."
* **Two-Accountant Funding:** * Member pays Accountant A or B. 
    * Accountant confirms ➔ Money enters Accountant's Virtual Wallet.
    * **Investment:** Funds are deducted from one or both wallets to fund a project. 
    * **Expense:** Any organizational cost is logged and deducted from the pool.
* **Investment Receipt:** Mandatory image/PDF upload for every project investment.
* **Re-investment:** A "Matured" project's funds (Principal + Profit) can be moved directly into a "New Project" without returning to the member wallets first.

### 5. 📢 Reporting & Transparency
* **Monthly Status Report:** A "Monthly Snapshot" generated for all members by the accountant (Rule 22).
* **Bi-Annual General Meetings (AGM):** In **June** and **December**, the system generates a "Comprehensive Financial Statement" (Income, Expenditure, Profit, Loss) for presentation.
* **Notification Center:**
    * New Invoice generated.
    * Meeting Summon (Admin can send a "Mandatory Attendance" alert).
    * Penalty Alert.

### 6. 🔐 Admin & Authority Controls
* **Rule Flexibility:** A "Policy Editor" where the Admin can change the 9.99% rate, the 15th deadline, or the share price for future batches.
* **Disciplinary Actions:** Admin can "Suspend" or "Ban" a member for "Grouping/Disorder" (Rule 24).
* **Liability Disclaimer:** A footer or "Terms" page explicitly stating the org is not responsible for personal transactions between members.


### 7. System users
The system has several users- Super admin, Advisor, and Two Accountant. These are the primary users; the admin can create new users and set up permissions later. All the users are the members too.
---

## 💻 Technical Stack & Data Flow (SQLite)

**Tech:** React.js, Node.js/Express, SQLite (using Sequelize or Prisma).

**The Workflow Sequence:**
1.  **Member Registration** (Checked against Batch NS 12).
2.  **Admin Verification** (Green Badge awarded).
3.  **Member Uploads Receipt** (Targeting Accountant A or B).
4.  **Accountant Confirms** ➔ **Auto-Invoice Generated** ➔ **Notification Sent**.
5.  **Funds Pooled** ➔ **Invested in Halal Projects** ➔ **ROI Tracked**.
6.  **Year 5 End:** `Total Assets - Total Expenses - Service Charges` distributed based on `% of Total Shares`.

---

