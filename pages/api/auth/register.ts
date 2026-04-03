// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { hashPassword, createToken, setAuthCookie } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { name, email, password, promoCode } = req.body;

  if (!email || !password || !promoCode) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Re-verify promo code (atomically)
    const promo = await prisma.promoCode.findUnique({ where: { code: promoCode } });

    if (!promo) return res.status(400).json({ message: 'Invalid promo code.' });
    if (promo.isUsed) return res.status(400).json({ message: 'Promo code already used.' });
    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return res.status(400).json({ message: 'Promo code has expired.' });
    }

    // Check for existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'An account with this email already exists.' });

    const hashedPassword = await hashPassword(password);

    // Create user and mark promo used atomically
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, password: hashedPassword, promoCodeUsed: promoCode },
      });
      await tx.promoCode.update({
        where: { code: promoCode },
        data: { isUsed: true, usedBy: email, usedAt: new Date() },
      });
      return newUser;
    });

    const token = await createToken({ userId: user.id, email: user.email, role: user.role });
    setAuthCookie(token);

    return res.status(201).json({ success: true, message: 'Account created successfully' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
}
