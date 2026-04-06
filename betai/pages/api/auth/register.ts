// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { hashPassword, createToken, setAuthCookie } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { name, email, password, promoCode } = req.body;

  if (!email || !password || !promoCode) {
    return res.status(400).json({ message: 'Email, password, and promo code are required.' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedCode = String(promoCode).trim().toUpperCase();

  try {
    // Verify promo code
    const promo = await prisma.promoCode.findUnique({ where: { code: normalizedCode } });

    if (!promo) {
      return res.status(400).json({ message: `Promo code "${normalizedCode}" is invalid.` });
    }
    if (promo.isUsed) {
      return res.status(400).json({ message: 'This promo code has already been used.' });
    }
    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return res.status(400).json({ message: 'This promo code has expired.' });
    }

    // Check duplicate email
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await hashPassword(String(password));

    // Atomically create user + mark promo used
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name ? String(name).trim() : null,
          email: normalizedEmail,
          password: hashedPassword,
          promoCodeUsed: normalizedCode,
        },
      });
      await tx.promoCode.update({
        where: { code: normalizedCode },
        data: { isUsed: true, usedBy: normalizedEmail, usedAt: new Date() },
      });
      return newUser;
    });

    const token = await createToken({ userId: user.id, email: user.email, role: user.role });
    setAuthCookie(res, token);

    return res.status(201).json({ success: true, role: user.role });
  } catch (err: any) {
    console.error('Register error:', err?.message || err);
    return res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
}
