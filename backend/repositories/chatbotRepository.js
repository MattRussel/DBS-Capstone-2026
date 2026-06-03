// backend/repositories/chatbotRepository.js
import supabase from '../config/db.js';

/**
 * 📜 Ambil riwayat chat terakhir anak (Terisolasi Ketat per User ID)
 */
export const getChatHistoryByUserId = async (user_id, limit = 10) => {
  try {
    // 🟢 PROTEKSI: Pastikan ID diubah ke Integer agar kueri Supabase presisi dan tidak bocor antar-user
    const cleanUserId = parseInt(user_id, 10);
    
    if (isNaN(cleanUserId)) return [];

    const { data, error } = await supabase
      .from('chatbot_history')
      .select('message, bot_response, topik, subtopik')
      .eq('user_id', cleanUserId) // Menggunakan ID yang sudah steril
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Mengembalikan urutan chat dari yang terlama ke terbaru agar pas dibaca di layar chat React
    return data.reverse();
  } catch (error) {
    console.error("❌ [Chatbot Repository Error] Gagal mengambil riwayat obrolan:", error.message);
    throw error;
  }
};

/**
 * 💾 Catat obrolan baru langsung berpasangan ke Supabase Cloud
 */
export const saveChatMessage = async (user_id, message, botResponse, metadata = {}) => {
  try {
    const { topik, subtopik, konteks, jenis_pertanyaan, kompleksitas } = metadata;

    const cleanUserId = parseInt(user_id, 10);
    if (isNaN(cleanUserId)) {
      throw new Error('ID Pengguna tidak valid (Harus berupa angka).');
    }

    console.log("⏳ [Supabase Insert] Mencoba menyimpan log ke chatbot_history...");
    console.log(`Detail Data -> User ID: ${cleanUserId}, Topik: ${topik || 'Sains Umum'}`);

    // Eksekusi penyimpanan data dengan format snake_case murni sesuai struktur tabel Supabase
    const { data, error } = await supabase
      .from('chatbot_history')
      .insert([
        {
          user_id: cleanUserId,
          message: message,                                 
          bot_response: botResponse,                        
          topik: topik || null,                             
          subtopik: subtopik || null,
          konteks: konteks || 'normal',    
          jenis_pertanyaan: jenis_pertanyaan || null,  
          kompleksitas: kompleksitas || null  
        }
      ])
      .select()
      .maybeSingle(); 

    if (error) {
      // 🟢 FORMAT ERROR TERBAIK: Memberikan log super spesifik ke terminal jika Foreign Key melanggar tabel knowledge
      if (error.code === '23503') {
        console.error(`❌ [Database Constraint Error] Topik '${topik}' tidak terdaftar atau gagal relasi di tabel knowledge!`);
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("❌ [Chatbot Repository Error] Gagal menyimpan log pesan chatbot:", error.message);
    throw error;
  }
};