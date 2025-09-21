import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export function initDb() {
  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, 'panel.sqlite');
  const db = new Database(dbPath);

  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS nodes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      base_url TEXT NOT NULL,
      secret TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS registration_tokens (
      id TEXT PRIMARY KEY,
      token TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS server_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      image TEXT NOT NULL,
      start_cmd TEXT NOT NULL,
      env_json TEXT NOT NULL,
      ports_json TEXT NOT NULL,
      volumes_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS servers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type_id TEXT NOT NULL,
      node_id TEXT NOT NULL,
      status TEXT NOT NULL,
      env_json TEXT NOT NULL,
      ports_json TEXT NOT NULL,
      volumes_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(type_id) REFERENCES server_types(id),
      FOREIGN KEY(node_id) REFERENCES nodes(id)
    );
  `);

  // Seed default server types if empty
  const count = db.prepare('SELECT COUNT(*) as c FROM server_types').get().c;
  if (count === 0) {
    const insert = db.prepare(`INSERT INTO server_types (id, name, image, start_cmd, env_json, ports_json, volumes_json, created_at)
      VALUES (@id, @name, @image, @start_cmd, @env_json, @ports_json, @volumes_json, @created_at)`);
    const now = new Date().toISOString();
    const defaults = [
      {
        id: 'minecraft',
        name: 'Minecraft',
        image: 'itzg/minecraft-server:latest',
        start_cmd: '',
        env_json: JSON.stringify({ EULA: 'TRUE', MEMORY: '1G' }),
        ports_json: JSON.stringify([{ container: 25565, host: 25565, protocol: 'tcp' }]),
        volumes_json: JSON.stringify([{ host: 'data', container: '/data' }]),
        created_at: now
      },
      {
        id: 'python',
        name: 'Python',
        image: 'python:3.11-alpine',
        start_cmd: 'python main.py',
        env_json: JSON.stringify({}),
        ports_json: JSON.stringify([]),
        volumes_json: JSON.stringify([{ host: 'app', container: '/app' }]),
        created_at: now
      },
      {
        id: 'node',
        name: 'Node.js',
        image: 'node:20-alpine',
        start_cmd: 'npm start',
        env_json: JSON.stringify({ NODE_ENV: 'production' }),
        ports_json: JSON.stringify([{ container: 3000, host: 3000, protocol: 'tcp' }]),
        volumes_json: JSON.stringify([{ host: 'app', container: '/app' }]),
        created_at: now
      },
      {
        id: 'java',
        name: 'Java',
        image: 'eclipse-temurin:17-jre',
        start_cmd: 'java -jar app.jar',
        env_json: JSON.stringify({}),
        ports_json: JSON.stringify([]),
        volumes_json: JSON.stringify([{ host: 'app', container: '/app' }]),
        created_at: now
      }
    ];
    const tx = db.transaction((rows) => rows.forEach((r) => insert.run(r)));
    tx(defaults);
  }

  return db;
}

