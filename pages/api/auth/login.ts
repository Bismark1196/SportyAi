// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { comparePassword, createToken, setAuthCookie } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  try {
    // Step 1: test DB connection first
    await prisma.$queryRaw`SELECT 1`;
  } catch (dbErr: any) {
    console.error('DB connection failed:', dbErr?.message);
    return res.status(500).json({
      message: 'Authentication service is temporarily unavailable.',
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account deactivated. Contact support.' });
    }

    const valid = await comparePassword(String(password), user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = await createToken({ userId: user.id, email: user.email, role: user.role });
    setAuthCookie(res, token);

    return res.status(200).json({ success: true, role: user.role });
  } catch (err: any) {
    console.error('Login query error:', err?.message);
    return res.status(500).json({ message: 'Login failed. Please try again.' });
  }
}
