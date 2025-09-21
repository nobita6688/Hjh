import express from 'express';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { requireAuth } from '../auth.js';

export default function serversRouter(db) {
  const router = express.Router();

  router.get('/servers', requireAuth, (req, res) => {
    const rows = db.prepare(`
      SELECT s.*, t.name AS type_name, n.name AS node_name
      FROM servers s
      JOIN server_types t ON s.type_id = t.id
      JOIN nodes n ON s.node_id = n.id
      ORDER BY s.created_at DESC
    `).all();
    res.json(rows);
  });

  router.post('/servers', requireAuth, async (req, res) => {
    try {
      const { name, typeId, nodeId, env = {}, ports = [], volumes = [] } = req.body || {};
      if (!name || !typeId || !nodeId) return res.status(400).json({ error: 'name, typeId, nodeId required' });
      const type = db.prepare('SELECT * FROM server_types WHERE id = ?').get(typeId);
      if (!type) return res.status(400).json({ error: 'Invalid typeId' });
      const node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(nodeId);
      if (!node) return res.status(400).json({ error: 'Invalid nodeId' });

      const serverId = nanoid(12);
      const createdAt = new Date().toISOString();
      const mergedEnv = { ...JSON.parse(type.env_json), ...env };
      const mergedPorts = ports.length ? ports : JSON.parse(type.ports_json);
      const mergedVolumes = volumes.length ? volumes : JSON.parse(type.volumes_json);

      db.prepare('INSERT INTO servers (id, name, type_id, node_id, status, env_json, ports_json, volumes_json, created_at) VALUES (?,?,?,?,?,?,?,?,?)')
        .run(serverId, name, typeId, nodeId, 'creating', JSON.stringify(mergedEnv), JSON.stringify(mergedPorts), JSON.stringify(mergedVolumes), createdAt);

      // Ask agent to create container
      const url = new URL('/agent/servers', node.base_url).toString();
      await axios.post(url, {
        id: serverId,
        name,
        image: type.image,
        startCmd: type.start_cmd,
        env: mergedEnv,
        ports: mergedPorts,
        volumes: mergedVolumes
      }, {
        headers: { 'x-agent-id': node.id, 'x-agent-secret': node.secret }
      });

      db.prepare('UPDATE servers SET status = ? WHERE id = ?').run('running', serverId);
      res.json({ id: serverId });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      res.status(500).json({ error: 'Failed to create server' });
    }
  });

  router.post('/servers/:id/stop', requireAuth, async (req, res) => {
    const server = db.prepare('SELECT * FROM servers WHERE id = ?').get(req.params.id);
    if (!server) return res.status(404).json({ error: 'Not found' });
    const node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(server.node_id);
    try {
      const url = new URL(`/agent/servers/${server.id}/stop`, node.base_url).toString();
      await axios.post(url, {}, { headers: { 'x-agent-id': node.id, 'x-agent-secret': node.secret } });
      db.prepare('UPDATE servers SET status = ? WHERE id = ?').run('stopped', server.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to stop' });
    }
  });

  router.post('/servers/:id/start', requireAuth, async (req, res) => {
    const server = db.prepare('SELECT * FROM servers WHERE id = ?').get(req.params.id);
    if (!server) return res.status(404).json({ error: 'Not found' });
    const node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(server.node_id);
    try {
      const url = new URL(`/agent/servers/${server.id}/start`, node.base_url).toString();
      await axios.post(url, {}, { headers: { 'x-agent-id': node.id, 'x-agent-secret': node.secret } });
      db.prepare('UPDATE servers SET status = ? WHERE id = ?').run('running', server.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to start' });
    }
  });

  router.delete('/servers/:id', requireAuth, async (req, res) => {
    const server = db.prepare('SELECT * FROM servers WHERE id = ?').get(req.params.id);
    if (!server) return res.status(404).json({ error: 'Not found' });
    const node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(server.node_id);
    try {
      const url = new URL(`/agent/servers/${server.id}`, node.base_url).toString();
      await axios.delete(url, { headers: { 'x-agent-id': node.id, 'x-agent-secret': node.secret } });
    } catch (e) {
      // ignore
    }
    db.prepare('DELETE FROM servers WHERE id = ?').run(server.id);
    res.json({ ok: true });
  });

  return router;
}

