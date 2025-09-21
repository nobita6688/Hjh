import express from 'express';
import { nanoid } from 'nanoid';
import { requireAuth } from '../auth.js';

export default function nodesRouter(db) {
  const router = express.Router();

  // List nodes
  router.get('/nodes', requireAuth, (req, res) => {
    const rows = db.prepare('SELECT id, name, base_url, created_at FROM nodes ORDER BY created_at DESC').all();
    res.json(rows);
  });

  // Create a registration token
  router.post('/nodes/tokens', requireAuth, (req, res) => {
    const token = nanoid(24);
    const id = nanoid(12);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1000 * 60 * 30); // 30 minutes
    db.prepare('INSERT INTO registration_tokens (id, token, created_at, expires_at, used) VALUES (?, ?, ?, ?, 0)')
      .run(id, token, now.toISOString(), expiresAt.toISOString());
    res.json({ id, token, expiresAt: expiresAt.toISOString() });
  });

  // Agent registers itself with a registration token
  router.post('/nodes/register', (req, res) => {
    const { token, name, baseUrl } = req.body || {};
    if (!token || !name || !baseUrl) return res.status(400).json({ error: 'token, name, baseUrl required' });
    const row = db.prepare('SELECT * FROM registration_tokens WHERE token = ?').get(token);
    if (!row) return res.status(400).json({ error: 'Invalid token' });
    if (row.used) return res.status(400).json({ error: 'Token already used' });
    if (new Date(row.expires_at) < new Date()) return res.status(400).json({ error: 'Token expired' });
    const id = nanoid(10);
    const secret = nanoid(32);
    const createdAt = new Date().toISOString();
    db.prepare('INSERT INTO nodes (id, name, base_url, secret, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(id, name, baseUrl, secret, createdAt);
    db.prepare('UPDATE registration_tokens SET used = 1 WHERE id = ?').run(row.id);
    res.json({ id, secret, panel: { url: process.env.PUBLIC_PANEL_URL || `http://localhost:${process.env.PANEL_PORT || 3000}` } });
  });

  return router;
}

