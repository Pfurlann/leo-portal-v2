# Deployment Guide — LEO Portal V2

## GitHub Actions CI

The CI pipeline runs on every push to `main`/`develop` and every PR.
Required GitHub Secrets (Settings → Secrets → Actions):
- `DATABASE_URL` — Supabase pooler connection string
- `DIRECT_URL` — Supabase direct connection string
- `NEXTAUTH_SECRET` — Random 32+ char secret (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — Production URL (e.g., `https://leo-portal.vercel.app`)
- `SUPABASE_URL` — `https://bqkttaflhtsdkamgscnf.supabase.co`
- `SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (keep secret!)

## Vercel Deployment

1. Go to vercel.com → New Project
2. Import `leo-portal-v2` from GitHub
3. Add all environment variables (same as GitHub Secrets above)
4. Deploy

Vercel auto-deploys:
- `main` branch → Production
- All PRs → Preview deployments

## Supabase Connection Strings

Get from: Supabase Dashboard → Project → Settings → Database → Connection String

- **Pooler (Transaction)** → use for `DATABASE_URL` (pgBouncer, port 6543)
- **Direct** → use for `DIRECT_URL` (port 5432, for migrations)
