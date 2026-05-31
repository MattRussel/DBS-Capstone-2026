// backend/controllers/chatbotController.js
import * as chatbotService from '../services/chatbotService.js';

export const processChatbotRequest = async (req, res) => {
  const { user_id, pesan, topik, isQuizMode } = req.body;

  // 🛡️ VALIDASI PENGUNCI API: Pastikan user_id DAN pesan ada isinya sebelum diproses
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
    // 🧠 Nilai 'topik' yang null dari frontend akan langsung dioper ke service dengan aman.
    // Di dalam service, properti category hasil prediksi FastAPI / TiDB RAG yang akan mengisi kekosongan tersebut.
    const hasil = await chatbotService.handleChatOrQuizLogic(user_id, pesan, topik, isQuizMode);
    
    return res.status(200).json({
      success: true,
      type: hasil.type, // Menjadi penanda di React: 'CHAT_TEXT' atau 'QUIZ_DATA'
      data: hasil.content
    });
  } catch (error) {
    console.error("❌ [Chatbot Controller Error]:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Waduh, otak chatbot macet: ' + error.message 
    });
  }
};