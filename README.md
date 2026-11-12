# Bringo

Bringo is a student-run shopping and delivery service for Pfarrkirchen and Postmünster. It is aimed mainly at older people and anyone without a car, and relatives can order for them. Verified university students do the shopping in shared **shopping rounds**: one courier shops for 3–4 customers in one trip, which keeps the price low. Urgent orders get their own trip.

This repository holds the working prototype. It has a React web app for customers, couriers and business partners, an AI ordering assistant, and an Express/Prisma API. It started as a student project at the European Campus Rottal-Inn (THD).

## Features

**Customers**
- Shopping + delivery or delivery only: store / pickup, drop-off, shopping list or package size, number of stores
- Book a shopping round (Tuesday and Friday, 09:00–12:00) or pay more for an urgent delivery
- **Easy Order**: a chat assistant that takes orders in plain German or English, by text, voice (browser speech recognition) or a photo of a shopping list
- Follow the active order on a live map (Leaflet), with order history

**Couriers**
- Onboarding and login for verified students
- Home screen with incoming orders and an active-delivery view
- Couriers are employed as Minijobbers and paid by the hour (not per order)

**Business partners**
- Application form for shops and companies that want to work with Bringo

**Accessibility and UX**
- German / English toggle (German by default)
- Adjustable text size, plus a larger-text "Easy mode"
- Animated page transitions and an error boundary
- Remembers the last page so users come back to where they left off

**Presentation tools**
- `/prototype`: a dashboard for demoing the prototype
- `/calculator`: a profit and loss calculator (defaults match the pricing below, Minijob employer costs of 31 %)

## Pricing

Pricing lives in `src/lib/pricing.ts` and has unit tests in `src/lib/pricing.test.ts`.

| Option | Price |
| --- | --- |
| Shopping round (Tue & Fri, 09:00–12:00, order by 20:00 the evening before) | €8.50 per order |
| Urgent (own trip, about 45 min) | €15.00 |
| Membership (planned, not billed in the app) | €5 / month, €3 reduced |

**Why rounds:** a courier costs about €18 an hour with Minijob employer costs (€13.90 × 1.31). A dedicated trip of about 45 minutes costs about €14, so a cheap single delivery loses money. A round of 3–4 orders in about 90 minutes brings this down to about €7 per order.

## Service area

Bringo currently serves Pfarrkirchen (84347) and Postmünster (84389). The map is locked to this area: you can zoom in but not out past it. `src/lib/zones.ts` recognises other nearby towns (Bad Birnbach, Eggenfelden) so the order form can tell customers they are outside the area.

## AI assistant

The Easy Order chat (`src/lib/groq.ts`, proxied through `backend/src/routes/ai.ts` so the API key stays on the server) uses the [Groq API](https://groq.com):

- **Chat and order detection:** `llama-3.3-70b-versatile` answers questions about Bringo. It pulls out pickup, drop-off, item and size, and picks the shopping round (or urgent) the customer wants.
- **Image understanding:** `llama-4-scout-17b-16e-instruct` reads a photo of a shopping list or products and lists the items.

When the model detects an order, the order form is filled in for the customer to confirm. Conversations can be stored through the backend (`/api/conversations`).

## Deployment

Deployed with Vercel. The frontend is a static Vite build with SPA rewrites, and the backend runs as a serverless function (`backend/api/index.ts`). On every push and pull request to `main`, GitHub Actions runs a typecheck, the tests and a production build.

## Team

Built by Anastasiia Bulatkina, Mohammad El Masri and Leen Hassan as a student project at the European Campus Rottal-Inn, Pfarrkirchen.
