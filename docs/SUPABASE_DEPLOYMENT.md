# Supabase Production Deployment Setup

## GitHub Actions Secrets Required

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

1. **SUPABASE_PROJECT_REF**
   - Your Supabase project reference ID
   - Find it in: Supabase Dashboard → Settings → General → Reference ID
   - Example: `abcdefghijklmnop`

2. **SUPABASE_DB_PASSWORD**
   - Your database password
   - Find it in: Supabase Dashboard → Settings → Database → Connection string
   - This is the password you set when creating the project

3. **SUPABASE_ACCESS_TOKEN**
   - Personal access token for Supabase CLI
   - Generate at: https://supabase.com/dashboard/account/tokens
   - Click "Generate new token" and give it a descriptive name

## How it Works

The GitHub Action will:
- Trigger automatically when migrations are pushed to main
- Can also be triggered manually via GitHub Actions tab
- Link to your production Supabase project
- Push all pending migrations to production

## Manual Deployment (Alternative)

If you prefer to deploy manually from your local machine:

```bash
# Link to production (one-time setup)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push schema to production
npx supabase db push --password YOUR_DB_PASSWORD
```

## Vercel Environment Variables

Make sure your Vercel project has these environment variables set for production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`