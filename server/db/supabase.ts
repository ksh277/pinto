import '../lib/loadEnv';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
// NOTE: Service role key is for server-side use only. Never expose this to client code.
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  console.error('SUPABASE_URL environment variable is missing.');
  process.exit(1);
}

if (!/^https:\/\/[\w.-]+\.supabase\.co$/.test(url)) {
  console.error('Invalid SUPABASE_URL format. Expected https://<project>.supabase.co');
  process.exit(1);
}

if (!key) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is missing.');
  process.exit(1);
}

if (process.env.NODE_ENV !== 'production') {
  console.log(`SUPABASE_URL: ${url.slice(0, 30)}...`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${key.slice(0, 6)}...`);
}

export const sb = createClient(url, key, { auth: { persistSession: false } });
