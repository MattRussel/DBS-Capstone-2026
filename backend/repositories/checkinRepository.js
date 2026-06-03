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
 * 💾 Memasukkan baris absensi check-in baru beserta jumlah beruntun (streak) dan detail jurnal sains
 */
// 🟢 PERBAIKAN: Tambahkan parameter materiDipelajari, mood, dan tingkatKesulitan dari service layer
export const createCheckin = async (userId, date, streakCount = 1, materiDipelajari, mood, tingkatKesulitan) => {
  try {
    const { data, error } = await supabase
      .from('daily_checkins')
      .insert([
        {
          user_id: parseInt(userId, 10),
          tanggal_checkin: date, // Format tanggal 'YYYY-MM-DD' dari backend service
          streak_count: parseInt(streakCount, 10),
          // 🟢 SINKRONISASI KOLOM BARU: Memasukkan data ke 3 kolom baru di database Supabase kelompokmu
          materi_dipelajari: materiDipelajari,
          mood: mood,
           tingkat_kesulitan: parseInt(tingkatKesulitan, 10)
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

// 🌟 FUNGSI BARU PENYELAMAT LIST TABEL ORANG TUA:
// Mengambil semua baris riwayat check-in anak dari Supabase tanpa batasan tanggal tunggal
export const getCheckInHistoryByUserId = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', parseInt(userId, 10))
      .order('tanggal_checkin', { ascending: false }); // Mengurutkan dari tanggal paling baru (list teratas)

    if (error) throw error;
    return data || []; // Mengembalikan array list objek, atau array kosong jika belum ada history
  } catch (error) {
    console.error("❌ [Checkin Repository] Gagal mengambil list data riwayat check-in dari Supabase:", error.message);
    throw error;
  }
};