<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Database: RLS on new tables

Prisma has no concept of Row Level Security — every table this project creates lives in Supabase's `public` schema, which Supabase auto-exposes via its PostgREST REST API to anyone holding the anon key, regardless of whether the app uses it. Any migration that runs `CREATE TABLE` must also enable RLS on it in the same migration:

```sql
ALTER TABLE "TableName" ENABLE ROW LEVEL SECURITY;
```

No policies are needed — the app connects via Prisma as the `postgres` role, which owns every table and bypasses RLS regardless, so this only blocks the public REST API. Forgetting this step is why the Supabase security advisor keeps flagging a "new" critical RLS issue after every feature that adds a table.
