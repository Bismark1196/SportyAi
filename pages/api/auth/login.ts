// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { comparePassword, createToken, setAuthCookie } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });
    if (!user.isActive) return res.status(403).json({ message: 'Your account has been deactivated. Contact support.' });

    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = await createToken({ userId: user.id, email: user.email, role: user.role });
    setAuthCookie(res, token);

    return res.status(200).json({ success: true, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed. Please try again.' });
  }
}
