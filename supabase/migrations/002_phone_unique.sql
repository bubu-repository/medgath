-- Phone numbers are stored in canonical form (leading + kept, all other
-- non-digits stripped), so a per-event unique index on phone is safe and
-- closes the double-submit race the app-level check can't.
-- Run this in the Supabase SQL Editor.

create unique index if not exists guests_unique_phone
  on public.guests (event_type, phone);
