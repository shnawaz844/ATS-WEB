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

// Helper: adds _id alias from id, maps super admin role, and handles null
export const fromDB = (row) => {
  if (!row) return null;
  const isSuper = row.company_id === 'super' || row.email === 'karamveer@gmail.com' || row.email === 'shahnawaz95577@gmail.com' || row.email === 'admin@ats.com';
  return { ...row, role: isSuper ? 'super' : row.role, _id: row.id };
};

export const fromDBArray = (rows) => {
  if (!rows) return [];
  return rows.map(fromDB);
};

export default supabase;
