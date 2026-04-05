// pages/api/debug-login.ts
// TEMPORARY - delete after fixing. Shows exact DB error.
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const results: any = {};

  // 1. Check env vars
  results.DATABASE_URL_SET = !!process.env.DATABASE_URL;
  results.DATABASE_URL_PREFIX = process.env.DATABASE_URL?.slice(0, 40) + '...';
  results.JWT_SECRET_SET = !!process.env.JWT_SECRET;

  // 2. Try raw DB connection
  try {
    await prisma.$queryRaw`SELECT 1 as ping`;
    results.DB_CONNECT = 'SUCCESS';
  } catch (err: any) {
    results.DB_CONNECT = 'FAILED';
    results.DB_ERROR = err?.message;
    results.DB_CODE = err?.code;
    return res.status(500).json(results);
  }

  // 3. Try to count users
  try {
    const count = await prisma.user.count();
    results.USER_COUNT = count;
  } catch (err: any) {
    results.USER_COUNT_ERROR = err?.message;
  }

  // 4. Try to find admin user specifically
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { email: true, role: true, isActive: true, createdAt: true },
    });
    results.ADMIN_USER = admin || 'NOT FOUND - run /api/admin/seed first';
  } catch (err: any) {
    results.ADMIN_USER_ERROR = err?.message;
  }

  // 5. Count promo codes
  try {
    const promos = await prisma.promoCode.count();
    const unused = await prisma.promoCode.count({ where: { isUsed: false } });
    results.PROMO_CODES = { total: promos, unused };
  } catch (err: any) {
    results.PROMO_CODE_ERROR = err?.message;
  }

  return res.status(200).json(results);
}
