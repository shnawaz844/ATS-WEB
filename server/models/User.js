import supabase, { fromDB, fromDBArray } from '../config/supabaseClient.js';

const TABLE = 'users';

const User = {
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

  async find(filter = {}, select = '*') {
    let query = supabase.from(TABLE).select(select);
    for (const [key, val] of Object.entries(filter)) {
      if (val !== undefined && val !== null) query = query.eq(key, val);
    }
    const { data, error } = await query;
    if (error) throw error;
    return fromDBArray(data);
  },

  async findWithOr(andFilter = {}, orConditions = [], select = '*') {
    let query = supabase.from(TABLE).select(select);
    for (const [key, val] of Object.entries(andFilter)) {
      if (val !== undefined && val !== null) query = query.eq(key, val);
    }
    if (orConditions.length > 0) {
      const orStr = orConditions.map(c => {
        const [k, v] = Object.entries(c)[0];
        return `${k}.ilike.%${v}%`;
      }).join(',');
      query = query.or(orStr);
    }
    const { data, error } = await query;
    if (error) throw error;
    return fromDBArray(data);
  },

  async create(userData) {
    const { data, error } = await supabase.from(TABLE).insert(userData).select().single();
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
      if (val !== undefined && val !== null) query = query.eq(key, val);
    }
    const { count, error } = await query;
    if (error) throw error;
    return count;
  },

  async save(userObj) {
    if (userObj.id || userObj._id) {
      const id = userObj.id || userObj._id;
      const { id: _id, _id: __id, ...rest } = userObj;
      return this.findByIdAndUpdate(id, rest);
    }
    return this.create(userObj);
  }
};

export default User;