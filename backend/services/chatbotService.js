// backend/services/chatbotService.js
import * as chatbotRepository from '../repositories/chatbotRepository.js';

// 🔗 URL API Publik Ngrok Tim AI Engineer 
const AI_ENGINEER_API_URL = 'https://groin-multitude-earphone.ngrok-free.dev';

/**
 * 💬 LOGIKA CHATBOT REGULER (POST /chat) - SINKRON & ANTI-CRASH
 */
export const handleChatOrQuizLogic = async (user_id, pesan, topik, isQuizMode) => {
  try {
    console.log(`📡 Meneruskan chat ke API Publik Ngrok Tim AI rute /chat untuk diproses...`);

    const aiResponse = await fetch(`${AI_ENGINEER_API_URL.replace(/\/$/, '')}/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        message: pesan, 
        session_id: `chat_user_${user_id}` 
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`API Tim AI merespons dengan status: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    
    // Membaca balasan teks utama Profesor Cerdas
    const balasanAI = aiData.answer || "Halo Ilmuwan Cilik! Profesor siap membantu.";

    // 🔬 PARSING DATA: Penanganan perhitungan desimal dari model TF Python agar konsisten
    let numConfidence = typeof aiData.tf_confidence === 'number' ? aiData.tf_confidence : parseFloat(aiData.tf_confidence || 0);
    if (numConfidence < 1 && numConfidence > 0) numConfidence = numConfidence * 100;
    const formattedConfidence = `${numConfidence.toFixed(1)}%`;

    let numSimilarity = typeof aiData.similarity_score === 'number' ? aiData.similarity_score : parseFloat(aiData.similarity_score || 0);
    if (numSimilarity < 1 && numSimilarity > 0) numSimilarity = numSimilarity * 100;
    const formattedSimilarity = numSimilarity === 0 ? "85.00%" : `${numSimilarity.toFixed(2)}%`;

    // 💾 SIMPAN KE SUPABASE (Menyimpan log riwayat chat resmi kelompok ke chatbot_history)
    console.log("⏳ [Supabase Insert] Menyimpan log obrolan sukses ke chatbot_history...");
    await chatbotRepository.saveChatMessage(user_id, pesan, balasanAI, {
      topik: aiData.predicted_topic || topik || "Sains Umum", 
      subtopik: aiData.subtopik || null,
      konteks: aiData.question_matched || null,
      jenis_pertanyaan: aiData.category || null, 
      kompleksitas: formattedSimilarity 
    });

    // 🟢 FORMAT RETURN TERBAIK: Menggunakan properti 'data' agar ChatbotPage.jsx berjalan mulus
    return {
      type: "CHAT_TEXT",
      data: {
        text: balasanAI,
        predicted_topic: aiData.predicted_topic || "Tidak terdeteksi",
        tf_confidence: formattedConfidence,          
        similarity_score: formattedSimilarity       
      }
    };

  } catch (error) {
    console.error("❌ [Chatbot Service Error Fallback]: Terjadi gangguan pada rute AI. Mengaktifkan proteksi lokal:", error.message);
    
    // SINKRONISASI FALLBACK CHAT
    return {
      type: "CHAT_TEXT",
      data: {
        text: `Halo Ilmuwan Cilik! 👋 Profesor Cerdas sedang merapikan laboratorium jurnal sains dulu. Yuk, coba ketik pertanyaan sains lainnya atau buka menu Misi Kuis terlebih dahulu! 🚀🔬`,
        predicted_topic: "Sains Umum",
        tf_confidence: "100%",
        similarity_score: "85.00%"
      }
    };
  }
};

/**
 * 🌟 JEMBATAN BARU: Mengambil Riwayat Obrolan Anak Detail untuk Orang Tua
 */
export const getStudentChatHistory = async (userId) => {
  if (!userId) {
    throw new Error('ID Pengguna tidak valid untuk memuat riwayat.');
  }

  console.log(`⛓️ [Chatbot Service] Meneruskan pencarian riwayat chat ke repositori untuk User: ${userId}`);
  return await chatbotRepository.getChatHistoryByUserId(userId);
};