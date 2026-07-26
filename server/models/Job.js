import supabase, { fromDB, fromDBArray } from '../config/supabaseClient.js';

const TABLE = 'jobs';

const Job = {
  async findOne(filter) {
    let query = supabase.from(TABLE).select('*');
    for (const [key, val] of Object.entries(filter)) {
      if (val !== undefined && val !== null) query = query.eq(key, val);
    }
    const { data, error } = await query.limit(1).maybeSingle();
    if (error) throw error;
    return fromDB(data);
  },

  async findById(id) {
    // id can be the row uuid OR the jobID string field
    // Try uuid first
    let { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error || !data) {
      // fallback: try jobID field
      ({ data, error } = await supabase.from(TABLE).select('*').eq('"jobID"', id).maybeSingle());
    }
    if (error) throw error;
    return fromDB(data);
  },

  async find(filter = {}, select = '*') {
    let query = supabase.from(TABLE).select(select).order('"createdAt"', { ascending: false });
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

  async findWithCompany(filter = {}, page = 1, limit = 12) {
    let query = supabase.from(TABLE)
      .select('*, company:companies(name, image, "CompanyUserName")')
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
    const { data, error } = await query;
    if (error) throw error;
    return fromDBArray(data);
  },

  async create(jobData) {
    const { data, error } = await supabase.from(TABLE).insert(jobData).select().single();
    if (error) throw error;
    return fromDB(data);
  },

  async findByIdAndUpdate(id, updateData, options = {}) {
    const { data, error } = await supabase.from(TABLE).update({ ...updateData, "updatedAt": new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return fromDB(data);
  },

  async findByIdAndDelete(id) {
    const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select().single();
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

export default Job;
