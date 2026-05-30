// backend/repositories/questRepository.js
import supabase from '../config/db.js'; // Menyesuaikan dengan lokasi db.js kamu yang baru

/**
 * 🗺️ 1. Ambil semua daftar misi master dari database
 * Digunakan untuk menampilkan daftar tantangan sains di halaman papan misi React
 */
export const getAllQuests = async () => {
  try {
    const { data, error } = await supabase
      .from('quests')
      .select('*');

    if (error) throw error;
    return data; // Mengembalikan array berisi seluruh daftar misi master
  } catch (error) {
    console.error("❌ [Quest Repository] Gagal mengambil daftar misi master:", error.message);
    throw error;
  }
};

/**
 * 📊 2. Ambil status progress misi spesifik yang sedang diambil si anak
 * Digunakan untuk mengecek apakah anak sudah mendaftar misi ini dan berapa progress-nya
 */
export const getUserQuestStatus = async (userId, questId) => {
  try {
    const { data, error } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_id', userId)
      .eq('quest_id', questId)
      .maybeSingle(); // Mengembalikan 1 objek progress anak, atau null jika belum mulai mengambil misi

    if (error) throw error;
    return data; 
  } catch (error) {
    console.error("❌ [Quest Repository] Gagal mengambil status progress misi anak:", error.message);
    throw error;
  }
};