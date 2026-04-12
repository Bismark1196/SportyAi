import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { hashPassword } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { setupSecret } = req.body;
  if (!setupSecret || setupSecret !== process.env.SETUP_SECRET) {
    return res.status(403).json({ message: 'Invalid setup secret.' });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({
      message: 'ADMIN_EMAIL and ADMIN_PASSWORD must be configured before setup can run.',
    });
  }

  if (process.env.NODE_ENV === 'production' && adminPassword.length < 12) {
    return res.status(500).json({
      message: 'ADMIN_PASSWORD must be at least 12 characters in production.',
    });
  }

  try {
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
        name: 'SportyAI Admin',
        role: 'ADMIN',
        isActive: true,
        promoCodeUsed: 'SEED',
      },
    });

    const seedCodes = [
      'SPORTYAI-LAUNCH',
      'SPORTYAI-VIP',
      'SPORTYAI-PREMIUM',
      'SPORTYAI-STARTER',
      'SPORTYAI-WEEKEND',
      'SPORTYAI-TRIAL',
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
      },
      promoCodes: results,
      nextSteps: [
        '1. Sign in with the admin credentials configured in your environment variables.',
        '2. Open /admin to generate additional promo codes and manage users.',
        '3. Rotate the setup secret or disable this endpoint after first-time setup.',
      ],
    });
  } catch (err: any) {
    console.error('Seed error:', err?.message || err);
    return res.status(500).json({ message: 'Seed failed', error: err?.message || String(err) });
  }
}
