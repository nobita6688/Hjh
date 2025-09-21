import express from 'express';
import { nanoid } from 'nanoid';
import { requireAuth } from '../auth.js';

export default function installRouter(db) {
  const router = express.Router();

  // Admin creates a one-time token, agent uses it to auto-register
  router.post('/api/install-token', requireAuth, (req, res) => {
    const token = nanoid(24);
    const id = nanoid(12);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1000 * 60 * 30);
    db.prepare('INSERT INTO registration_tokens (id, token, created_at, expires_at, used) VALUES (?, ?, ?, ?, 0)')
      .run(id, token, now.toISOString(), expiresAt.toISOString());
    res.json({ token, expiresAt: expiresAt.toISOString() });
  });

  // Script that agent can curl -fsSL
  router.get('/install.sh', (req, res) => {
    const panelUrl = process.env.PUBLIC_PANEL_URL || `http://localhost:${process.env.PANEL_PORT || 3000}`;
    res.set('Content-Type', 'text/x-shellscript');
    res.send(`#!/usr/bin/env bash
set -euo pipefail

if [ -z "\${GP_TOKEN:-}" ]; then
  echo "Provide GP_TOKEN env var (from panel)." >&2
  exit 1
fi

NAME="\${GP_NAME:-gp-node}" 
BASE_URL="\${GP_BASE_URL:-http://localhost:4000}"
PANEL_URL="${panelUrl}"

echo "Registering node $NAME at $BASE_URL with panel $PANEL_URL"
payload=$(cat <<JSON
{ "token": "${'{'}GP_TOKEN{'}'}", "name": "$NAME", "baseUrl": "$BASE_URL" }
JSON
)

resp=$(curl -fsSL -X POST "$PANEL_URL/api/nodes/register" -H 'content-type: application/json' -d "$payload")
agent_id=$(echo "$resp" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
agent_secret=$(echo "$resp" | sed -n 's/.*"secret":"\([^"]*\)".*/\1/p')

echo "Registered as $agent_id"
mkdir -p /opt/gp-agent
cat >/opt/gp-agent/.env <<ENV
AGENT_PORT=4000
PANEL_URL=$PANEL_URL
AGENT_ID=$agent_id
AGENT_SECRET=$agent_secret
ENV

echo "Installation complete. Start agent with: gp-agent (see README)."
`);
  });

  return router;
}

