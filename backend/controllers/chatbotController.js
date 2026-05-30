// backend/controllers/chatbotController.js
import * as chatbotService from '../services/chatbotService.js';

export const processChatbotRequest = async (req, res) => {
  const { user_id, pesan, topik, isQuizMode } = req.body;

  if (!user_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Gagal! ID Pengguna wajib dicantumkan.' 
    });
  }

  try {
    const hasil = await chatbotService.handleChatOrQuizLogic(user_id, pesan, topik, isQuizMode);
    
    return res.status(200).json({
      success: true,
      type: hasil.type, // Menjadi penanda di React: 'CHAT_TEXT' atau 'QUIZ_DATA'
      data: hasil.content
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Waduh, otak chatbot macet: ' + error.message 
    });
  }
};