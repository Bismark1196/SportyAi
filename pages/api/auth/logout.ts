// pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { cookies } from 'next/headers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  res.setHeader('Set-Cookie', 'betai_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
  return res.status(200).json({ success: true });
}
