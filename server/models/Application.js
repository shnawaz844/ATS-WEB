import supabase, { fromDB, fromDBArray } from '../config/supabaseClient.js';

const TABLE = 'applications';

const Application = {
  async findOne(filter) {
    let query = supabase.from(TABLE).select('*').order('"createdAt"', { ascending: false });
    for (const [key, val] of Object.entries(filter)) {
      if (val !== undefined && val !== null) query = query.eq(key, val);
    }
    const { data, error } = await query.limit(1).maybeSingle();
    if (error) throw error;
    return fromDB(data);
  },

  async findById(id) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return fromDB(data);
  },

  async find(filter = {}) {
    let query = supabase.from(TABLE).select('*').order('"createdAt"', { ascending: false });
    for (const [key, val] of Object.entries(filter)) {
      if (val !== undefined && val !== null) {
        if (Array.isArray(val)) {
          query = query.in(key, val);
        } else {
          query = query.eq(key, val);
        }
      }
    }
    const { data, error } = await query;
    if (error) throw error;
    return fromDBArray(data);
  },

  async findPaginated(filter = {}, page = 1, limit = 10) {
    let query = supabase.from(TABLE).select('*', { count: 'exact' })
      .order('"createdAt"', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    for (const [key, val] of Object.entries(filter)) {
      if (val !== undefined && val !== null) {
        if (Array.isArray(val)) {
          query = query.in(key, val);
        } else {
          query = query.eq(key, val);
        }
      }
    }
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: fromDBArray(data), count };
  },

  async create(appData) {
    const { data, error } = await supabase.from(TABLE).insert(appData).select().single();
    if (error) throw error;
    return fromDB(data);
  },

  async findByIdAndUpdate(id, updateData, options = {}) {
    const { data, error } = await supabase.from(TABLE).update({ ...updateData, "updatedAt": new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return fromDB(data);
  },

  async countDocuments(filter = {}) {
    let query = supabase.from(TABLE).select('*', { count: 'exact', head: true });
    for (const [key, val] of Object.entries(filter)) {
      if (val !== undefined && val !== null) {
        if (Array.isArray(val)) {
          query = query.in(key, val);
        } else {
          query = query.eq(key, val);
        }
      }
    }
    const { count, error } = await query;
    if (error) throw error;
    return count;
  }
};

export default Application;