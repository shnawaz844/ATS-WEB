import supabase, { fromDB, fromDBArray } from '../config/supabaseClient.js';

const TABLE = 'candidate_files';

const CandidateFile = {
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
    let query = supabase.from(TABLE).select('*').order('"uploadDate"', { ascending: false });
    for (const [key, val] of Object.entries(filter)) {
      if (val !== undefined && val !== null) query = query.eq(key, val);
    }
    const { data, error } = await query;
    if (error) throw error;
    return fromDBArray(data);
  },

  async create(fileData) {
    const { data, error } = await supabase.from(TABLE).insert(fileData).select().single();
    if (error) throw error;
    return fromDB(data);
  },

  async findByIdAndUpdate(id, updateData) {
    const { data, error } = await supabase.from(TABLE).update({ ...updateData, "updatedAt": new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return fromDB(data);
  }
};

export default CandidateFile;