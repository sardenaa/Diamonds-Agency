# Meryet Amen Sovereignty (MAS)

Meryet Amen Sovereignty (MAS) is a bespoke, full-stack executive private expedition chartering and enterprise CRM platform tailored for high-net-worth VIP clients exploring Egypt's historic wonders. Combining high-hospitality covenants, elite chauffeur tracking, and sophisticated administrative customer relationship management, MAS bridges the gap between ancient wonders and modern digital sovereignty.

---

## 🏛️ Project Overview

The MAS platform is designed around two core experiences:
1. **The VIP Customer Journey**: Allows elite clients to discover customized, high-luxury historic tours, request custom pricing in various global currencies, checkout securely with a digitized touchscreen signature pad, and instantly download print-ready electronic tickets and binding **Luxury Service Agreements (PDF)** directly from their personalized dashboard.
2. **The Enterprise Admin Console & CRM**: A 100% complete customer relationship management hub that empowers luxury operations committees to monitor analytics, update the tour catalog (CMS), track audit logs, manage support tickets with automated Gemini AI drafting, and broadcast bulk promotional campaigns via simulated WhatsApp channels with customer segmentation.

---

## 💎 Recent Sovereign Upgrades

We have recently integrated several high-performance upgrades to enhance the visual fidelity and loading speeds of the platform:

### 1. Unified Bespoke Brand Identity
To establish a distinctive, high-end visual presence, we generated a professional minimalist golden diamond logo to serve as the unified brand identifier. This replaces the generic icon placeholders with polished, high-contrast assets across all crucial customer-facing and operational portals:
- **Luxury Brand Navigation**: Features a soft-bordered card wrapping the golden diamond logo at the core of the sticky navbar.
- **Sovereign VIP Gate**: Enhances the premium luxury login screen with a centered golden-emblem preview container.
- **Official Print Voucher**: Adorns the digital dispatch boarding passes and printed itineraries.
- **Operations Console & CRM**: Grounds the executive admin control header with official luxury agency markings.
- **Customer Account Suite**: Polishes the user profile panel with high-contrast, professional brand positioning.

### 2. High-Performance Responsive Itinerary Image Engine
We built a responsive, mobile-first dynamic image loading system specifically optimized for modern cellular networks and desktop viewport transitions:
- **Real-Time MediaQuery Synchronization**: Uses match-media queries inside a dedicated React component (`ResponsiveItineraryImage.tsx`) to dynamically detect device changes and re-target layout configurations.
- **Bandwidth-Optimized Image Pipeline**: Parses Unsplash photo requests on-the-fly, stripping legacy parameters to inject precise widths, heights, and compression ratios (**640x480 at `q=75`** for mobile cellular conservation; **1200x675 at `q=85`** for high-pixel-density desktop retina displays).
- **Cumulative Layout Shift (CLS) Mitigation**: Pre-allocates perfect responsive aspect boxes (**`aspect-[4/3]`** on mobile; **`aspect-[16/9]`** on desktop) to completely eliminate shifting layouts during lazy load phases.
- **Contextual Timeline Previews**: Integrates this image loading framework directly inside both the Tour Detail Itinerary tabs and the public-facing Shared Digital Itinerary screens.

---

## 🛠️ Technology Stack

The application is built on a modern, high-performance full-stack TypeScript architecture:

### Frontend
- **React (v18+)**: Component-driven architecture using functional hooks.
- **Vite**: Rapid, HMR-free local bundling optimized for sandboxed rendering.
- **Tailwind CSS**: Strict, high-contrast, elegant custom UI design.
- **Motion (`motion/react`)**: Immersive animations, staggered lists, and smooth tab transitions.
- **Lucide React**: Clean, modern iconography matching the luxury theme.

### Backend
- **Express**: Lightweight, robust routing engine for API endpoints and serving build files.
- **PDFKit**: Server-side, on-the-fly programmatic generation of vector PDF documents (Tickets & Agreements) featuring embedded client base64 signature images.
- **TypeScript & tsx**: Pure, type-safe development using Node's modern native execution.

### Integrations & Services
- **Google Sheets API**: Direct integration for automatic synchronization of booking ledgers.
- **Firebase Auth**: Used for administrative Google Sign-In secure access.
- **Gemini AI**: High-level generative modeling for draft support replies and marketing templates.

---

## 👑 How It Works

### 1. For Customers
- **Expedition Booking**: Customers select bespoke historical routes (e.g., *Luxor Secret Tombs*, *Pyramids Sunrise Flight*). They specify traveler counts, special culinary/dietary requirements, select luxury pickup hotels, and request room-specific butler arrangements.
- **Digital Sign-off**: During checkout, customers execute the **Sovereign Luxury Agreement** by appending their hand-drawn signature directly via a specialized touchscreen canvas.
- **Instant WhatsApp Communication**:
  - **Floating Concierge Button**: A gorgeous floating action button available on all pages that directs guests directly to the MAS Royal Concierge WhatsApp chat (`+201202181834`). The button features a state-aware animated greeting tooltip configured in English and Arabic.
  - **Contextual Form Inquiries**: Interactive WhatsApp triggers are integrated directly inside both the selected tour details and active checkout modals, automatically pre-filling the guest's WhatsApp message with their exact desired expedition title.
- **VIP Guest Dashboard**:
  - **Download Ticket (PDF)**: Accesses an elegant, print-ready digital boarding pass and security voucher.
  - **Luxury Agreement (PDF)**: Instantly generates and downloads a legally formal, gold-accented service contract embedding their exact touchscreen signature, electronic timestamp, and binding quality covenants.
  - **Luxury Packing Assistant**: A bespoke pre-travel checklist customized per tour environment (Desert Safari, Nile Cruise, or Red Sea Yachting) configured for English and Arabic. It features pre-loaded luxury and credential checklists, a personal custom item creator, progress indicators, and secure local storage storage.
  - **Live Chat**: Allows customers to interact directly with their designated private butler.
  - **Booking Coordination**: Instantly launch WhatsApp chat directly from the active ticket to synchronize schedules with their private driver or assigned Egyptologist.

### 2. For Admins
- **Analytics & Operations**: Financial tracking of total gross capital, active expeditions, and guest manifests with status indicators.
- **100% Complete CRM System**:
  - **Directory Ledger**: View, search, and filter HNW client profiles by nationality, tags, or name.
  - **Bespoke Profiles**: Create or edit guest profiles with language preferences, specific concierge flags, and lifetime value trackers.
  - **WhatsApp Blast Campaign Tool**: Send bulk broadcasts tailored to client segments (e.g., *Summer Soirée*, *Heli-Tour Upgrade*) using automated template placeholders.
  - **Two-way Communication logs**: Review live WhatsApp logs and support tickets, sending messages directly from the admin dashboard.
  - **AI Copilot**: Uses Gemini to auto-draft support ticket replies or write brand-new, compelling tour descriptions on-the-fly.
- **CMS Control**: Dynamically create, edit, or delete bespoke itineraries.
- **Google Sheets Sync**: Sign in with Google to synchronize the entire bookings ledger into a centralized spreadsheet.

---

## 🎨 Design System & Refinement Principles

MAS implements a highly customized, eye-safe midnight luxury visual identity. Recent design updates focus heavily on **Architectural Honesty** and **Anti-AI-Slop** constraints:
- **Clean Luxury Typography**: Space Grotesk display headings paired with Inter body text and subtle JetBrains Mono micro-caps indicators.
- **De-Cluttered Interface**: Replaced misleading tech-larping status bars and pseudo-cryptographic network logs (e.g., "SOVEREIGN TRUST PROTOCOL", "ENCLAVE ACTIVE") with highly professional, authentic hospitality terms (e.g., "SECURE PROFILE ENVELOPE", "SECURITY LOCK ACTIVE").
- **Visual Micro-Interactions**: Enhanced hover states and smooth staggered animations on card entries via `motion/react` to guide traveler attention.

---

## ⚙️ Installation & Setup

MAS runs smoothly inside sandboxed environments and is configured to bind to **Port 3000** under host `0.0.0.0` for perfect ingress routing.

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file at the root of your workspace (using `.env.example` as a guide):
```env
# .env
GEMINI_API_KEY=your-google-gemini-api-key
FIREBASE_CONFIG=your-firebase-client-credentials-json
```

### 3. Run the Development Server
```bash
npm run dev
```
The server will boot via `tsx` on `http://localhost:3000`.

### 4. Build and Compile for Production
To bundle the frontend single-page application and compile the backend Express server into a standalone CJS file:
```bash
npm run build
npm start
```

---

## 👥 Human Interactions Required

While MAS is heavily automated, the following key touchpoints require human interaction or manual configuration to function fully:

1. **Google Sheets Authentication**:
   - To utilize the **Bookings Ledger Sync**, an administrator must click "Sign in with Google" inside the **Google Sheets Sync** tab of the Admin Console and grant access. This generates the temporary OAuth client tokens required to write to their Google Drive.
2. **Concierge Ticket Resolution**:
   - High-end hospitality demands a human touch. When customers raise support requests or special dietary changes, administrative personnel must read the ticket logs, review the Gemini AI draft reply, customize the message for genuine personal touch, and click **Submit Dispatch**.
3. **Physical Chauffeur & Escort Coordination**:
   - The platform registers pickups and matches booking reference IDs. Human dispatchers are required to assign the specific Mercedes-Benz fleet vehicles, coordinate with certified Egyptologists, and coordinate physical access passes to sovereign historic zones.
4. **Custom API Keys Provisioning**:
   - Integrations with production WhatsApp APIs and live SMTP email relay servers require manual configuration of verified credentials within the server environment.
