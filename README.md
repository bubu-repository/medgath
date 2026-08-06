# BUBU 30 RSVP & Check-in App

A production-ready event RSVP and QR code check-in system built with Next.js, Supabase, and glassmorphic design.

## Features

### Guest Experience

- **Separate landing pages** (`/media`, `/rsvp`) with event-specific forms
- **Dynamic ticket generation**: 5-character codes + scannable QR codes
- **Duplicate detection**: Exact email + phone match prevents double registration; partial mismatches rejected
- **Ticket download**: PNG with integrated quiet zone for mobile scanning
- **Backup code entry**: Manual code readable at the door if QR fails

### Organizer Experience

- **Passcode-gated dashboard** (`/admin`): httpOnly cookie auth
- **Unified guest list**: Filter by event, search by name/email/code/company
- **Live check-in stats**: Count of RSVPs vs arrivals
- **Dual-mode scanner** (`/admin/scan`):
  - QR camera (device camera via `@yudiel/react-qr-scanner`)
  - Manual code input (hand-typed fallback)
- **Smart duplicate scan handling**: Warns if guest already checked in

### Design

- **Light glassmorphism theme** with event-specific accent colors
- **Soft gradient backgrounds** echoing poster chrome/orange tones
- **Poster-inspired markers**: Square (date), circle (time), triangle (venue)
- **Mobile-optimized**: Responsive layouts, touch-friendly inputs

## Quick Start

### 1. Local Setup

```bash
git clone https://github.com/bubu-repository/medgath.git
cd bubu-events
npm install
cp .env.local.example .env.local
# Edit .env.local with Supabase URL, key, and admin passcode
```

### 2. Database

In Supabase SQL Editor:
1. Run `supabase/schema.sql`
2. Run `supabase/migrations/002_phone_unique.sql`

### 3. Run Dev Server

```bash
npm run dev
# Open http://localhost:3000
```

**Test logins:**
- Guest: `/media` or `/rsvp`
- Admin: `/admin` with passcode from `.env.local`

## Deployment

See [VERCEL_SETUP.md](VERCEL_SETUP.md) for Vercel deployment.

## Tech Stack

- Next.js 16 (App Router), React, TypeScript, Tailwind CSS 4
- Supabase (PostgreSQL) with Row-Level Security
- `qrcode.react`, `@yudiel/react-qr-scanner`, `nanoid`

## Security

- **No public DB access**: All queries server-side with service-role key
- **Admin auth**: httpOnly, sameSite cookie; re-checked per request
- **Duplicate prevention**: Database constraints + guarded updates

## Before Going Live

- [ ] Change `ADMIN_PASSCODE` to strong, unique value
- [ ] Delete test guests from Supabase
- [ ] Test RSVP, QR, and scanner with real device
- [ ] Set custom domain in Vercel
- [ ] Enable Supabase backups
- [ ] Share `/media` and `/rsvp` links privately only
- [ ] Contact: widi@bubu.com for questions
