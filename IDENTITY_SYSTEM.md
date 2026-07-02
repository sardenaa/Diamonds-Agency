# MAS Agency Enterprise Identity Platform & Security Specification
**Brand Standard:** Sovereign Luxury Bespoke Travel (Egypt)  
**Target Benchmarks:** Apple, Stripe, Okta, Auth0, GitHub, Salesforce

---

## 1. Complete Authentication Flow Diagrams

### 1.1 Secure Password-Based Authentication with MFA Escalation
```
[Client App]             [Identity Gateway (v1/auth)]        [MFA Service]        [Session Manager]
     │                                │                           │                       │
     │── 1. POST /login ─────────────►│                           │                       │
     │    (Email, Pass, Fingerprint)  │                           │                       │
     │                                │── 2. Verify Credentials ──│                       │
     │                                │    & Check Device Risk    │                       │
     │                                │                           │                       │
     │◄─ 3. Return MFA Challenge ─────│                           │                       │
     │    (JWT payload, MFA type)     │                           │                       │
     │                                │                           │                       │
     │── 4. POST /login/mfa ─────────►│                           │                       │
     │    (TOTP / SMS code + JWT)     │── 5. Verify Token ───────►│                       │
     │                                │◄── 6. Verification OK ────│                       │
     │                                │                                                   │
     │                                │── 7. Issue Session Tokens & Rotate Fingerprint ──►│
     │                                │◄── 8. Session active ─────────────────────────────│
     │                                │                                                   │
     │◄─ 9. Set HttpOnly Cookie ──────│                                                   │
     │    (access_token + refresh)    │                                                   │
```

---

## 2. Registration & Onboarding Flows

```
      [ Start Onboarding ]
               │
        ┌──────┴──────┐
        ▼             ▼
  [ Social Auth ]  [ Email + Password ]
        │             │
        │             ▼
        │      [ Password Check ] ── (Length >= 12, Entropy Score >= 4)
        │             │
        └──────┬──────┘
               ▼
   [ Create Pending Account ] ──► (Generate unique system customer_profile)
               │
               ▼
   [ Email & Phone Verification ] ──► (Send OTP via SendGrid and Twilio WhatsApp)
               │
               ▼
   [ Complete Core Profiling ] ──► (Collect Preferred Language, Currency, Nationality, Passport)
               │
               ▼
       [ Active Account ]
```

---

## 3. Password Reset & Account Recovery Flows

```
[Customer Request] ──► [Submit Email] ──► [Generate Crypto-Safe Token] ──► [Push to Outbox Queue]
                                                                                   │
                                                                                   ▼
[Set New Password] ◄── [Click Magic Link] ◄── [Verify Active Token] ◄── [Send SendGrid Email]
       │
       ▼
[Validate Criteria] ──► [Update DB & Revoke Sessions] ──► [Broadcast "Security Event: Pass Change" to Audit]
```

---

## 4. Guest-to-Customer Conversion Flow

Our platform allows Frictionless Guest Checkout. When a guest completes a booking, a shadow profile is registered. Converting this shadow profile to a full account requires minimal friction:

```
                  [ Guest Reservation Completed ]
                                 │
                                 ▼
                    [ Shadow Profile Created ]
               (Tied to guest email, booking_id)
                                 │
                                 ▼
                 [ WhatsApp Delivery of QR Ticket ]
              (Contains link: "Claim Your VIP Account")
                                 │
                                 ▼
                    [ Guest Clicks Claim Link ]
         (Provides secure validation token from database query)
                                 │
                                 ▼
                   [ Password Selection UI Screen ]
         (Single input field: Setup secure login password)
                                 │
                                 ▼
                     [ Conversion Finalized ]
      - Update account status to 'active'
      - Transition shadow booking records to customer_profile_id
      - Accrue retroactive VIP loyalty points instantly
```

---

## 5. Granular Role-Based Access Control (RBAC) Matrix

Every permission is systematically mapped to modules. Roles represent collections of permission definitions and cannot be updated without strict audit logs.

| Role Code | Module | Permitted Actions | High-Risk Escalation Requirement |
| :--- | :--- | :--- | :--- |
| `sovereign_diamond_vip` | Bookings, Profile, Loyalty | `view_own_bookings`, `create_booking`, `claim_rewards`, `manage_own_travelers` | None |
| `driver` | Logistics | `view_assigned_pickups`, `arrive_at_pickup`, `complete_ride` | Geo-fence confirmation override |
| `guide` | Excursions, Roster | `view_assigned_itinerary`, `attendance_check`, `submit_incident_report` | None |
| `customer_support` | CRM, Support | `view_customer_profiles`, `impersonate_customer_read`, `resolve_tickets`, `view_audit_logs_own_actions` | Admin approval for impersonation |
| `finance` | Accounting, Payments | `view_financial_analytics`, `trigger_refunds`, `void_invoices` | Double-approver sequence for refunds > $5,000 |
| `operations_manager` | Logistics, Staff, CMS | `assign_drivers`, `override_rosters`, `edit_excursion_prices`, `publish_tours` | Yes, full session audit tracking |
| `super_admin` | Global System | `all_privileges` (full database read/write/delete scope) | Hardware MFA enforcement |

---

## 6. Session Lifecycle & Token Security Specification

Sessions leverage a Dual-Token Strategy using Cryptographically-Secure Tokens (JWTs) wrapped in security mechanisms protecting against session hijacking.

### 6.1 Token Specs
- **Access Token:** High-entropy JWT. Lifespan: **15 minutes**.
- **Refresh Token:** Cryptographic random UUID stored in relational `user_sessions`. Lifespan: **7 days**. Sliding window configuration automatically extends expiry on active requests.

### 6.2 Browser Storage Strategy
Tokens are **never stored** in `localStorage` or local JavaScript variables (which are susceptible to Cross-Site Scripting (XSS) extraction).
- Store inside an **HttpOnly, Secure, SameSite=Strict, __Host-Prefix cookie**.
- Browser automatically appends cookies to API routes (`/api/*`), preventing JS access.

---

## 7. Multi-Factor Authentication (MFA) Architecture

We support strict, multi-tiered MFA options protecting customer profiles and staff operations.

```
                    [ Identity Gateway ]
                             │
                             ▼
              [ Check Target Actor Settings ]
                             │
            ┌────────────────┴────────────────┐
            ▼ (Role: Customer)                ▼ (Role: Staff/Admin)
     [ Optional MFA Opt-In ]          [ Strict Required MFA ]
            │                                 │
            ├─────────────────────────────────┤
            ▼
     [ MFA Challenge Multiplexer ]
            │
            ├─► 1. Authenticator (TOTP RFC 6238)
            ├─► 2. Secure SMS / WhatsApp (Twilio OTP)
            └─► 3. Emergency Backup Codes (8x cryptographically random alphanumeric)
```

---

## 8. API Authentication & Token Refresh Specification

External partner integrations (White-Label agencies, Corporate portal scripts) authenticate via scoped system API keys.

### 8.1 API Request Header Design
Integrations include authorization headers adhering to bearer standards:
```http
Authorization: Bearer mas_live_ae8f92bd391c002bc478
```

### 8.2 Authentication Middleware Operations Checklist
For every incoming request, the server executes the following pipeline:
1. **Header Parsing:** Extract key token. Check prefix identifier (`mas_live_` or `mas_test_`).
2. **Key Hashing:** Hash the provided key token using SHA-256 before scanning database registers (prevents SQL timing attacks).
3. **Cache Validation:** Scan fast redis/memory caches for validated token scope mapping.
4. **Rate Limit Verification:** Track request rates against the key's allocated tier (e.g., Enterprise limit: 120 requests/minute). Return HTTP 429 if bounds exceeded.
5. **Scopes Check:** Match request action against defined API Key JSON scopes (e.g., `bookings:create`).

---

## 9. Security Threat Model (OWASP Top 10 Protections)

We actively engineer out core vulnerabilities from the ground up:

| OWASP Vulnerability | Risk Scenario at MAS Agency | Systematic Architecture Mitigation |
| :--- | :--- | :--- |
| **A01:2021-Broken Access Control** | Unauthorized user edits another guest's booking details. | Global route middlewares implement strict Object-Level Access Control. Queries match on `WHERE customer_id = current_user.id AND company_id = current_company.id`. |
| **A02:2021-Cryptographic Failures** | DB compromise leaks plaintext passports or master keys. | Passports, MFA secrets, and sensitive documents are encrypted in-transit (TLS 1.3) and at-rest using **AES-256-GCM** with keys managed in secure hardware modules. |
| **A03:2021-Injection** | SQL Injection via custom bento filter search inputs. | Absolute prohibition of raw SQL strings. The data layer uses prepared queries via **Drizzle ORM** (TypeScript) with parameterized variables. |
| **A05:2021-Security Misconfiguration** | Unsecured endpoint allows unauthorized deletion of files in Media system. | Strict CORS setup restricting access to designated domains. Helmet middleware is injected to broadcast security headers (`X-Content-Type-Options: nosniff`, `Content-Security-Policy`). |
| **A07:2021-Identification & Auth Failures** | Credential stuffing targeting VIP accounts. | Brute force filters tracking IP, User-Agent, and Email scopes. If 5 failures trigger in 60s, a 15-minute cool-down lock is enforced. Weak password lists are evaluated on setup. |

---

## 10. Audit Logging Specification

Critical authentication and identity mutations generate immutable system logs. The audit system records both current state and past context for complete accountability.

```json
{
  "audit_id": "audit_82739174",
  "timestamp": "2026-07-02T07:05:00Z",
  "actor": {
    "user_id": "usr_9927391274",
    "role": "operations_manager",
    "ip_address": "197.34.12.98",
    "device_fingerprint": "df_8f93a102bc"
  },
  "action": "role.permissions.update",
  "target": {
    "entity_name": "role_permissions",
    "entity_id": "role_8817"
  },
  "delta": {
    "before": {
      "role_code": "operations_manager",
      "permissions": ["view_tours", "manage_bookings"]
    },
    "after": {
      "role_code": "operations_manager",
      "permissions": ["view_tours", "manage_bookings", "refund_payments"]
    }
  },
  "metadata": {
    "reason_code": "REQ-882-OPS-REFUNDS",
    "ticket_reference": "INC-2291",
    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)..."
  }
}
```

---

## 11. Privacy & Consent Compliance Model (GDPR / CCPA)

To ensure global data standards, our identity architecture natively implements the following privacy paradigms:

### 11.1 Explicit Marketing & Communication Consent Ledger
- All marketing opt-ins are explicit checkboxes (no pre-checked items).
- Each opt-in change (WhatsApp, Email, SMS) logs the timestamp, the IP address, and the specific terms document version accepted.

### 11.2 Right to be Forgotten (Anonymization Protocol)
When a customer profile is legally closed/deleted:
- Personal Identifier columns (Names, Passports, Emails, Phones, Address Details) are **hashed, cleared, or overwritten with generic strings** (e.g., `DELETED_USER_RESERVED`).
- Relational booking and payment history figures are **preserved** as anonymous aggregates to maintain accounting continuity.

---

## 12. Customer Portal Information Architecture

Below is the user navigation tree of our premium VIP Customer Portal:

```
[ VIP Customer Portal Dashboard ]
  ├── 🏠 Overview Home (Upcoming itinerary preview, active loyalty status widget)
  ├── 📅 My Royal Bookings
  │     ├── Upcoming Excursions (Secure QR vouchers, active Egyptologist contact detail sheet)
  │     └── Past Expeditions (Download invoice files, review tour forms)
  ├── 💳 Financial Vault
  │     ├── My Invoices (Printable PDFs, partial payment modules)
  │     └── Payment Methods (Saved, tokenized payment cards)
  ├── 💖 Elite Wishlist (Saved luxury tours, shared plans with group links)
  ├── 🎁 Sovereign Rewards (Loyalty point balance sheet, claim active perks)
  ├── 📞 Support Center (Chat console, open tickets, contact butler team)
  └── ⚙️ Profile Security Settings
        ├── Personal Details (Name, phone, nationality)
        ├── Security Keys (Change password, MFA setup, trusted device ledger)
        └── Preferences (Preferred language, currency selection, notification channels)
```

---
*Identity Architecture Certified Core-Sovereign Grade.*
