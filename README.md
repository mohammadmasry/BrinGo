# Bringo

Bringo is a student-run, peer-to-peer delivery service for Pfarrkirchen and the surrounding area (about a 5 km radius). Customers order small deliveries such as documents, groceries or parcels. Verified university students pick them up and bring them over, usually in about 25 minutes.

This repository holds the working prototype. It has a React web app for customers, couriers and business partners, an AI ordering assistant, and an Express/Prisma API. It started as a student software project at the European Campus Rottal-Inn (THD).

## Features

**Customers**
- Create a delivery: pickup, drop-off, item size (S/M/L), number of stores and items, and time
- Order now, schedule a 2-hour time slot, or pay extra for express delivery
- **Easy Order**: a chat assistant that takes orders in plain German or English, by text, voice (browser speech recognition) or photo
- Follow the active order on a live map (Leaflet), with order history

**Couriers**
- Onboarding and login for verified students
- Home screen with incoming orders and an active-delivery view

**Business partners**
- Application form for shops and companies that want to work with Bringo

**Accessibility and UX**
- German / English toggle (German by default)
- Adjustable text size, plus a larger-text "
- Animated page transitions and an error boundary
- Remembers the last page so users come back to where they left off

**Presentation tools**
- `/prototype`: a dashboard for demoing the prototype
- `/calculator`: a profit and loss calculato

## Pricing logic

Pricing lives in `src/lib/pricing.ts` and has unit tests in `src/lib/pricing.test.ts`.

| Component | Rule |
| --- | --- |
| Base price | S €5.00 · M €6.00 · L €7.50 |
| Distance | +€0.00 under 1 km, rising to +€2.00 at 5 km and above |
| Extra stores | 2 stores +€2.00 · 3 stores
| Item count | 6–15 items +€1.00 · 16+ items +€2.50 |
| Time slot | 14–16 h −10 % · 16–18 h −5 % ·normal |
| Peak hours (no slot picked) | 12–14 h and 17–20 h +€0.50 |
| Express | +€10.00 |

Distance comes from GPS coordinates (haversine formula) for known Pfarrkirchen addresses, with an estimate for other
addresses.

Delivery zones (`src/lib/zones.ts`) set whicd:

| Zone | Postcodes | Delivery days |
| --- | --- | --- |
| Pfarrkirchen | 84347 | Every day |
| Bad Birnbach | 84364 | Mon, Wed, Sat |
| Eggenfelden / Postmünster | 84307, 84389 |

## AI assistant

The Easy Order chat (`src/lib/groq.ts`) uses the [Groq API](https://groq.com):

- **Chat and order detection:** `llama-3.3-70b-versatile` answers questions about Bringo. It pulls out pickup,
drop-off, item and size, and suggests the ch
- **Image understanding:** `llama-4-scout-17b-16e-instruct` describes a photo of the item so the right size can be picked.

When the model detects an order, the order form is filled in for the customer to confirm. Conversations can be stored through the backend (`/api/conversations`).

## Deployment

Deployed with Vercel. The frontend is a static Vite build with SPA rewrites, and the backend runs as a
serverless function (`backend/api/index.ts`)est to `main`, GitHub Actions runs a typecheck, the tests and a production build.

## Team

Built by Anastasiia Bulatkina, Mohammad El Masri and Leen Hassan as a student project at the European Campus Rottal-Inn, Pfarrkirchen.
