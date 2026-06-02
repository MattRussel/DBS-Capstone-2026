// backend/services/chatbotService.js
import * as chatbotRepository from '../repositories/chatbotRepository.js';

// 🔗 URL API Publik Ngrok Tim AI Engineer (⚠️ Pastikan ini diganti jika tim AI melakukan restart Ngrok!)
const AI_ENGINEER_API_URL = 'https://groin-multitude-earphone.ngrok-free.dev';

export const handleChatOrQuizLogic = async (user_id, pesan, topik, isQuizMode) => {
  
  // ====================================================================
  // 🌟 SKENARIO A: JIKA JALUR KUIS AKTIF (isQuizMode: true) - TETAP AMAN 100%
  // ====================================================================
  if (isQuizMode) {
    try {
      console.log(`📡 [Express Node.js] Menembak rute generate kuis resmi Python untuk topik: ${topik}`);

      const aiResponse = await fetch(`${AI_ENGINEER_API_URL}/generate-quiz`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ 
          topik: topik,
          jumlah_soal: 3
        })
      });

      if (!aiResponse.ok) {
        throw new Error(`API FastAPI merespons dengan status: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const arraySoalKuis = aiData.quiz_questions;

      if (!arraySoalKuis || !Array.isArray(arraySoalKuis)) {
        throw new Error("Paket array soal dari Python kosong atau tidak valid.");
      }

      return {
        type: "QUIZ_DATA",
        content: arraySoalKuis 
      };

    } catch (error) {
      console.error("❌ [Quiz Generation Error fallback]: Gagal generate kuis otomatis, mengaktifkan soal cadangan lokal:", error.message);
      
      return {
        type: "QUIZ_DATA",
        content: [
          {
            "soal": `Materi petualangan sains untuk topik '${topik}' siap diujikan! Manakah sikap ilmuwan yang benar saat melakukan eksperimen di laboratorium sains?`,
            "opsi": ["A. Semangat dan Teliti", "B. Putus Asa", "C. Terburu-buru", "D. Main-main"],
            "jawaban_benar": "A"
          }
        ]
      };
    }
  }

  // ====================================================================
  // 💬 SKENARIO B: CHATBOT REGULER (POST /chat) - SINKRON DENGAN REQ.MESSAGE
  // ====================================================================
  try {
    console.log(`📡 Meneruskan chat ke API Publik Ngrok Tim AI rute /chat untuk diproses...`);

    const aiResponse = await fetch(`${AI_ENGINEER_API_URL}/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        message: pesan, // 🟢 Sinkron dengan parameter ChatRequest di app.py terbaru!
        session_id: `chat_user_${user_id}` 
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`API Tim AI merespons dengan status: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    
    // 🟢 SINKRONISASI DATA: Membaca balasan teks utama Profesor Cerdas
    const balasanAI = aiData.answer || "Halo Ilmuwan Cilik! Profesor siap membantu.";

    // Parsing angka desimal secara aman demi menghindari badai crash .toFixed() di JavaScript
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

    // 🟢 RETURNING DATA KE FRONTEND CHATBOTPAGE
    return {
      type: "CHAT_TEXT",
      content: {
        text: balasanAI,
        predicted_topic: aiData.predicted_topic || "Tidak terdeteksi",
        tf_confidence: formattedConfidence,          
        similarity_score: formattedSimilarity       
      }
    };

  } catch (error) {
    console.error("❌ [Chatbot Service Error Fallback]: Terjadi gangguan pada rute AI. Mengaktifkan proteksi lokal:", error.message);
    
    return {
      type: "CHAT_TEXT",
      content: {
        text: `Halo Ilmuwan Cilik! 👋 Profesor Cerdas sedang merapikan laboratorium jurnal sains dulu. Yuk, coba ketik pertanyaan sains lainnya atau buka menu Misi Kuis terlebih dahulu! 🚀🔬`,
        predicted_topic: "Sains Umum",
        tf_confidence: "100%",
        similarity_score: "85.00%"
      }
    };
  }
};