// backend/repositories/chatbotRepository.js
import supabase from '../config/db.js';

/**
 * 📜 Ambil riwayat chat terakhir anak
 */
export const getChatHistoryByUserId = async (user_id, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('chatbot_history')
      .select('message, bot_response, topik, subtopik')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.reverse();
  } catch (error) {
    console.error("❌ [Chatbot Repository] Gagal mengambil riwayat obrolan:", error.message);
    throw error;
  }
};

/**
 * 💾 Catat obrolan baru langsung berpasangan ke Supabase
 */
export const saveChatMessage = async (user_id, message, botResponse, metadata = {}) => {
  try {
    const { topik, subtopik, konteks, jenis_pertanyaan, kompleksitas } = metadata;

    console.log("⏳ [Supabase Insert] Mencoba menyimpan ke chatbot_history...");
    console.log(`Detail Data -> User: ${user_id}, Topik: ${topik}`);

    // 🟢 PERBAIKAN UTAMA: Bersihkan objek insert dari variabel-variabel controller liar
    const { data, error } = await supabase
      .from('chatbot_history')
      .insert([
        {
          user_id: parseInt(user_id, 10),
          message: message,                                // Menggunakan argumen 'message'
          bot_response: botResponse,                       // Menggunakan argumen 'botResponse'
          topik: topik || null,                            // Menggunakan properti hasil destructuring metadata
          subtopik: subtopik || null,
          konteks: konteks || 'normal',    
          jenis_pertanyaan: jenis_pertanyaan || null,  
          kompleksitas: kompleksitas || null  
        }
      ])
      .select()
      .maybeSingle(); 

    if (error) {
      if (error.code === '23503') {
        console.error("❌ [Database Error] Gagal simpan karena foreign key constraint! Topik '" + topik + "' tidak terdaftar di tabel knowledge.");
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("❌ [Chatbot Repository] Gagal menyimpan log pesan chatbot:", error.message);
    throw error;
  }
};