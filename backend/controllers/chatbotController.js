// backend/controllers/chatbotController.js
import * as chatbotService from '../services/chatbotService.js';

export const processChatbotRequest = async (req, res) => {
  const { user_id, pesan, topik, isQuizMode } = req.body;

  // 🛡️ VALIDASI PENGUNCI API
  if (!user_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Gagal! ID Pengguna wajib dicantumkan.' 
    });
  }

  if (!pesan || !pesan.trim()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Gagal! Pesan obrolan tidak boleh kosong.' 
    });
  }

  try {
    // 🟢 MENGEMBALIKAN FUNGSI ASLI: Menembak langsung ke service untuk dterusukan ke Python/Supabase
    const hasil = await chatbotService.handleChatOrQuizLogic(user_id, pesan, topik, isQuizMode);
    
    return res.status(200).json({
      success: true,
      type: hasil.type, 
      data: hasil // Mengirimkan seluruh objek bodi data murni hasil return service
    });
  } catch (error) {
    console.error("❌ [Chatbot Controller Error]:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Waduh, otak chatbot macet: ' + error.message 
    });
  }
};