# MAS Agency Enterprise Operational Workflows & Business Rules Specifications
**Brand Standard:** Sovereign Luxury Bespoke Travel (Egypt)  
**Target Benchmarks:** Airbnb, Stripe, Salesforce, GetYourGuide, Booking.com

---

## 1. Unified Operational Workflows & State Machines

### 1.1 Booking Lifecycle State Machine
Every booking transition is managed through a strict, auditable transaction handler. State transitions validate downstream constraints, log historical events, and trigger specified background workflows.

```
       [ Draft ] 
           │ (Checkout Completed)
           ▼
       [ Pending ] <───(Reschedule Request)───┐
           │                                  │
      ┌────┴──────────────────────────┐       │
      ▼ (Pre-pay Required)            ▼       │
[ Awaiting Payment ]           [ Confirmed ] ─┘
      │ (Payment Verified)            │
      ▼                               ▼ (Roster Match)
[ Confirmed ] ─────────────────► [ Assigned ]
                                      │ (Schedule Confirmed)
                                      ▼
                             [ Pickup Scheduled ]
                                      │ (Driver Check-in)
                                      ▼
                             [ In Progress ]
                                      │ (Tour Ended & Checklist Signed)
                                      ▼
                             [ Completed ]
                                      │ (Feedback Requested)
                                      ▼
                                [ Closed ]
```

#### Transition Event Matrix & Validation Rules

| Previous State | Target State | Authorized Actors | Required Conditions & Validations | Triggered Side-Effects |
| :--- | :--- | :--- | :--- | :--- |
| `draft` | `pending` | Customer, Guest | Valid date selected, at least 1 traveler manifest, pricing lock current (within 10-minute timeout). | Initialize `invoice_number`, schedule payment expiry timer (15 min). |
| `pending` | `awaiting_payment` | System, Finance | Payment method chosen requires online capture (e.g., Credit Card, Paymob). | Send localized payment email & WhatsApp links. |
| `pending` / `awaiting_payment` | `confirmed` | Admin, System | Cash on pickup chosen OR payment captured successfully. | Fire `booking.confirmed` event, increment category reservation counters, update Loyalty tier. |
| `confirmed` | `assigned` | Operations, AI | Guide available with requested tour language, vehicle matching traveler capacity with active registration. | Generate logistical logs in `logistical_assignments`. Notify guide via Guide App. |
| `assigned` | `pickup_scheduled` | Driver | Driver accepts assignment, hotel pickup coordinate verified, optimal time window calculated. | Dispatch WhatsApp message containing driver profile photo, name, vehicle type, and plate. |
| `pickup_scheduled` | `in_progress` | Driver, Customer | Passenger count matches manifest on board, physical QR scan validated. | Start real-time GPS fleet telemetry broadcast. Update CRM interaction timeline. |
| `in_progress` | `completed` | Guide, System | Scheduled duration elapsed, Guide signs off tour checklist. | Send automatic review invite survey with discount voucher code. |
| `*` | `cancelled` | Customer, Admin | Cancellation policies validated (e.g. Free cancellation window check). | Trigger automatic refund checklist, release held assets (guides, boats). |

---

## 2. Comprehensive Sequence Diagrams (Text-Based)

### 2.1 The VIP Checkout and Real-time Fulfillment Flow
This diagram models the micro-transactions occurring when a Sovereign VIP guest commits a booking.

```
[Customer Browser]       [Vite/Express Server]      [Payment Provider]     [WhatsApp Business API]
        │                           │                       │                       │
        │─── 1. Complete Booking ──►│                       │                       │
        │    (Manifest + Extras)    │                       │                       │
        │                           │─── 2. Capture Auth ──►│                       │
        │                           │    (Token Charge)     │                       │
        │                           │◄── 3. Approved/Ref ───│                       │
        │                           │                       │                       │
        │                           │─── 4. Save to DB ─────│                       │
        │                           │    (bookings/invoices)│                       │
        │                           │                       │                       │
        │                           │─── 5. Trigger Queue ──│──────────────────────►│
        │                           │    (Generate Tickets) │                       │
        │                           │                       │                       │
        │◄── 6. Confetti & Voucher ─│                       │                       │
```

### 2.2 Operational Allocation and Live Dispatch Flow
This models how the system assigns and notifies logistical teams in Cairo and Luxor.

```
[Automation Engine]        [Guide Ledger]         [Driver Ledger]         [Customer WhatsApp]
        │                       │                       │                       │
        │─── 1. Core Event ─────►│                       │                       │
        │    (booking.confirmed)│                       │                       │
        │                       │                       │                       │
        │─── 2. Roster Query ───│                       │                       │
        │    (Language Check)   │                       │                       │
        │◄── 3. Guide Matches ──│                       │                       │
        │                       │                       │                       │
        │─── 4. Roster Query ───│──────────────────────►│                       │
        │    (Vehicle Capacity) │                       │                       │
        │◄── 5. Driver Matches ─│───────────────────────│                       │
        │                       │                       │                       │
        │─── 6. Lock Guides ───►│                       │                       │
        │    & Drivers          │                       │                       │
        │                       │                       │                       │
        │─── 7. Dispatch ───────│───────────────────────│──────────────────────►│
        │    SMS / WhatsApp     │                       │                       │
```

---

## 3. Pricing Logic, Dynamic Rules & Stacking

MAS Agency implements an auditable, explainable business rules engine for price calculations. Every invoice breakdown can be verified step-by-step.

### 3.1 Pricing Engine Hierarchy
The pricing calculation executes sequentially, starting with base cost structures and layers on variable modifiers.

```
                  [ Base Excursion Price ]
                  (Adult/Child/Infant rates)
                             │
                             ▼
                [ Add Optional Premium Extras ]
              (Photographer, Helicopter flight)
                             │
                             ▼
                [ Apply Seasonal Modifier ]
              (High Season multiplier, e.g., 1.25)
                             │
                             ▼
                 [ Deduct Active Campaigns ]
               (Promotional Coupons or Vouchers)
                             │
                             ▼
               [ Stack Loyalty & VIP Discounts ]
                 (Gold/Diamond Patron deductions)
                             │
                             ▼
                [ Final Currency Conversion ]
             (Live currency index with conversion buffer)
```

### 3.2 Discount Stacking Policy & Constraints
- **Stackability Limit:** A maximum of one (1) promotional campaign coupon can be stacked with a customer's standard tier loyalty discount.
- **Order of Deductions:** Flat currency deductions (e.g. €50 voucher) are applied *after* percentage-based discounts (e.g. 10% Gold Member tier discount).
- **Minimum Transaction Threshold:** In no circumstance can stacking lower the final booking price below **20% of the original tour base rate**. If calculations result in a lower value, the price is auto-adjusted to the 20% floor.

---

## 4. Workflows & CRM Segment Automations

The marketing automation system listens to core database state changes to automatically group, tag, and convert users.

### 4.1 Segment Classification Matrix

```
       [ CRM Event Hook ]
               │
        ┌──────┴──────┐
        ▼             ▼
[ Completed Trips ] [ Inactive Days > 120 ]
        │             │
        ├─► (LTV ≥ €5,000) ──► Tag: "Sovereign Diamond VIP" ──► Assign Private Concierge
        │
        └─► (LTV < €1,000) ──► Tag: "Frequent Explorer"   ──► Auto-Enroll Loyalty Accelerator
```

### 4.2 Automation Workflow Trigger Schema
Workflows are structured in logical blocks of **Triggers, Conditions, Delays, and Actions**:

```json
{
  "workflow_id": "wf_post_trip_feedback",
  "name": "Post-Trip Engagement Loop",
  "trigger": "booking.completed",
  "conditions": {
    "customer_rating_average": { "operator": "gte", "value": 4.5 }
  },
  "steps": [
    {
      "action": "wait",
      "duration": "24h"
    },
    {
      "action": "send_whatsapp",
      "template_code": "tpl_royal_feedback_request_ar_en",
      "variables": ["customer_name", "tour_title"]
    },
    {
      "action": "wait",
      "duration": "48h"
    },
    {
      "action": "evaluate_branch",
      "condition": "review_submitted == true",
      "if_true": [
        {
          "action": "send_email",
          "template": "tpl_reward_points_credited"
        },
        {
          "action": "add_loyalty_points",
          "points": 500
        }
      ],
      "if_false": [
        {
          "action": "send_sms",
          "message": "We value your voice, our team is always at your command. Let us know how we did here: {{link}}"
        }
      ]
    }
  ]
}
```

---

## 5. Logistics, Pickups & Location Routing

### 5.1 Hotel Pickup Schedule Synchronization
Hotel locations are grouped into geofenced zones (e.g. *Hurghada Central*, *Makadi Bay*, *El Gouna*). Every zone defines a localized offset calculated relative to the primary departure harbor/airfield.

- **Formula:** `Pickup Time = Tour Departure Time - (Base Zone Transfer Time + Hotel-Specific Buffer)`
- **Grace Period Windows:** Vehicles operate on a strict 10-minute maximum waiting buffer. If a guest does not check-in, the driver logs a "No Show" event (complete with timestamps and geo-coordinates) which initiates an automated WhatsApp customer alert.

---

## 6. Exception Management, Failures & Approvals

Enterprise-grade operations prepare for real-world logistical disruptions.

### 6.1 Cancellation & Refund Hierarchy
- **Weather / Marine Advisories (Red Sea Authority):** Force majeure cancellations are automatically initialized as full cash refunds, or 100% value travel vouchers with a 10% complimentary bonus code.
- **Standard Guest Cancellation:**
  - `> 48 hours notice`: 100% refund.
  - `24 - 48 hours notice`: 50% refund.
  - `< 24 hours notice`: 0% refund.

### 6.2 Escalation Matrix for Multi-Level Incident Control

```
[ Logistical Incident Raised ]
           │
           ▼
[ Status: Low / Minor delay ] ────► Auto-SMS Guest ──► Re-route backup vehicle
           │
           ▼ (Unresolved after 15 min OR High Priority)
[ Status: Medium / Guide Illness ] ──► Page Duty Manager ──► Swap with alternate guide
           │
           ▼ (Unresolved after 30 min OR Critical VIP)
[ Status: Critical / Force Majeure ] ──► Alert Operations VP ──► Execute Private Air/Land Chauffeur rescue
```

---
*Operational Architecture Approved by MAS Agency board.*
