import supabase, { fromDB, fromDBArray } from '../config/supabaseClient.js';

const TABLE = 'job_statuses';

const JobStatus = {
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
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return fromDB(data);
  },

  async find(filter = {}) {
    let query = supabase.from(TABLE).select('*').order('"jobStep"', { ascending: true });
    for (const [key, val] of Object.entries(filter)) {
      if (val !== undefined && val !== null) query = query.eq(key, val);
    }
    const { data, error } = await query;
    if (error) throw error;
    return fromDBArray(data);
  },

  async create(statusData) {
    const { data, error } = await supabase.from(TABLE).insert(statusData).select().single();
    if (error) throw error;
    return fromDB(data);
  },

  async findByIdAndUpdate(id, updateData) {
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
      if (val !== undefined && val !== null) query = query.eq(key, val);
    }
    const { count, error } = await query;
    if (error) throw error;
    return count;
  }
};

export default JobStatus;
