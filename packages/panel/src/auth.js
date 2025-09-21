export function requireAuth(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const key = process.env.PANEL_API_KEY || 'dev-admin-key';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }
  const token = auth.slice('Bearer '.length);
  if (token !== key) {
    return res.status(403).json({ error: 'Invalid token' });
  }
  next();
}

export function requireAgentAuth(db) {
  return (req, res, next) => {
    const agentId = req.headers['x-agent-id'];
    const secret = req.headers['x-agent-secret'];
    if (!agentId || !secret) return res.status(401).json({ error: 'Missing agent headers' });
    const row = db.prepare('SELECT id, secret FROM nodes WHERE id = ?').get(agentId);
    if (!row || row.secret !== secret) return res.status(403).json({ error: 'Invalid agent credentials' });
    next();
  };
}

