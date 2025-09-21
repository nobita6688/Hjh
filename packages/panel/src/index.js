import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import { requireAuth } from './auth.js';
import nodesRouter from './routes/nodes.js';
import typesRouter from './routes/types.js';
import serversRouter from './routes/servers.js';
import installRouter from './routes/install.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize database
const db = initDb();

// Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, name: 'gp.panel', poweredBy: 'Nobita' });
});

// Auth check endpoint (simple API key auth)
app.get('/api/me', requireAuth, (req, res) => {
  res.json({ ok: true, role: 'admin' });
});

// Routers
app.use('/api', nodesRouter(db));
app.use('/api', typesRouter(db));
app.use('/api', serversRouter(db));
app.use('/', installRouter(db));

// Static UI
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PANEL_PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`gp.panel running on http://localhost:${PORT}`);
});

