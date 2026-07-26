import supabase, { fromDB, fromDBArray } from '../config/supabaseClient.js';

const TABLE = 'hiring_managers';

const Hiringmanager = {
  async findOne(filter) {
    let query = supabase.from(TABLE).select('*');
    for (const [key, val] of Object.entries(filter)) {
      if (val !== undefined && val !== null) query = query.eq(key, val);
    }
    const { data, error } = await query.limit(1).maybeSingle();
    if (error) throw error;
    return fromDB(data);
  },

  async find(filter = {}) {
    let query = supabase.from(TABLE).select('*');
    for (const [key, val] of Object.entries(filter)) {
      if (val !== undefined && val !== null) query = query.eq(key, val);
    }
    const { data, error } = await query;
    if (error) throw error;
    return fromDBArray(data);
  },

  async create(data) {
    const { data: result, error } = await supabase.from(TABLE).insert(data).select().single();
    if (error) throw error;
    return fromDB(result);
  }
};

export default Hiringmanager;