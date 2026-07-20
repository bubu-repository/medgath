# Vercel Deployment Setup

This guide covers deploying the BUBU 30 RSVP app to Vercel.

## 1. Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com)
2. Sign in or create an account
3. Click "Add New…" → "Project"
4. Select "Import Git Repository"
5. Paste: `https://github.com/bubu-repository/medgath.git`
6. Click "Import"

## 2. Configure Environment Variables

In the Vercel project settings, add these variables under "Settings" → "Environment Variables":

| Key | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xisxqxevwxfmqxotxjxn.supabase.co` | From your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpc3hxeGV2d3hmbXF4b3R4anhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDUwMDgzNiwiZXhwIjoyMTAwMDc2ODM2fQ.9PCo8mAVIRtmd2DlVLqCNuUNZJOYSo0G79HQgoiXHSw` | Found in Supabase Settings → API |
| `ADMIN_PASSCODE` | `bubu-medgath` | Change this to a strong passphrase before going live |

Set these for **Production** and **Preview** environments.

## 3. Build Settings (should auto-detect)

Vercel auto-detects Next.js. Confirm these are correct:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm ci` (auto-detected)

## 4. Custom Domain (optional)

1. Go to "Settings" → "Domains"
2. Click "Add"
3. Enter your domain (e.g., `rsvp.bubu.com`)
4. Follow DNS configuration instructions for your registrar

## 5. Analytics & Monitoring (optional)

- Enable "Speed Insights" in Settings for performance monitoring
- Enable "Web Analytics" for traffic data

## 6. Deploy

Once environment variables are set:

1. Click "Deploy"
2. Wait for build to complete (~1–2 min)
3. Vercel provides a live URL (e.g., `medgath.vercel.app`)

## Live Routes After Deploy

- Guest RSVP: `https://medgath.vercel.app/media` and `/bubu30`
- Ticket lookup: `https://medgath.vercel.app/ticket/[code]`
- Admin login: `https://medgath.vercel.app/admin`
- Admin scan: `https://medgath.vercel.app/admin/scan`

## Security Checklist Before Going Live

- [ ] Change `ADMIN_PASSCODE` to a strong, unique passphrase
- [ ] Verify Supabase RLS policies are active (table `guests` has RLS enabled)
- [ ] Test admin login and scanner with a real guest in production
- [ ] Verify QR codes scan correctly from the live site
- [ ] Add custom domain to route links through your own domain
- [ ] Set up Supabase backups or enable automated snapshots

## Rollback

If you need to revert:

1. Go to "Deployments" tab
2. Find the previous successful deployment
3. Click "…" → "Promote to Production"

## Redeploy After Code Changes

Push to `main` branch and Vercel automatically rebuilds and deploys within 30 seconds.

```bash
git push origin main
```

Check deployment status in the Vercel dashboard under "Deployments".
