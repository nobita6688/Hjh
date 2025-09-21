import dotenv from 'dotenv';
import express from 'express';
import Docker from 'dockerode';
import morgan from 'morgan';

dotenv.config({ path: process.env.AGENT_ENV || '/opt/gp-agent/.env' });

const app = express();
app.use(express.json());
app.use(morgan('dev'));

const docker = new Docker();
const DRY_RUN = (process.env.DRY_RUN || '').toLowerCase() === 'true';
const PANEL_URL = process.env.PANEL_URL || 'http://localhost:3000';
const AGENT_ID = process.env.AGENT_ID || 'dev-agent';
const AGENT_SECRET = process.env.AGENT_SECRET || 'dev-secret';

function requirePanel(req, res, next) {
  const id = req.headers['x-agent-id'];
  const secret = req.headers['x-agent-secret'];
  if (id !== AGENT_ID || secret !== AGENT_SECRET) return res.status(403).json({ error: 'forbidden' });
  next();
}

// Create container and start
app.post('/agent/servers', requirePanel, async (req, res) => {
  try {
    const { id, name, image, startCmd, env = {}, ports = [], volumes = [] } = req.body || {};
    if (!id || !image) return res.status(400).json({ error: 'missing id/image' });

    if (!DRY_RUN) {
      // Pull image if not present
      await new Promise((resolve, reject) => {
        docker.pull(image, (err, stream) => {
          if (err) return reject(err);
          docker.modem.followProgress(stream, (err2) => (err2 ? reject(err2) : resolve()));
        });
      });
    }

    const portBindings = {};
    const exposedPorts = {};
    for (const p of ports) {
      const key = `${p.container}/${p.protocol || 'tcp'}`;
      exposedPorts[key] = {};
      portBindings[key] = [{ HostPort: String(p.host || p.container) }];
    }

    const binds = volumes.map(v => `${v.host.startsWith('/') ? v.host : `/opt/gp-data/${id}/${v.host}`}:${v.container}`);

    const envArr = Object.entries(env).map(([k, v]) => `${k}=${v}`);

    if (!DRY_RUN) {
      const container = await docker.createContainer({
        name: `gp_${id}`,
        Image: image,
        Env: envArr,
        ExposedPorts: exposedPorts,
        HostConfig: {
          PortBindings: portBindings,
          Binds: binds,
          RestartPolicy: { Name: 'unless-stopped' }
        },
        WorkingDir: '/app',
        Cmd: startCmd ? startCmd.split(' ') : undefined,
        Tty: false
      });
      await container.start();
    }
    res.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).json({ error: 'create_failed' });
  }
});

app.post('/agent/servers/:id/stop', requirePanel, async (req, res) => {
  try {
    if (!DRY_RUN) {
      const container = docker.getContainer(`gp_${req.params.id}`);
      await container.stop({ t: 10 });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'stop_failed' });
  }
});

app.post('/agent/servers/:id/start', requirePanel, async (req, res) => {
  try {
    if (!DRY_RUN) {
      const container = docker.getContainer(`gp_${req.params.id}`);
      await container.start();
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'start_failed' });
  }
});

app.delete('/agent/servers/:id', requirePanel, async (req, res) => {
  try {
    if (!DRY_RUN) {
      const container = docker.getContainer(`gp_${req.params.id}`);
      await container.remove({ force: true });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'delete_failed' });
  }
});

const PORT = process.env.AGENT_PORT || 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`gp.agent running on http://localhost:${PORT}`);
});

