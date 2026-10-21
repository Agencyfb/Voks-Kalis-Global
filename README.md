# Haven — Real Estate Homepage (Next.js + JavaScript)

A homepage for a real estate platform: estates, land, shortlets and
commercial listings, built with Next.js App Router, plain JavaScript
(no TypeScript), and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```
app/
  layout.js          Root layout, loads fonts (Fraunces + Inter)
  page.js             Homepage — assembles all sections
  globals.css         Tailwind + base styles
components/
  Navbar.js           Sticky nav with mobile menu
  Hero.js             Headline, search bar, image stack
  Categories.js        Estates / Land / Shortlets / Commercial quick-nav
  PropertyCard.js      Reusable listing card (used everywhere)
  FeaturedProperties.js  Curated grid of featured listings
  CategorySection.js   Generic "listings by category" section
  TrustBand.js         Verification process / trust signals
  Footer.js            Contact + sitemap
data/
  properties.js         Mock listings + helpers (formatPrice, getFeatured, getByCategory)
```

## Wiring up real data

Everything reads from `data/properties.js`. Swap `PROPERTIES` for a real
fetch (e.g. inside a Server Component, or via `fetch()` to your API/CMS)
and every component keeps working unchanged, since they all consume the
same shape:

```js
{
  id, title, category, purpose, price, currency, period,
  location, beds, baths, areaSqm, image, featured, verified
}
```

- `category`: one of `estates | land | shortlets | commercial`
- `purpose`: one of `sale | rent | shortlet` (drives the badge color)

## Design notes

- Palette: forest green (`#17392E`) + brass gold (`#C9A227`) + warm sand/cream,
  with terracotta clay as a sparing accent — steering away from the generic
  cream-and-terracotta AI look by keeping green as the dominant identity.
- Type: **Fraunces** (display serif, used italic in the hero) paired with
  **Inter** (body/UI).
- Signature element: the overlapping, slightly rotated photo stack in the
  hero, echoing a property brochure rather than a single hero banner.
- Accessible by default: visible focus rings, `prefers-reduced-motion`
  respected, semantic headings throughout.

## Next steps you'll likely want

- A `/property/[id]` detail page (route already implied by "View details" links)
- Real image hosting (currently using Unsplash URLs as placeholders —
  swap the `images.remotePatterns` in `next.config.mjs` for your CDN)
- A working contact/lead form under `#contact`
- Auth + a dashboard for the "List a property" flow

## Authentication API

The app exposes two JSON endpoints:

- `POST /api/register` — accepts `firstName`, `lastName`, `email`, `phone` and `password`.
- `POST /api/login` — accepts `email` and `password`.

Set `MONGODB_URL` in `.env` before using these endpoints. User records are
stored in MongoDB, and passwords are PBKDF2-hashed with a per-user salt.
Successful requests return a sanitized `user` object and set an HTTP-only
`haven_session` cookie. Session tokens are currently held in memory and reset
when the server restarts.

### Property file storage

Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and
`CLOUDINARY_API_SECRET` in `.env` to enable property uploads. New listing
photos are stored in Cloudinary and delivered using secure URLs. Title
documents are uploaded as authenticated Cloudinary assets; the admin review
endpoint issues short-lived download links. MongoDB stores each asset's
Cloudinary ID and metadata, not the file contents. Existing listings uploaded
before Cloudinary was configured keep their original files in MongoDB.

### Property submissions

Signed-in agents, landlords and admins can submit properties through
`POST /api/properties`. Listings are stored in MongoDB with a default
`pending` status. Admins can review and update stored listings through
`/api/admin/properties`; those endpoints require an admin session. Once an
admin approves a listing, it appears on `/marketplace`. Only currently
approved properties are shown there; declined, pending and sold listings are
excluded. Submissions require 2-10 JPG/PNG/WEBP property photos and 1-10 PDF
or image supporting documents, as well as property title and ownership details
and acceptance of the declaration. Photos and documents may total up to 8 MB.
The address displays a Google Maps preview in the submission form and a map
link on approved marketplace listings. Admins can review title details,
photos and supporting documents from the admin dashboard; supporting
documents are not exposed on public listings.

### Seed an admin account

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_FIRST_NAME`, `ADMIN_LAST_NAME` and
`ADMIN_PHONE` in `.env`, then run `npm run seed:admin`. The command creates or
updates that account with the `admin` role and hashes its password using the
same PBKDF2 settings as registration. Running it again resets the account to
the configured values. Sign in at `/login`; an admin account is sent to `/admin`.
The admin page checks the HTTP-only session and database role on the server.
