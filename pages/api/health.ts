import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  const checks = {
    database: 'down',
    auth: process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32 ? 'configured' : 'misconfigured',
    adminSetup:
      process.env.SETUP_SECRET && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD
        ? 'configured'
        : 'misconfigured',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'connected';
  } catch (err: any) {
    return res.status(503).json({
      status: 'degraded',
      checks,
      message: process.env.NODE_ENV === 'development' ? err?.message : 'Database unavailable',
      timestamp: new Date().toISOString(),
    });
  }

  const status = Object.values(checks).every((value) => value === 'configured' || value === 'connected')
    ? 'ok'
    : 'degraded';

  return res.status(status === 'ok' ? 200 : 503).json({
    status,
    checks,
    timestamp: new Date().toISOString(),
  });
}
