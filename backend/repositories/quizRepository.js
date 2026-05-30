// backend/repositories/quizRepository.js
import supabase from '../config/db.js'; // Menyesuaikan dengan lokasi db.js kamu yang baru

/**
 * 💾 Menyimpan hasil skor kuis mandiri anak ke Supabase
 */
export const saveScoreToDb = async (userId, topikIpa, skorTotal, jawabanBenar) => {
  try {
    const { data, error } = await supabase
      .from('quiz_scores')
      .insert([
        {
          user_id: parseInt(userId, 10),
          topik_ipa: topikIpa, // Diikat via Foreign Key ke knowledge(topik)
          skor_total: parseInt(skorTotal, 10),
          jawaban_benar: parseInt(jawabanBenar, 10)
          // 💡 Catatan: Kolom 'created_at' tidak perlu ditulis karena Supabase otomatis mengisinya dengan TIMESTAMP saat ini
        }
      ])
      .select() // Mengembalikan data yang baru dimasukkan
      .single();

    if (error) throw error;
    
    return data; // Mengembalikan objek hasil skor kuis yang sukses disimpan
  } catch (error) {
    console.error("❌ [Quiz Repository] Gagal menyimpan skor kuis ke Supabase:", error.message);
    throw error; // Lemparkan eror ke service -> controller
  }
};