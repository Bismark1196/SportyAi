# ⚽ BetAI — AI-Powered Football Predictions

A full-stack Next.js web app with AI-generated betting predictions, promo-code gated signup, admin dashboard, and Vercel deployment.

---

## 🗂️ Project Structure

```
betting-app/
├── pages/
│   ├── index.tsx              # Landing page
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── auth/
│   │   ├── signup.tsx         # Promo-code signup flow
│   │   └── login.tsx
│   ├── dashboard/
│   │   ├── index.tsx          # Main predictions dashboard
│   │   ├── stats.tsx          # Statistics & charts
│   │   └── history.tsx        # Prediction history
│   ├── admin/
│   │   └── index.tsx          # Admin: generate codes, manage users
│   └── api/
│       ├── auth/
│       │   ├── verify-promo.ts   # Validate promo code
│       │   ├── register.ts       # Create account
│       │   ├── login.ts          # Sign in
│       │   └── logout.ts         # Sign out
│       ├── predictions/
│       │   └── index.ts          # Fetch fixtures + AI predictions
│       └── admin/
│           ├── generate-codes.ts # Create new promo codes
│           └── seed.ts           # First-time admin setup
├── lib/
│   ├── auth.ts                # JWT auth helpers
│   ├── prisma.ts              # Prisma client singleton
│   └── sports-data.ts         # Sports API + AI prediction logic
├── styles/
│   └── globals.css
├── prisma/
│   └── schema.prisma          # Database schema
├── .env.example               # Environment variables template
├── vercel.json                # Vercel deployment config
└── next.config.js
```

---

## 🚀 Deployment Guide (Vercel + Neon DB)

### Step 1 — Set Up Database

Use **Neon** (recommended, free tier, serverless-optimized):

1. Go to [neon.tech](https://neon.tech) → Create account → New project
2. Copy the **connection string** (looks like `postgresql://user:pass@host/db?sslmode=require`)

### Step 2 — Deploy to Vercel

```bash
# 1. Push your code to GitHub
git init
git add .
git commit -m "Initial BetAI commit"
gh repo create betai --public --push

# 2. Import to Vercel
# Go to vercel.com → New Project → Import from GitHub
```

### Step 3 — Set Environment Variables in Vercel

In your Vercel project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | Random 32+ char string |
| `ANTHROPIC_API_KEY` | Your Claude API key |
| `RAPIDAPI_KEY` | API-Football key (optional) |
| `THE_ODDS_API_KEY` | The Odds API key (optional) |
| `SETUP_SECRET` | Any secret string for first setup |
| `ADMIN_EMAIL` | Your admin email |
| `ADMIN_PASSWORD` | Strong admin password |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

### Step 4 — Run Database Migrations

```bash
# Install Vercel CLI
npm i -g vercel

# Pull env vars locally
vercel env pull .env.local

# Install deps and run migrations
npm install
npx prisma generate
npx prisma db push
```

### Step 5 — First-Time Admin Setup

After deployment, call the seed endpoint **once** to create your admin account and initial promo codes:

```bash
curl -X POST https://your-app.vercel.app/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"setupSecret": "YOUR_SETUP_SECRET"}'
```

Response will include your initial promo codes. **Delete or disable `/api/admin/seed.ts` after this step!**

### Step 6 — You're Live! 🎉

- **Admin panel**: Login with your admin credentials → `/admin`
- **Generate codes**: Admin panel → Generate Promo Codes
- **Share codes** with paying customers
- Customers sign up at `/auth/signup` with their promo code

---

## 🔑 How Promo Codes Work

1. **Admin generates** codes via `/admin` panel (Daily / Weekly / Monthly / Yearly plans)
2. **You sell/share** codes to customers via WhatsApp, email, etc.
3. **Customer enters** code at signup → code is validated and marked used atomically
4. **One code = one account** — codes cannot be reused

---

## 🤖 AI Predictions

Predictions are powered by **Claude (claude-sonnet-4-20250514)**. The AI receives:
- Home/Away team names
- League and country
- Match date
- Live odds (if available)

And returns: prediction type, confidence score (50–95%), expert analysis, and betting tips.

**Caching strategy**: Predictions are stored in the database and reused for 24 hours. New predictions are only generated once per day per fixture, saving API costs.

---

## 📡 Sports Data Sources

| Source | What it provides | Cost |
|---|---|---|
| **API-Football** (primary) | Fixtures, results, stats | 100 req/day free |
| **The Odds API** (secondary) | Live odds from 40+ bookmakers | 500 req/month free |
| **Built-in mock data** (fallback) | Demo fixtures for dev/testing | Free always |

Set `RAPIDAPI_KEY` to enable real fixture data. Without it, the app uses realistic mock data.

---

## 🛠️ Local Development

```bash
# Clone and install
npm install

# Copy env template
cp .env.example .env.local
# Fill in your DATABASE_URL and other keys

# Generate Prisma client
npx prisma generate

# Push schema to DB
npx prisma db push

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔒 Security Notes

- Passwords hashed with **bcrypt** (12 rounds)
- Auth via **HTTP-only JWT cookies** (not localStorage)
- Promo code redemption is **atomic** (database transaction — no double-use)
- Admin routes protected by **role check** on every request
- All API routes validate auth tokens server-side

---

## 📱 Features Summary

| Feature | Status |
|---|---|
| Landing page | ✅ |
| Promo code signup | ✅ |
| JWT authentication | ✅ |
| AI predictions dashboard | ✅ |
| League filtering | ✅ |
| Confidence scores | ✅ |
| Statistics page + charts | ✅ |
| Prediction history | ✅ |
| Admin panel | ✅ |
| Generate promo codes | ✅ |
| User management | ✅ |
| Real-time sports data | ✅ (with API key) |
| Vercel deployment ready | ✅ |
| Mobile responsive | ✅ |

---

## ⚠️ Responsible Gambling

This platform is for entertainment purposes. Always encourage users to gamble responsibly and within their means.
# SportyAi
