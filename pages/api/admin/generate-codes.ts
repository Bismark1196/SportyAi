// pages/api/admin/generate-codes.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

function generateCode(plan: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const prefix = plan.slice(0, 2).toUpperCase();
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) suffix += '-';
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `BETAI-${prefix}-${suffix}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const token = req.cookies['betai_token'];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  const session = await verifyToken(token);
  if (!session || session.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  const { plan = 'MONTHLY', count = 1 } = req.body;
  const safeCount = Math.min(Math.max(1, Number(count)), 50);

  try {
    const codes: string[] = [];
    for (let i = 0; i < safeCount; i++) {
      codes.push(generateCode(plan));
    }

    const promoObjects = await prisma.$transaction(
      codes.map(code =>
        prisma.promoCode.create({ data: { code, plan } })
      )
    );

    return res.status(201).json({
      codes,
      promoObjects: JSON.parse(JSON.stringify(promoObjects)),
      message: `${safeCount} promo code(s) generated`,
    });
  } catch (err) {
    console.error('Generate codes error:', err);
    return res.status(500).json({ message: 'Failed to generate codes' });
  }
}
