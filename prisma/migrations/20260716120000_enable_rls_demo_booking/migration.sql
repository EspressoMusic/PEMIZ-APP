-- Every other public table already has RLS enabled (turned on by hand in the
-- Supabase dashboard). Prisma connects as the table owner ("postgres"), which
-- bypasses RLS regardless, so this only blocks the PostgREST anon/authenticated
-- API from reading this table -- it does not affect the app.
ALTER TABLE "DemoBooking" ENABLE ROW LEVEL SECURITY;
