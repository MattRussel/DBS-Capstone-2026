// backend/repositories/checkinRepository.js
import supabase from '../config/db.js';

/**
 * 🟢 PERBAIKAN: Menggunakan .select() biasa agar kebal dari eror 'multiple rows returned'
 */
export const findCheckinByUserIdAndDate = async (userId, tanggal) => {
  try {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('id, streak_count, tingkat_kesulitan')
      .eq('user_id', parseInt(userId, 10))
      .eq('tanggal_checkin', tanggal); // Membaca sebagai array list

    if (error) throw error;
    
    // Jika ada data ditemukan (meskipun ganda), ambil baris pertama yang paling sah
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("❌ [Repository Find Checkin Error]:", error.message);
    throw error;
  }
};

/**
 * 🟢 SINKRONISASI TOTAL: Membuat data check-in baru ke database Supabase
 */
export const createCheckin = async (userId, tanggal, streak, materi, mood, kesulitan) => {
  try {
    const { data, error } = await supabase
      .from('daily_checkins')
      .insert([
        {
          user_id: parseInt(userId, 10),
          tanggal_checkin: tanggal,
          streak_count: parseInt(streak, 10),
          materi_dipelajari: materi,
          mood: mood,
          tingkat_kesulitan: parseInt(kesulitan, 10)
        }
      ])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ [Repository Create Checkin Error]:", error.message);
    throw error;
  }
};

/**
 * 🟢 SINKRONISASI TOTAL: Menarik riwayat jurnal belajar anak untuk ProfilePage
 */
export const getHistoryByUserId = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('materi_dipelajari, mood, tingkat_kesulitan, tanggal_checkin')
      .eq('user_id', parseInt(userId, 10))
      .order('tanggal_checkin', { ascending: false });

    if (error) throw error;
    
    // Konversi tipe data tingkat_kesulitan ke bentuk nomor integer murni
    const cleanData = (data || []).map(row => ({
      ...row,
      tingkat_kesulitan: row.tingkat_kesulitan !== null ? parseInt(row.tingkat_kesulitan, 10) : 4
    }));

    return cleanData;
  } catch (error) {
    console.error("❌ [Repository Get History Error]:", error.message);
    throw error;
  }
};