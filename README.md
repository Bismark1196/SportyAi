# SportyAI

SportyAI is a full-stack Next.js platform for premium football predictions. It combines subscriber-only access, admin-managed promo codes, AI-assisted match analysis, and a protected dashboard for daily picks.

## Highlights

- Next.js 14 with TypeScript and Prisma
- Cookie-based authentication with role-aware admin access
- Promo-code onboarding for controlled subscriber growth
- Prediction dashboard, stats views, and live-score support
- Deployment-ready for Vercel with a Postgres database such as Neon

## Tech Stack

- Next.js Pages Router
- React 18
- Prisma ORM
- PostgreSQL
- Tailwind CSS

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

3. Generate the Prisma client and sync the schema:

```bash
npx prisma generate
npx prisma db push
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Required Environment Variables

- `DATABASE_URL`: pooled or primary Postgres connection string
- `DIRECT_URL`: direct Postgres connection string for Prisma operations
- `JWT_SECRET`: at least 32 characters
- `SETUP_SECRET`: one-time admin bootstrap secret
- `ADMIN_EMAIL`: bootstrap admin email
- `ADMIN_PASSWORD`: bootstrap admin password
- `NEXTAUTH_URL`: public app URL

Optional provider keys:

- `FOOTBALL_DATA_API_KEY`
- `GEMINI_API_KEY`
- `GROQ_API_KEY`
- `ANTHROPIC_API_KEY`
- `RAPIDAPI_KEY`
- `THE_ODDS_API_KEY`

## Admin Bootstrap

The project includes an idempotent setup route at `/api/admin/seed` for first-time admin creation.

Send a `POST` request with:

```json
{
  "setupSecret": "your-setup-secret"
}
```

The route uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your environment. After first-time setup, rotate the setup secret or disable the endpoint in production.

## Production Notes

- Never commit populated `.env` files or real credentials.
- Use a long `JWT_SECRET` and strong admin password.
- Keep `/api/health` for uptime checks only; it now returns minimal operational status.
- Review setup surfaces before launch and disable anything you no longer need.

## Scripts

- `npm run dev`: start the local dev server
- `npm run build`: build for production
- `npm run start`: run the production build
- `npm run lint`: run the Next.js linter
