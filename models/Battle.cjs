// Battle model - Supabase version
const { supabase } = require('../src/config/supabase.cjs');

const TABLE = 'battles';

const Battle = {
  async findById(id) {
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findByRoomId(roomId) {
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('room_id', roomId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async findOne(filters) {
    let query = supabase.from(TABLE).select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query.limit(1).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async find(filters = {}, options = {}) {
    let query = supabase.from(TABLE).select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    if (options.sort) {
      Object.entries(options.sort).forEach(([field, dir]) => {
        query = query.order(field, { ascending: dir === 1 });
      });
    }
    if (options.limit) query = query.limit(options.limit);
    if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async create(battleData) {
    const { data, error } = await supabase
      .from(TABLE).insert(battleData).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from(TABLE).update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async updateByRoomId(roomId, updates) {
    const { data, error } = await supabase
      .from(TABLE).update(updates).eq('room_id', roomId).select().single();
    if (error) throw error;
    return data;
  },

  async countDocuments(filters = {}) {
    let query = supabase.from(TABLE).select('id', { count: 'exact', head: true });
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  },

  // Find battles where a player participated (by checking JSONB players array)
  async findByPlayerUid(firebaseUid, status = null, options = {}) {
    let query = supabase.from(TABLE).select('*')
      .contains('players', [{ firebaseUid }]);
    if (status) query = query.eq('status', status);
    if (options.sort) {
      Object.entries(options.sort).forEach(([field, dir]) => {
        query = query.order(field, { ascending: dir === 1 });
      });
    }
    if (options.limit) query = query.limit(options.limit);
    if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Count battles where a player won
  async countWins(firebaseUid) {
    const { count, error } = await supabase.from(TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('status', 'finished')
      .eq('winner->>firebaseUid', firebaseUid);
    if (error) throw error;
    return count || 0;
  },

  // Static methods
  generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomId = '';
    for (let i = 0; i < 6; i++) {
      roomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return roomId;
  },

  async getActiveBattlesCount() {
    const { count, error } = await supabase.from(TABLE)
      .select('id', { count: 'exact', head: true })
      .in('status', ['waiting', 'playing']);
    if (error) throw error;
    return count || 0;
  },

  async findWaitingRoom(gameType, difficulty) {
    const { data, error } = await supabase.from(TABLE)
      .select('*')
      .eq('status', 'waiting')
      .eq('game_type', gameType)
      .eq('difficulty', difficulty)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    // Filter for rooms with only 1 player
    if (data && data.players && data.players.length < 2) {
      return data;
    }
    return null;
  },

  // Get leaderboard via RPC
  async getLeaderboard(limit = 10) {
    const { data, error } = await supabase.rpc('get_battle_leaderboard', { lim: limit });
    if (error) throw error;
    return data || [];
  }
};

module.exports = Battle;
