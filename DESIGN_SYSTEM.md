# MAS Agency Enterprise Design System & UI/UX Specification
**Brand Identity:** Sovereign Bespoke Travel in Egypt  
**Target Benchmarks:** Apple, Aman Resorts, Stripe, Linear, Framer, GetYourGuide

---

## 1. Visual Language & Color Palette (Design Tokens)

The visual style combines the editorial elegance of **Aman Resorts** with the sharp, pixel-perfect layout engineering of **Stripe** and **Linear**. It is spacious, clean, and uses high-contrast cinematic typography.

### Color Palette (Design Tokens)

| Token Name | Tailwind Utility Class | HEX Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary Emerald** | `text-emerald-600` / `bg-emerald-600` | `#059669` | Primary brand touchpoints, main CTAs, and trust indicators |
| **Primary Emerald Dark** | `bg-emerald-700` / `text-emerald-700` | `#047857` | Hover states and deep branding |
| **Secondary Navy** | `text-slate-900` / `bg-slate-900` | `#0f172a` | Headers, secondary actions, and high-density text |
| **Accent Gold** | `text-amber-500` / `bg-amber-500` | `#f59e0b` | Royalty styling, luxury highlights, star ratings, and VIP indicators |
| **Background Light** | `bg-white` / `bg-slate-50` | `#ffffff` / `#f8fafc` | General background, spacious canvas grids |
| **Dark Section / Canvas** | `bg-slate-950` / `bg-slate-900` | `#020617` / `#0f172a` | Immersive dark modules, cinematic video frames, footers |
| **Card Surface** | `bg-white/80` / `border-slate-200/80` | `#ffffff` / `#e2e8f0` | High-contrast soft white floating cards with premium micro-shadows |
| **Success Green** | `text-emerald-500` / `bg-emerald-500` | `#10b981` | Positive actions, confirmed booking statuses, coupon validated states |
| **Warning Amber** | `text-amber-400` / `bg-amber-400` | `#fbbf24` | Pending state highlights, warning notices |
| **Error Red** | `text-rose-600` / `bg-rose-600` | `#e11d48` | Cancellation states, missing fields, validation failures |

### Gradients
- **Royal Sand:** `bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-500`
- **Sovereign Dark:** `bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent`

---

## 2. Typography & Editorial Hierarchy

We pair high-contrast Editorial Serif headings (representing ancient Egyptian majesty) with razor-sharp Technical Sans-Serif and Mono interfaces (representing modern, fast, Stripe-like precision).

- **Primary Sans-Serif (General UI & Inputs):** **Inter** (clean, versatile, highly legible).
- **Display Serif (Luxury Headings & Titles):** **Playfair Display** (majestic, classic, elegant).
- **Monospace (Data, Identifiers & Tech Specs):** **JetBrains Mono** (crisp, structural).

### Scale & Hierarchy Rules

```css
h1 (Cinematic Titles): 4.5rem (72px) / Tracking -0.025em / Playfair Display
h2 (Section Headers):  2.25rem (36px) / Tracking -0.02em / Playfair Display
h3 (Card Titles):      1.125rem (18px) / Tracking -0.015em / Inter Bold
body (Readable Text):   0.875rem (14px) / Leading 1.625 / Inter Regular
caption (System Label): 0.625rem (10px) / Tracking 0.15em / JetBrains Mono Semibold Uppercase
```

---

## 3. Page Layouts & Structural Blueprint

The layout centers around **three core roles** mapped into a seamless single-page hybrid application:
1. **The Guest Excursion Catalog (`role === 'guest'`):** An immersive visual portal.
2. **The VIP Customer Dashboard (`role === 'customer'`):** A premium portal with active bookings, WhatsApp logs, and loyalty points.
3. **The Enterprise Admin Control Center (`role === 'admin'`):** A dense operations suite.

### 3.1 Homepage Layout (Guest Excursion Catalog)
- **Hero Section:** Full-screen cinematic camel and yacht video loop with a floating blur-backdrop bento search widget.
- **Search Experience:** Instant autocomplete widget supporting Region, Date, Guests, Category, Budget, and Language.
- **Popular Categories:** Grid of luxury category cards (e.g., *Island Trips*, *Historical Tours*, *Safari*, *VIP Yacht Charters*).
- **Featured Tours:** Horizontal/vertical premium cards with rating, discount indicator, and quick comparison hooks.
- **Interactive Egypt Map:** Interactive visual coordinate widget highlighting Luxor, Cairo, Giza, and Sharm El Sheikh with weather, local attractions, and curated tours.
- **Why MAS Agency:** Performance metrics (99.8% satisfaction, 24/7 Butler Support, Mercedes V-Class Chauffeurs).
- **Customer Reviews:** Verified reviews with rating distribution filters, custom traveler avatars, and country flags.
- **Instagram Gallery:** Modern masonry grid showing Stories, Reels, and real traveler memories.
- **AI Travel Planner:** Elegant floating virtual concierge ("Zephyr") providing interactive customized itineraries.
- **Footer:** Deep midnight blue column index, newsletter subscription, WhatsApp hotline, language/currency selectors.

### 3.2 Tour Details Page Layout (Luxury Travel Magazine feel)
- **Hero Gallery & Video Panel:** Split-screen cinematic layout.
- **Overview & Description:** Large readable typography with high-contrast pullquotes.
- **Sovereign Highlights:** Checklist of exclusive elements.
- **Interactive Itinerary Accordion:** Timeline tracking hour-by-hour luxury activities.
- **Included / Excluded Matrix:** Elegant grid comparing services.
- **Meeting Point & Pickup Zones:** Hotel selection list with interactive map markers.
- **FAQ Accordion:** Toggle-to-reveal blocks.
- **Reviews Ledger:** Star distributions and user logs.
- **Sticky Booking Sidebar:** Dynamic booking summary that locks on scroll.

### 3.3 Single-Page VIP Checkout Booking Flow
- **Step 1: Reservation Scope:** Select Date, Number of Travelers, and Pickup Hotel.
- **Step 2: Traveler Manifest:** Gather names, age categories, and optional passports.
- **Step 3: Bespoke Upgrades & Extras:** Add high-end extras (Photographer, Lobster Lunch, Heli-Flyover).
- **Step 4: Promos & Payment:** Instant coupon verification, card entry form, and Cash on Pickup toggle.
- **Step 5: Completion Celebration:** Stunning success animation, PDF ticket generation, and simulated real-time WhatsApp delivery alert.

### 3.4 VIP Customer Dashboard Layout
- **Loyalty & Rewards Status:** Gold border widget tracking VIP points.
- **Active Reservation Ledger:** Card listing active chauffeur assignments, active Egyptologist, and secure QR access vouchers.
- **Real-Time WhatsApp Logs:** Micro-console displaying simulated business notifications pushed to the client.
- **Support Chat Console:** Floating live messenger.
- **Wishlist & Personal Settings:** Toggle preferences and Dark Mode.

### 3.5 Enterprise Admin Dashboard Layout
- **Global Search & Command Palette:** Search anything anywhere.
- **Operations Map Grid:** Live booking states.
- **Metric Widgets:** Real-time revenue, profit, average ratings, and customer count cards.
- **CRM Control Center:** Manage client profiles, assign chauffeurs (Sherif, Tarek), and add tags.
- **Excursion CMS Manager:** Drag-and-drop tour cards, update prices, edit itineraries, and add discount rates.
- **System Audit Log:** Immutable event ledger showing system activity.

---

## 4. Reusable Component Library

Every component has 8 distinct visual states: **Hover, Focus, Active, Disabled, Loading, Success, Warning, Error.**

### 4.1 Buttons
- **Primary Sovereign Gold:** `bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black tracking-tight hover:scale-102 hover:shadow-lg active:scale-98`
- **Secondary Emerald Ghost:** `border border-emerald-600 text-emerald-600 hover:bg-emerald-50 focus:ring-2 focus:ring-emerald-500/20`
- **Icon Controls:** Round layout with custom micro-shadow, rotating loading spinner states.

### 4.2 Cards
- **Sovereign Tour Card:** Large photo frame, heart/wishlist button, price badge, rating stars, hover scale, transition blur overlays.
- **Bento Metric Card:** JetBrains Mono figures, subtle border highlight, upward trend percentage badge.

### 4.3 Form Inputs & Dropdowns
- **Luxurious Select Input:** Custom down-chevron svg background, white backdrop, elegant border ring on focus state.
- **Verification Input:** Code coupon box with animated validation spinner, turning green on success and red on error.

### 4.4 Modals & Drawer Overlays
- **Cinema-Stage Overlay:** Blur backdrop `backdrop-blur-xl`, fade-in scale transitions.

---

## 5. Animation, Scrolling & Micro-interactions

Motion is subtle, professional, and performant:
- **Scrolling Reveal:** Cards fade in and scale up slightly as they cross the viewport.
- **Button Hover Shine:** Soft gradient shift.
- **Interactive Tab Slider:** Sliding indicator lines when switching detail tabs.
- **Celebration Confetti:** Confetti blast upon successful checkout.
- **Wishlist Heart Beat:** Interactive pulsing heart animation.
- **Live Counters:** Counts (e.g. "1,452 satisfied customers") count up instantly.
- **Chatbot Float:** Slight bobbing animation for the floating butler widget.

---

## 6. Comprehensive Customer Journey Maps

```
[Discovery] --> Cinematic Hero Video --> Dynamic Search / Filtering --> Tour Spec Comparison
                                                                               |
[Consideration] <-- Virtual AI travel Butler (Zephyr) <-- Detailed Magazine View
      |
[Decision / Checkout] --> Single-Page 4-Step Checkout --> Add Private Upgrades --> Verify Promo
                                                                                      |
[VIP Fulfillment] <-- Instant WhatsApp Confirmation <-- Live QR Ticket <-- Access VIP Portal Dashboard
```

---

## 7. Accessibility & Mobile-First Principles

- **Contrast Ratios:** Pure charcoal and black text on clean white backgrounds; amber gold highlights must maintain a contrast of at least 4.5:1.
- **Touch-Target Sizing:** Mobile bottom navigators and buttons have a minimum size of `44px x 44px`.
- **Keyboard Support:** Full `TAB` index traversal with custom gold focus outlines.
- **Aesthetic Integrity:** Zero fake logs, simulated container port noise, or larping coordinates are rendered.

---
*Created by MAS Agency Product & Creative Director. Certified world-class luxury.*
