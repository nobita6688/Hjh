import express from 'express';
import { nanoid } from 'nanoid';
import { requireAuth } from '../auth.js';

export default function typesRouter(db) {
  const router = express.Router();

  router.get('/server-types', requireAuth, (req, res) => {
    const rows = db.prepare('SELECT * FROM server_types ORDER BY created_at DESC').all();
    res.json(rows);
  });

  router.post('/server-types', requireAuth, (req, res) => {
    const { name, image, startCmd, env = {}, ports = [], volumes = [] } = req.body || {};
    if (!name || !image || !startCmd) return res.status(400).json({ error: 'name, image, startCmd required' });
    const id = nanoid(10);
    const createdAt = new Date().toISOString();
    db.prepare('INSERT INTO server_types (id, name, image, start_cmd, env_json, ports_json, volumes_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, name, image, startCmd, JSON.stringify(env), JSON.stringify(ports), JSON.stringify(volumes), createdAt);
    res.json({ id });
  });

  return router;
}

