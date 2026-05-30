// backend/repositories/checkinRepository.js
import supabase from '../config/db.js'; // Menyesuaikan dengan lokasi db.js kamu yang baru

/**
 * 🔍 Mengecek apakah anak sudah melakukan check-in di tanggal tertentu
 * Digunakan untuk mencegah anak melakukan absensi ganda di hari yang sama
 */
export const findCheckinByUserIdAndDate = async (userId, date) => {
  try {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .eq('tanggal_checkin', date)
      .maybeSingle(); // Mengembalikan 1 objek data absensi, atau null jika belum absen

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ [Checkin Repository] Gagal memeriksa data absensi harian:", error.message);
    throw error;
  }
};

/**
 * 💾 Memasukkan baris absensi check-in baru beserta jumlah beruntun (streak)
 */
export const createCheckin = async (userId, date, streakCount = 1) => {
  try {
    const { data, error } = await supabase
      .from('daily_checkins')
      .insert([
        {
          user_id: parseInt(userId, 10),
          tanggal_checkin: date, // Format tanggal 'YYYY-MM-DD' dari backend service
          streak_count: parseInt(streakCount, 10)
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data; // Mengembalikan objek data check-in ter-update
  } catch (error) {
    console.error("❌ [Checkin Repository] Gagal menyimpan data check-in baru:", error.message);
    throw error;
  }
};