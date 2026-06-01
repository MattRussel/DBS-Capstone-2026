// backend/repositories/chatbotRepository.js
import supabase from '../config/db.js';

/**
 * 📜 Ambil riwayat chat terakhir anak
 */
export const getChatHistoryByUserId = async (user_id, limit = 10) => {
  try {
    // 🟢 PERBAIKAN 1: Gunakan nama parameter user_id agar konsisten dengan service
    const { data, error } = await supabase
      .from('chatbot_history')
      .select('message, bot_response, topik, subtopik')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // 🟢 PERBAIKAN 2: Antisipasi safety check jika data belum ada (null/kosong) agar tidak crash saat .reverse()
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
    const { topik, subtopik, konteks, jenisPertanyaan, kompleksitas } = metadata;

    // 🧪 LOGGING SANITY CHECK: Intip apa saja data yang mau dikirim ke Supabase via terminal backend
    console.log("⏳ [Supabase Insert] Mencoba menyimpan ke chatbot_history...");
    console.log(`Detail Data -> User: ${user_id}, Topik: ${topik}`);

    // Contoh Logika Query di Backend Express kelompokmu:
    const { data, error } = await supabase
      .from('chatbot_history')
      .insert([
        {
          user_id: req.body.user_id,
          message: req.body.message,               // Kolom text (Non-nullable)
          bot_response: aiResponseText,            // Kolom text (Non-nullable)
          topik: aiPredictedTopic,                 // Kolom varchar (Nullable)
          subtopik: aiPredictedSubTopic || null,   // Kolom varchar (Nullable)
          konteks: finalContextTag || 'normal',    // Kolom text (Tempat menyaring kata 'peringatan/kasar')
          jenis_pertanyaan: ragQueryType || null,  // Kolom varchar (Nullable)
          kompleksitas: aiComplexityLevel || null  // Kolom varchar (Nullable)
        }
      ])
      .select()
      .maybeSingle(); // 🟢 Lebih aman menggunakan maybeSingle() jika ada potensi null / kegagalan constraint

    if (error) {
      // 🚨 Tangkap secara spesifik jika masalahnya ada di Foreign Key
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