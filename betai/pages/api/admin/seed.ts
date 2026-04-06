// pages/api/admin/seed.ts
// Idempotent setup: safe to call multiple times.
// Creates/updates admin user and seeds promo codes.
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { hashPassword } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { setupSecret } = req.body;
  if (!setupSecret || setupSecret !== process.env.SETUP_SECRET) {
    return res.status(403).json({ message: 'Invalid setup secret.' });
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@betai.app').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@BetAI123!';

  try {
    // Always upsert admin — this fixes wrong passwords too
    const hashedPw = await hashPassword(adminPassword);
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedPw,
        role: 'ADMIN',
        isActive: true,
      },
      create: {
        email: adminEmail,
        password: hashedPw,
        name: 'BetAI Admin',
        role: 'ADMIN',
        isActive: true,
        promoCodeUsed: 'SEED',
      },
    });

    // Seed initial promo codes (skip if already exist)
    const seedCodes = [
      'BETAI-LAUNCH-2025',
      'BETAI-VIP-MEMBER',
      'BETAI-PREMIUM-01',
      'BETAI-STARTER-A1',
      'BETAI-WINNER-001',
      'BETAI-TEST-CODE1',
    ];

    const results: { code: string; status: string }[] = [];
    for (const code of seedCodes) {
      try {
        await prisma.promoCode.create({ data: { code, plan: 'MONTHLY' } });
        results.push({ code, status: 'created' });
      } catch {
        results.push({ code, status: 'already exists' });
      }
    }

    return res.status(200).json({
      success: true,
      admin: {
        email: adminUser.email,
        role: adminUser.role,
        loginWith: adminPassword,
      },
      promoCodes: results,
      nextSteps: [
        `1. Login at /auth/login with: ${adminEmail} / ${adminPassword}`,
        '2. Go to /admin to generate more promo codes',
        '3. Share promo codes with paying customers',
      ],
    });
  } catch (err: any) {
    console.error('Seed error:', err?.message || err);
    return res.status(500).json({ message: 'Seed failed', error: err?.message || String(err) });
  }
}
