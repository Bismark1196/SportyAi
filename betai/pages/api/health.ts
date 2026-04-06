// pages/api/health.ts
// Visit /api/health after deployment to confirm DB + env are connected.
// REMOVE THIS FILE once everything is working.
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const checks: Record<string, string> = {};

  // Check env vars (never expose actual values)
  checks['DATABASE_URL'] = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.startsWith('postgresql://') || process.env.DATABASE_URL.startsWith('postgres://')
      ? '✅ Looks valid'
      : '❌ Wrong format — must start with postgresql:// or postgres://'
    : '❌ Missing';

  checks['JWT_SECRET'] = process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32
    ? '✅ Set'
    : '❌ Missing or too short (need 32+ chars)';

  checks['ANTHROPIC_API_KEY'] = process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-')
    ? '✅ Looks valid'
    : '❌ Wrong — must start with sk-ant-... (get it from platform.claude.com → API Keys)';

  checks['SETUP_SECRET'] = process.env.SETUP_SECRET ? '✅ Set' : '❌ Missing';
  checks['ADMIN_EMAIL'] = process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Missing';
  checks['RAPIDAPI_KEY'] = process.env.RAPIDAPI_KEY && process.env.RAPIDAPI_KEY !== 'your-rapidapi-key'
    ? '✅ Set'
    : '⚠️ Not set (mock data will be used)';

  // Check DB connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks['DB_CONNECTION'] = '✅ Connected';

    const codeCount = await prisma.promoCode.count();
    const unusedCount = await prisma.promoCode.count({ where: { isUsed: false } });
    checks['PROMO_CODES'] = `✅ ${codeCount} total, ${unusedCount} unused`;

    const userCount = await prisma.user.count();
    checks['USERS'] = `✅ ${userCount} registered`;
  } catch (err: any) {
    checks['DB_CONNECTION'] = `❌ Failed: ${err?.message}`;
    checks['PROMO_CODES'] = '❌ Cannot check (DB not connected)';
    checks['USERS'] = '❌ Cannot check (DB not connected)';
  }

  const allOk = Object.values(checks).every(v => v.startsWith('✅'));
  return res.status(allOk ? 200 : 500).json({ status: allOk ? 'ok' : 'issues_found', checks });
}
