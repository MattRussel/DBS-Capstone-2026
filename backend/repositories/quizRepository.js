// backend/repositories/quizRepository.js
import supabase from '../config/db.js';

/**
 * 💾 Menyimpan hasil skor kuis mandiri anak ke Supabase Cloud
 */
export const saveScoreToDb = async (userId, topikIpa, skorTotal, jawabanBenar) => {
  try {
    // Bersihkan spasi berlebih di awal/akhir string untuk menghindari kegagalan pencocokan FK
    const cleanTopikIpa = topikIpa ? topikIpa.trim() : '';

    const { data, error } = await supabase
      .from('quiz_scores')
      .insert([
        {
          user_id: parseInt(userId, 10),
          topik_ipa: cleanTopikIpa, // Menggunakan string topik yang sudah steril
          skor_total: parseInt(skorTotal, 10),
          jawaban_benar: parseInt(jawabanBenar, 10)
        }
      ])
      .select()
      .maybeSingle(); // Menggunakan maybeSingle agar lebih aman dan tidak melempar error jika data kosong

    if (error) {
      // 🟢 DETEKSI EROR KHUSUS: Memberikan diagnosa instan jika relasi tabel kuis mampet
      if (error.code === '23503') {
        console.error(`❌ [Supabase FK Error] Gagal simpan nilai! String topik '${cleanTopikIpa}' tidak terdaftar atau tidak cocok karakternya dengan kolom referensi master di tabel knowledge.`);
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("❌ [Quiz Repository] Gagal menyimpan skor kuis ke Supabase:", error.message);
    throw error;
  }
};

/**
 * 📜 Ambil riwayat skor kuis anak (Terisolasi Ketat per User ID)
 */
export const getQuizScoresByUserId = async (userId) => {
  try {
    const cleanUserId = parseInt(userId, 10);
    
    if (isNaN(cleanUserId)) return [];

    const { data, error } = await supabase
      .from('quiz_scores')
      .select('*')
      .eq('user_id', cleanUserId) // Memastikan pencarian riwayat mengunci murni hanya milik user login ini
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("❌ [Quiz Repository Error] Gagal select dari quiz_scores:", error.message);
    throw error;
  }
};