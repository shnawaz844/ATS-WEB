import supabase, { fromDB } from '../config/supabaseClient.js';

const TABLE = 'Waitlist';

const Waitlist = {
  async create(data) {
    const { data: result, error } = await supabase.from(TABLE).insert([data]).select().maybeSingle();
    if (error) {
      if (error.code === '42P01') { 
        const { data: result2, error: error2 } = await supabase.from('waitlist').insert([data]).select().maybeSingle();
        if (error2) throw error2;
        return fromDB(result2);
      }
      throw error;
    }
    return fromDB(result);
  },

  async findAll(companyId) {
    let query = supabase.from(TABLE).select('*').order('createdAt', { ascending: false });
    if (companyId) {
      query = query.eq('companyId', companyId);
    }
    const { data: result, error } = await query;
    if (error) {
      if (error.code === '42P01') { 
        let query2 = supabase.from('waitlist').select('*').order('created_at', { ascending: false });
        if (companyId) {
          query2 = query2.eq('company_id', companyId);
        }
        const { data: result2, error: error2 } = await query2;
        if (error2) throw error2;
        return (result2 || []).map(fromDB);
      }
      throw error;
    }
    return (result || []).map(fromDB);
  },

  async findById(id) {
    const { data: result, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) {
      if (error.code === '42P01') {
        const { data: result2, error: error2 } = await supabase.from('waitlist').select('*').eq('id', id).maybeSingle();
        if (error2) throw error2;
        return result2 ? fromDB(result2) : null;
      }
      throw error;
    }
    return result ? fromDB(result) : null;
  },

  async update(id, updateData) {
    const { data: result, error } = await supabase.from(TABLE).update(updateData).eq('id', id).select().maybeSingle();
    if (error) {
      if (error.code === '42P01') { 
        const { data: result2, error: error2 } = await supabase.from('waitlist').update(updateData).eq('id', id).select().maybeSingle();
        if (error2) throw error2;
        return result2 ? fromDB(result2) : null;
      }
      throw error;
    }
    return result ? fromDB(result) : null;
  }
};

export default Waitlist;
