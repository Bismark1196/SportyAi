// pages/api/auth/verify-promo.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Promo code is required' });

  // Normalize: uppercase and strip whitespace
  const normalizedCode = String(code).trim().toUpperCase();

  try {
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: normalizedCode },
    });

    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found. Check the code and try again.' });
    }
    if (promoCode.isUsed) {
      return res.status(400).json({ message: 'This promo code has already been used.' });
    }
    if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
      return res.status(400).json({ message: 'This promo code has expired.' });
    }

    return res.status(200).json({ valid: true, plan: promoCode.plan, message: 'Promo code verified!' });
  } catch (err: any) {
    console.error('verify-promo error:', err?.message || err);
    if (err?.message?.includes('connect') || err?.code === 'P1001' || err?.code === 'P1002') {
      return res.status(503).json({ message: 'Promo verification is temporarily unavailable.' });
    }
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}
