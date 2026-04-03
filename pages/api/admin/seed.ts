// pages/api/admin/seed.ts
// One-time setup endpoint to create the first admin user and seed promo codes.
// IMPORTANT: Delete or disable this file after first use in production!
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { hashPassword } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  // Only allow in setup mode (pass secret via body)
  const { setupSecret } = req.body;
  if (setupSecret !== process.env.SETUP_SECRET) {
    return res.status(403).json({ message: 'Invalid setup secret' });
  }

  try {
    // Create admin user
    const existing = await prisma.user.findUnique({ where: { email: process.env.ADMIN_EMAIL || 'admin@betai.app' } });
    
    let adminUser;
    if (!existing) {
      adminUser = await prisma.user.create({
        data: {
          email: process.env.ADMIN_EMAIL || 'admin@betai.app',
          password: await hashPassword(process.env.ADMIN_PASSWORD || 'Admin@123!'),
          name: 'BetAI Admin',
          role: 'ADMIN',
          promoCodeUsed: 'SEED',
        },
      });
    } else {
      adminUser = existing;
    }

    // Seed some initial promo codes
    const seedCodes = [
      'BETAI-LAUNCH-2025',
      'BETAI-VIP-MEMBER',
      'BETAI-PREMIUM-01',
      'BETAI-STARTER-A1',
      'BETAI-WINNER-001',
    ];

    const created = [];
    for (const code of seedCodes) {
      try {
        const promo = await prisma.promoCode.create({ data: { code, plan: 'MONTHLY' } });
        created.push(promo.code);
      } catch {
        // Already exists, skip
      }
    }

    return res.status(200).json({
      success: true,
      admin: { email: adminUser.email, role: adminUser.role },
      promoCodes: created,
      message: 'Setup complete! Delete /api/admin/seed.ts after use.',
    });
  } catch (err) {
    console.error('Seed error:', err);
    return res.status(500).json({ message: 'Seed failed', error: String(err) });
  }
}
