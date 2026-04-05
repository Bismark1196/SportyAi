// pages/api/debug-login.ts - TEMPORARY, delete after fixing
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Always return JSON, never crash
  res.setHeader('Content-Type', 'application/json');

  const results: any = {
    timestamp: new Date().toISOString(),
  };

  // 1. Check every env var
  const dbUrl = process.env.DATABASE_URL || '';
  const directUrl = process.env.DIRECT_URL || '';

  results.env = {
    DATABASE_URL_SET: !!dbUrl,
    DATABASE_URL_STARTS_WITH: dbUrl.slice(0, 50) || 'NOT SET',
    DATABASE_URL_VALID_PREFIX: dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'),
    DATABASE_URL_HAS_CHANNEL_BINDING: dbUrl.includes('channel_binding'),
    DIRECT_URL_SET: !!directUrl,
    DIRECT_URL_STARTS_WITH: directUrl.slice(0, 50) || 'NOT SET',
    JWT_SECRET_SET: !!process.env.JWT_SECRET,
    JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length || 0,
    ANTHROPIC_KEY_SET: !!process.env.ANTHROPIC_API_KEY,
    ANTHROPIC_KEY_VALID: process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-') || false,
    SETUP_SECRET_SET: !!process.env.SETUP_SECRET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  };

  // 2. Try DB connection with timeout
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    await Promise.race([
      prisma.$queryRaw`SELECT 1 as ping`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout after 8s')), 8000))
    ]);
    
    results.db = { connected: true };

    // Count records
    try {
      const userCount = await prisma.user.count();
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { email: true, isActive: true, createdAt: true }
      });
      const promoTotal = await prisma.promoCode.count();
      const promoUnused = await prisma.promoCode.count({ where: { isUsed: false } });

      results.db.userCount = userCount;
      results.db.adminUser = adminUser || 'NOT FOUND — call /api/admin/seed';
      results.db.promoCodes = { total: promoTotal, unused: promoUnused };
    } catch (qErr: any) {
      results.db.queryError = qErr?.message;
    }

    await prisma.$disconnect();
  } catch (connErr: any) {
    results.db = {
      connected: false,
      error: connErr?.message,
      code: connErr?.code,
      hint: dbUrl.includes('channel_binding')
        ? 'Remove &channel_binding=require from DATABASE_URL'
        : !dbUrl.startsWith('postgresql://')
        ? 'DATABASE_URL must start with postgresql://'
        : !process.env.DIRECT_URL
        ? 'Add DIRECT_URL env var (non-pooled Neon connection string)'
        : 'Check your Neon dashboard - database may be paused',
    };
  }

  // 3. Diagnose and give fix instructions
  const issues: string[] = [];
  if (!results.env.DATABASE_URL_VALID_PREFIX) issues.push('DATABASE_URL has wrong format');
  if (results.env.DATABASE_URL_HAS_CHANNEL_BINDING) issues.push('Remove &channel_binding=require from DATABASE_URL');
  if (!results.env.DIRECT_URL_SET) issues.push('DIRECT_URL not set in Vercel env vars');
  if (!results.env.JWT_SECRET_SET) issues.push('JWT_SECRET not set');
  if (!results.env.ANTHROPIC_KEY_VALID) issues.push('ANTHROPIC_API_KEY is invalid (must start with sk-ant-)');
  if (!results.db?.connected) issues.push('Database not connecting - see db.hint above');

  results.issues = issues.length ? issues : ['No issues detected'];
  results.status = issues.length === 0 && results.db?.connected ? 'ALL OK' : 'ISSUES FOUND';

  return res.status(200).json(results);
}
