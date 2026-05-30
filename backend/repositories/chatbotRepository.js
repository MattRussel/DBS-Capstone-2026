// backend/repositories/chatbotRepository.js
import supabase from '../config/db.js'; // Menyesuaikan dengan lokasi db.js kamu yang baru

/**
 * 📜 Ambil riwayat chat terakhir anak
 * Diubah agar mengambil kolom message dan bot_response untuk memori konteks AI
 */
export const getChatHistoryByUserId = async (userId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('chatbot_history')
      .select('message, bot_response, topik, subtopik')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // Ambil yang paling baru dulu
      .limit(limit);

    if (error) throw error;

    // Balikkan urutannya agar kronologis (dari pesan lama ke pesan baru) saat dibaca Flask AI
    return data.reverse();
  } catch (error) {
    console.error("❌ [Chatbot Repository] Gagal mengambil riwayat obrolan:", error.message);
    throw error;
  }
};

/**
 * 💾 Catat obrolan baru langsung berpasangan (Pesan Anak + Jawaban Bot) ke Supabase
 */
export const saveChatMessage = async (userId, message, botResponse, metadata = {}) => {
  try {
    const { topik, subtopik, konteks, jenisPertanyaan, kompleksitas } = metadata;

    const { data, error } = await supabase
      .from('chatbot_history')
      .insert([
        {
          user_id: parseInt(userId, 10),
          message: message,                     // Ketikan dari si anak
          bot_response: botResponse,             // Jawaban pintar dari Flask AI
          topik: topik || null,                 // Diikat via FK ke knowledge(topik)
          subtopik: subtopik || null,
          konteks: konteks || null,
          jenis_pertanyaan: jenisPertanyaan || null,
          kompleksitas: kompleksitas || null
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data; // Mengembalikan log chat yang berhasil disimpan
  } catch (error) {
    console.error("❌ [Chatbot Repository] Gagal menyimpan log pesan chatbot:", error.message);
    throw error;
  }
};