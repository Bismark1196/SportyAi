// pages/api/auth/verify-promo.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Promo code is required' });

  try {
    const promoCode = await prisma.promoCode.findUnique({ where: { code } });

    if (!promoCode) return res.status(404).json({ message: 'Invalid promo code. Please check and try again.' });
    if (promoCode.isUsed) return res.status(400).json({ message: 'This promo code has already been used.' });
    if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
      return res.status(400).json({ message: 'This promo code has expired.' });
    }

    return res.status(200).json({ valid: true, plan: promoCode.plan, message: 'Promo code verified!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
}
