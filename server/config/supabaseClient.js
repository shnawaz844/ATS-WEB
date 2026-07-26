import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper: adds _id alias from id, and handles null
export const fromDB = (row) => {
  if (!row) return null;
  return { ...row, _id: row.id };
};

export const fromDBArray = (rows) => {
  if (!rows) return [];
  return rows.map(fromDB);
};

export default supabase;
