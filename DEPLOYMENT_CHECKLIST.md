# BUBU 30 RSVP App — Deployment Checklist

Complete this before going live on July 31st, 2026.

## ✅ Pre-Deployment (This Week)

- [ ] **Test full flow end-to-end**
  - [ ] Register on `/media` → get ticket → download QR
  - [ ] Register on `/rsvp` → fill Bubu era + contribution → get ticket
  - [ ] Duplicate test: re-register with same email+phone → see original ticket
  - [ ] Mismatch test: same email, different phone → see error
  - [ ] Invalid ticket: `/ticket/XXXXXX` → see 404 page

- [ ] **Admin dashboard test**
  - [ ] Login to `/admin` with passcode
  - [ ] View guest list (should show registrations)
  - [ ] Filter by event (Media / BUBU 30 / All)
  - [ ] Search by name, email, code, company
  - [ ] Click "Scan Ticket" → go to `/admin/scan`

- [ ] **Scanner test** (if on device with camera)
  - [ ] Generate test QR on `/ticket/T3ST7`
  - [ ] Point phone camera at QR
  - [ ] Scanner reads → shows check-in success
  - [ ] Scan same code again → shows "already checked in" warning
  - [ ] Manual code input: type `T3ST7` → same check-in result

- [ ] **Mobile test** (375px viewport)
  - [ ] Form fields readable, not cramped
  - [ ] QR code downloads at high quality
  - [ ] Admin list scrolls horizontally without breaking
  - [ ] Camera scanner doesn't crop QR

- [ ] **Delete test data from Supabase**
  - [ ] SQL: `DELETE FROM public.guests WHERE event_type IN ('media', 'bubu30')`

## ✅ Supabase Final Setup

- [ ] Run both SQL migrations in Supabase SQL Editor:
  ```
  ✓ supabase/schema.sql
  ✓ supabase/migrations/002_phone_unique.sql
  ```

- [ ] Verify RLS is enabled: Supabase Dashboard → guests table → RLS toggle **ON**

- [ ] Set up automated backups:
  - [ ] Supabase Dashboard → Backups → Enable automated backups (daily)

- [ ] (Optional) IP restriction:
  - [ ] Supabase Dashboard → Auth → IP Restriction → Add Vercel IP if known

## ✅ Vercel Deployment

1. **Connect GitHub:**
   - [ ] Visit vercel.com → Add New → Project
   - [ ] Import: `https://github.com/bubu-repository/medgath.git`
   - [ ] Confirm Next.js detected

2. **Set Environment Variables:**
   - [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://xisxqxevwxfmqxotxjxn.supabase.co`
   - [ ] `SUPABASE_SERVICE_ROLE_KEY` = (from Supabase Settings → API)
   - [ ] `ADMIN_PASSCODE` = (CHANGE THIS to new strong passphrase)
   - [ ] Set for **Production** and **Preview**

3. **Deploy:**
   - [ ] Click "Deploy"
   - [ ] Wait ~1–2 min for build to complete
   - [ ] Note the live URL (e.g., `medgath.vercel.app`)

4. **Verify Live:**
   - [ ] https://medgath.vercel.app/media → form works
   - [ ] https://medgath.vercel.app/admin → login works
   - [ ] Test RSVP on live URL (will create real database record)

## ✅ Custom Domain (Optional but Recommended)

- [ ] Vercel: Settings → Domains → Add `rsvp.bubu.com`
- [ ] Point DNS to Vercel CNAME
- [ ] Verify SSL auto-enabled

## ✅ Distribution

- [ ] **Final links ready:**
  - [ ] Media: `https://medgath.vercel.app/media` (or custom domain)
  - [ ] BUBU 30: `https://medgath.vercel.app/rsvp`
  - [ ] Admin: `https://medgath.vercel.app/admin` (share passcode separately)

- [ ] Share links privately via email/WhatsApp only (not public)

- [ ] **Create backup links:**
  - [ ] Short URLs via bit.ly or custom (in case domain fails)
  - [ ] Example: `medgath.vercel.app` or custom domain

## ✅ Day Before (July 30th)

- [ ] Test admin login again with new passcode
- [ ] Verify Supabase is up (curl to database)
- [ ] Check Vercel deployment status
- [ ] Do a final RSVP test (will create a real guest)
- [ ] Brief door staff on scanner app workflow

## ✅ Day Of (July 31st)

- [ ] **Morning:**
  - [ ] Verify Vercel is live
  - [ ] Test one more RSVP
  - [ ] Load `/admin/scan` on a device with camera

- [ ] **Before guests arrive (5:30 PM):**
  - [ ] Door staff has admin login + passcode
  - [ ] Someone has backup phone/tablet with scanner open
  - [ ] Network/WiFi available for both devices
  - [ ] Manual code entry works if camera fails (paper backup list)

- [ ] **During event:**
  - [ ] Check in guests via `/admin/scan`
  - [ ] Keep `/admin` dashboard open for real-time stats
  - [ ] If camera fails, fall back to manual code input

## ✅ Post-Event

- [ ] Export guest list from `/admin` for records
- [ ] SQL: `SELECT * FROM guests WHERE check_in_status = true` (who showed up)
- [ ] Archive Supabase backup (Supabase → Backups → download)
- [ ] Gather feedback from door staff on scanner UX

## 🚨 Emergency Contacts

- **Supabase down**: https://status.supabase.com (live status page)
- **Vercel down**: https://status.vercel.com
- **Forgotten passcode**: Deploy new version with new `ADMIN_PASSCODE` (~1 min)
- **App crashed**: Roll back to previous Vercel deployment (Deployments tab)
- **Scanner camera won't work**: Use manual code input fallback

## 📋 Troubleshooting Checklist

**RSVP form won't submit**
- [ ] Check browser console for errors (F12)
- [ ] Verify internet connection
- [ ] Try a different browser

**Scanner camera access denied**
- [ ] Grant camera permission in browser settings
- [ ] Try a different device
- [ ] Use manual code input as fallback

**Guest can't find their ticket**
- [ ] Check confirmation email (should have `/ticket/[code]` link)
- [ ] Admin can look them up in guest list by name/email
- [ ] If not in list, they may not have completed RSVP (try again)

**Admin login doesn't work**
- [ ] Verify passcode is EXACTLY correct (case-sensitive)
- [ ] Clear browser cookies (F12 → Storage → Cookies)
- [ ] Try incognito window

**QR code won't scan**
- [ ] Ensure phone has good lighting
- [ ] Try holding QR at different angles
- [ ] Use manual code input instead (`T3ST7` format)

**Duplicate check-in warning**
- [ ] This is expected behavior (guest already arrived)
- [ ] Door staff should acknowledge and let them in

## ✅ Success Metrics

- [ ] 0 form submission errors from guests
- [ ] Scanner reads QR in <2 sec in good light
- [ ] Manual code input works as fallback
- [ ] Admin dashboard stays responsive with 100+ guests
- [ ] All guests checked in successfully

---

**Questions?** Contact widi@bubu.com
