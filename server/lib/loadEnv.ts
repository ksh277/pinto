import fs from 'fs';
import path from 'path';

/**
 * Basic `.env` loader to avoid external dependency on `dotenv`.
 * Loads key-value pairs into `process.env` if they are not already set.
 */
export function loadEnv(file: string = '.env') {
  const envPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(envPath)) return;

  const contents = fs.readFileSync(envPath, 'utf8');
  for (const line of contents.split('\n')) {
    const match = line.match(/^\s*([A-Za-z0-9_\.\-]+)\s*=\s*(.*)?\s*$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2] ?? '';
    // Remove surrounding quotes
    value = value.replace(/(^['"]|['"]$)/g, '').trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

// Automatically load environment variables on import
loadEnv();
