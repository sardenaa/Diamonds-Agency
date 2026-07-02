# MAS Agency Enterprise Digital Experience Platform (CMS) Architecture
**Brand Standard:** Sovereign Luxury Bespoke Travel (Egypt)  
**Target Benchmarks:** Contentful, Strapi, Webflow CMS, Shopify Admin, Adobe Experience Manager (AEM)

---

## 1. Content Model Specs (Unlimited Categories & Structured Fields)

To support unlimited, headless, multi-channel distribution (Web, iOS, Android, Partner Portals, GDS), the CMS architecture completely separates presentation from content structure. All schema definitions are modeled as strictly typed JSON schemas with dynamic fields.

```
       ┌─────────────────────────────────────────────────────────┐
       │                       Core CMS Base                     │
       └────────────────────────────┬────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
 ┌──────────────┐            ┌──────────────┐           ┌──────────────┐
 │    Tours     │            │ Destinations │           │    Hotels    │
 └──────┬───────┘            └──────┬───────┘           └──────┬───────┘
        │                           │                          │
        ├─ Itinerary Steps (array)  ├─ Pickup Zones (array)    ├─ Transfer Rules
        ├─ Rules & Inclusions       └─ Nearby Attractions      └─ Contact Specs
        └─ Base Pricing Grid
```

### 1.1 Content Schema Specifications (JSON Modeling)

#### 1.1.1 Tour Entity Model
- **UUID:** UUIDv4 string (immutable, unique index for external API resolution).
- **Slug:** URL-safe string (validated regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`).
- **Core Status:** Enumeration (`draft`, `review`, `approved`, `scheduled`, `published`, `archived`).
- **Title Translations:** Localized JSON map (e.g., `{"en": "Orange Bay Private Yacht", "ar": "يخت خاص أورنج باي"}`).
- **Short Desc Translations:** Localized text map (maximum 160 characters for SEO-friendly preview cards).
- **Long Desc Translations:** Rich JSON layout format supporting inline media elements and nested structured block tags.
- **Duration Minutes:** Positive Integer (minutes).
- **Difficulty:** Enum (`easy`, `moderate`, `challenging`, `extreme`).
- **Featured / Trending / EditorsPick:** Booleans (controlling landing page placement logic).
- **Itinerary Steps:** Array of objects:
  ```json
  {
    "step_number": "Integer",
    "title": "TranslationMap",
    "description": "TranslationMap",
    "duration_minutes": "Integer",
    "coordinates": { "lat": "Decimal", "lng": "Decimal" }
  }
  ```
- **Rules Map:**
  ```json
  {
    "included_items": "TranslationMapArray",
    "excluded_items": "TranslationMapArray",
    "requirements": "TranslationMapArray",
    "cancellation_policy": "TranslationMap"
  }
  ```

#### 1.1.2 Destination Entity Model
- **Country Code:** CHAR(2) (ISO 3166-1 alpha-2, e.g., `EG`).
- **Slug:** String (unique index).
- **Name Translations:** Localized Map.
- **Coordinates:** GeoJSON Point `{ "type": "Point", "coordinates": [lng, lat] }`.
- **Bounding Box:** GeoJSON Polygon outlining operational borders for geofenced transfers.
- **Media Catalog:** Linked asset UUIDs.

#### 1.1.3 Hotel Entity Model
- **Brand ID:** Optional UUID referencing `hotel_brands` ledger (e.g., Four Seasons, Marriott).
- **Pickup Zone ID:** UUID referencing associated Geofenced pickup zones.
- **Name Translations:** Localized Map.
- **Transfer Surcharge:** Decimal multiplier/fixed fee (appended to transfer checkouts).
- **Geo-Coordinates:** Lat/Lng decimal maps.

---

## 2. Entity-Relationship Diagrams (Logical Schema Layout)

```
┌─────────────────┐           ┌─────────────────┐           ┌──────────────────┐
│   Categories    │ 1       * │      Tours      │ *       1 │   Destinations   │
│ (Island, Desert)├──────────►│  (Orange Bay)  │◄──────────┤ (Hurghada, Cairo)│
└─────────────────┘           └───┬─────────┬───┘           └────────┬─────────┘
                                  │         │                        │
                                  │ 1       │ *                      │ 1
                                  ▼         ▼                        ▼
                        ┌─────────────┐  ┌──────────────┐   ┌──────────────────┐
                        │ Tour Medias │  │ Tour Reviews │   │   Pickup Zones   │
                        │ (WebP, MP4) │  │  (Verified)  │   │  (Geofenced Poly)│
                        └─────────────┘  └──────────────┘   └────────┬─────────┘
                                                                     │
                                                                     │ 1
                                                                     ▼ *
                                                            ┌──────────────────┐
                                                            │      Hotels      │
                                                            │ (Sovereign Rates)│
                                                            └──────────────────┘
```

---

## 3. Visual Page Builder & Block Architecture

The MAS Digital Experience Platform implements a **Structural Block Registry**. Content managers compose dynamic landing pages by assembling reusable block templates, which are saved in the CMS database as high-fidelity JSON graphs.

```
┌────────────────────────────────────────────────────────┐
│               Dynamic JSON Layout Engine               │
├────────────────────────────────────────────────────────┤
│  [ Header Global Block ]                               │
│  [ Hero Luxury Video Block ]                           │
│  [ Grid: Selected Tours Block ]                        │
│  [ Interactive Egypt Map Navigator ]                    │
│  [ Custom Contact Form Layout Block ]                  │
│  [ Footer Global Block ]                               │
└────────────────────────────────────────────────────────┘
```

### 3.1 Reusable Page Block Types & Parameter Matrices

#### 3.1.1 Hero Section Block
```json
{
  "type": "block_hero_luxury",
  "parameters": {
    "media_type": "video",
    "media_source_uuid": "asset_9921-bc78",
    "video_poster_url": "https://cdn.mas.agency/posters/orange_bay.webp",
    "headline": {
      "en": "Sovereign Luxury Expeditions across Egypt",
      "ar": "بعثات فاخرة سيادية عبر مصر"
    },
    "subheadline": {
      "en": "Curated private yachts, helicopter flyovers, and certified Egyptologists.",
      "ar": "يخوت خاصة منسقة، جولات هليكوبتر، وعلماء مصريات معتمدين."
    },
    "cta": {
      "text": { "en": "Explore Expeditions", "ar": "استكشف الرحلات" },
      "target_url": "/tours",
      "style": "emerald_gold_gradient"
    }
  }
}
```

#### 3.1.2 Tour Grid Block
```json
{
  "type": "block_tour_grid",
  "parameters": {
    "selection_criteria": "featured",
    "category_filter_uuids": ["cat_1192-bc12"],
    "limit": 6,
    "columns_desktop": 3,
    "columns_mobile": 1,
    "card_style": "minimalist_dark_overlay"
  }
}
```

#### 3.1.3 FAQ Accordion Block
```json
{
  "type": "block_faq_accordion",
  "parameters": {
    "group_id": "faq_cairo_private_expedition",
    "open_first_item_by_default": true,
    "theme_color": "slate_950"
  }
}
```

---

## 4. Operational Editorial Workflow & Publishing Lifecycles

All content changes undergo strict quality-control transitions to guarantee alignment with premium brand standards before public dissemination.

```
 [ Draft Creator ] ──► [ Review Queue ] ──► [ Legal/Admin Sign-off ] ──► [ Scheduled ] ──► [ Published ]
        │                    │                       │                       │                │
        └───(Save Version)◄──┴────(Reject & Comment)◄┴───────────────────────┼──(Rollback)────┘
                                                                             │
                                                                      (Active Timer)
```

### 4.1 Lifecycle States Defined
1. **Draft:** Content is fully editable by its creator. Stored securely inside the CMS without affecting active APIs or public pages.
2. **Review Queue:** Triggered once the editor flags content as completed. Automatically locks editing and alerts assigned Content Reviewers and Translators.
3. **Legal/Admin Sign-off:** High-precision pricing, policies, or safety checklists are verified by managers.
4. **Scheduled:** Content is approved and queue timers are initialized. The publishing engine monitors the designated timezone and date parameters to fire release events.
5. **Published:** Live database sync pushes content to public API endpoints. Cache invalidation webhooks are executed globally to update Edge nodes.

---

## 5. Media Management, Optimization & CDN Ingress

MAS Agency operates a secure, optimized Digital Asset Manager (DAM) supporting massive media payloads with hardware-accelerated transcoding pipelines.

```
[ Raw Asset Upload ]
        │ (Admin Panel Ingress)
        ▼
[ Media Optimization Pipeline ]
        ├─ Image Resizer ──► Generate WebP (720px, 1200px, 1920px) & Blur Placeholders
        └─ Video Transcoder ─► Generate HLS (H.264/H.265) Adaptive Bitrate Streaming
                │
                ▼
[ CDN Storage & Signed URL Ingress ]
        ├── Cloudflare Stream / AWS CloudFront distribution
        └── Edge Caching with cache-control headers: "max-age=31536000, immutable"
```

### 5.1 Optimization Benchmarks
- **Image Formats:** WebP/AVIF only for production layouts. PNG/JPEG formats are auto-converted upon upload.
- **Lazy Loading Strategy:** Modern `<img loading="lazy" decoding="async">` paired with low-resolution base64 inline placeholder blur filters.
- **Copyright Integrity:** Watermark templates are automatically layered on public tour catalog assets, keeping master files pristine in secure backend folders.

---

## 6. Multi-Language & Translation Workflow Specification

To deliver an elite bilingual Arabic and English experience without structural translation clutter, the CMS implements a Translation Translation-Key Model.

```
                    [ Original Resource: Tour / Blog ]
                                    │
                                    ▼
                [ Machine Translation Hook API (Gemini-Flash) ]
                                    │
                                    ▼
                [ Editorial Review Task Dashboard ]
                  (Side-by-side translation editor)
                                    │
                                    ▼
                [ Localization Approval Ledger ]
                                    │
                                    ▼
                 [ Translated Content JSON Map Published ]
```

### 6.1 Translation Completeness Index (TCI)
- The CMS blocks publishing actions if the target language TCI is below **100%**. Every required text field (Title, Descriptions, Meta details, FAQ data, Inclusions) must have an validated translated counterpart to guarantee high luxury presentation values in both languages.

---

## 7. SEO, Structured Metadata & Open Graph Blueprint

To maintain exceptional organic search rankings, the CMS enforces high-fidelity metadata modeling.

```json
{
  "seo_metadata": {
    "title_en": "Orange Bay Royal Cruise | MAS Private Yacht Charters",
    "title_ar": "رحلة أورنج باي الملكية | حجز يخوت خاصة مصر",
    "meta_description_en": "Experience a luxury private yacht voyage to Orange Bay with a gourmet lobster dinner and a private marine biologist. Book our royal bespoke cruise today.",
    "meta_description_ar": "استمتع برحلة يخت خاصة فاخرة إلى أورنج باي مع عشاء فاخر ودليل بحري مخصص. احجز رحلتك الملكية اليوم.",
    "canonical_url": "https://mas.agency/tours/orange-bay-royal-cruise",
    "robots_directives": "index, follow, max-image-preview:large, max-snippet:-1",
    "structured_data_schema": {
      "@context": "https://schema.org",
      "@type": "TravelTour",
      "name": "Orange Bay Royal Cruise",
      "description": "Experience luxury private yacht charters on the Red Sea...",
      "provider": {
        "@type": "TravelAgency",
        "name": "MAS Agency",
        "url": "https://mas.agency"
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": "150.00",
        "highPrice": "1200.00"
      }
    }
  }
}
```

---

## 8. Forms Builder Architecture

The Forms Engine empowers staff to dynamically inject custom input captures on various page blocks without touching code.

```
       [ Form Configuration Schema ]
                     │
                     ▼
          [ Dynamic Render Engine ]
  (Generates HTML5 styled inputs, validations)
                     │
                     ▼
        [ Akismet / hCaptcha Security ]
                     │
                     ▼
             [ Submissions DB ]
                     │
                     ├─► Alert Customer Support Desk
                     └─► Trigger CRM Campaign Workflows
```

### 8.1 Example Dynamic Form Field Spec
```json
{
  "form_id": "frm_private_helicopter_inquiry",
  "fields": [
    {
      "id": "fld_guest_fullname",
      "type": "text",
      "required": true,
      "placeholder": { "en": "Lord / Lady Full Name", "ar": "الاسم الكامل الكريم" }
    },
    {
      "id": "fld_charter_date",
      "type": "date",
      "required": true,
      "validation_rules": { "minimum_days_out": 3 }
    }
  ]
}
```

---

## 9. Menu & Visual Navigation Builder Specification

Navigation elements are not hardcoded inside the front-end layouts. The main navigation, mobile drawers, and footer site maps are fed from the CMS API as interactive trees.

### 9.1 Menu Entity Model Struct
```json
{
  "menu_code": "main_header_navigation",
  "items": [
    {
      "label": { "en": "Charter Yachts", "ar": "حجز اليخوت" },
      "action_type": "link",
      "target_value": "/tours/yachts",
      "children": [
        {
          "label": { "en": "Royal Sunseeker 75", "ar": "يخت صنسيكر الملكي" },
          "action_type": "link",
          "target_value": "/tours/sunseeker-75"
        }
      ]
    },
    {
      "label": { "en": "Interactive Map", "ar": "الخريطة التفاعلية" },
      "action_type": "anchor",
      "target_value": "#interactive-navigator"
    }
  ]
}
```

---

## 10. Granular CMS User Permission Matrix

The Content Management system restricts editing privileges based on strict team workflows to prevent unauthorized data updates.

| User Role | Manage Tours | Publish Tours | Upload Media | Translate Fields | Configure SEO | Edit Global Navigation |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **System Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Operations Manager**| ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Content Editor** | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Translator** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Marketing Agent** | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |

---

## 11. Structured Content Versioning Strategy

To prevent operational downtime due to editing errors, the CMS maintains historical snapshots of all content schemas.

- **Incremental Edits:** Every update to a tour, article, or static block increments the model `version` integer by `1`.
- **Differential Engine (Git-style Diff):** The database logs before-and-after states in the `system_audit_logs`.
- **One-Click Rollback:** Administrators can choose any historical audit record and restore its values with a single dashboard action, instantly publishing the older version and creating an rollback audit trace.

---

## 12. Backup, Recovery & System Restore Strategy

Content structures, dynamic layouts, and CMS configurations require rigorous backup processes to preserve business continuity.

### 12.1 Backup Policy
- **Automated Hourly Snaps:** Real-time incremental database backups are executed on secure, distributed cloud buckets.
- **Complete Daily Dumps:** Full system database dumps (including complete media registry catalogs) are compiled every night at 02:00 UTC (Egyptian Low-Load time).
- **Point-in-Time Recovery (PITR):** Transaction logs are retained for **30 days**, allowing administrators to restore the entire CMS database to any exact second of operations.

---

## 13. DXP Performance Optimization Plan

The CMS is architected for maximum speed and excellent core web vitals:

- **Incremental Static Regeneration (ISR):** Public pages are pre-rendered at build time. When content is updated in the CMS, a webhook revalidates only the affected route on the CDN edge, keeping page loads ultra-fast without stale content issues.
- **Edge Caching Engine:** Content queries are cached on Cloudflare Edge Nodes close to the user, ensuring sub-50ms response times globally.
- **Brotli Compression:** All API JSON responses are compressed with high Brotli settings to minimize bandwidth consumption.

---

## 14. CMS Headless API Specifications

The CMS exposes clean RESTful endpoints secured by scoped API keys.

### 14.1 Get Published Tours List
- **Route:** `GET /api/v1/cms/tours`
- **Headers:** `Authorization: Bearer mas_live_...`
- **Query Parameters:** `?lang=en&status=published&category=yachts&limit=10&page=1`
- **Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "uuid": "7a3b2b11-921c-4bde-a8fd-0291cc88bc11",
      "slug": "orange-bay-royal-cruise",
      "title": "Orange Bay Royal Cruise",
      "duration_minutes": 480,
      "price_usd": 450.00,
      "featured_image": "https://cdn.mas.agency/tours/orange_bay_hero.webp"
    }
  ],
  "metadata": {
    "pagination": {
      "total_records": 1,
      "current_page": 1,
      "total_pages": 1,
      "page_size": 10
    },
    "timestamp": "2026-07-02T07:15:00Z",
    "request_id": "req_881a2991bc7"
  }
}
```

---

## 15. Administrator UX & Control Center Design

The MAS Admin dashboard delivers a pristine workspace designed for efficient content management, pairing Inter typography with high-contrast slate layouts.

### 15.1 Core Dashboard Screens

#### 1. The Global Workspace (Overview)
- A high-level view showing active translation progress gauges, pending approval lists, and real-time media storage metrics. Includes quick-action shortcuts for editing top tours or drafting blog articles.

#### 2. Visual Layout Board (Page Builder)
- An intuitive drag-and-drop workspace where administrators compile dynamic pages using the structural block library. Live side-by-side bilingual previews let editors see changes instantly.

#### 3. Structured Content Sheets
- Focused, form-based workspaces for managing structured details for tours, hotels, and pickup locations. Structured fields enforce clean input validation (e.g. coordinates must be valid decimals, slugs must be lowercase URL-safe).

#### 4. The Unified Media Hub (DAM)
- A modern visual media explorer to manage images, videos, and documents with nested directories. Highlights asset metadata, tags, alt text, and automatically generated WebP optimization logs.

---
*CMS Architecture Certified for Multi-Channel Enterprise Delivery.*
