// backend/services/chatbotService.js
import * as chatbotRepository from '../repositories/chatbotRepository.js';

// 🔗 URL API Publik Ngrok Tim AI Engineer (⚠️ Pastikan ini diganti jika tim AI restart Ngrok!)
const AI_ENGINEER_API_URL = 'https://groin-multitude-earphone.ngrok-free.dev';

export const handleChatOrQuizLogic = async (user_id, pesan, topik, isQuizMode) => {
  
  // ====================================================================
  // 🌟 SKENARIO A: JIKA JALUR KUIS AKTIF (isQuizMode: true)
  // ====================================================================
  if (isQuizMode) {
    try {
      console.log(`📡 Menghubungkan ke API FastAPI Chat untuk membangkitkan kuis topik: ${topik}`);

      const aiResponse = await fetch(`${AI_ENGINEER_API_URL}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ 
          message: `Buat kelompokkan 3 soal pilihan ganda tentang materi sains '${topik}' untuk anak SD. Berikan hasil akhir HARUS langsung berbentuk array JSON tanpa penjelasan kata-kata pembuka/penutup lain, dengan format struktur objek seperti ini: [{"soal": "...", "opsi": ["A...", "B...", "C...", "D..."], "jawaban_benar": "A"}].`,
          session_id: `quiz_user_${user_id}`
        })
      });

      if (!aiResponse.ok) {
        throw new Error(`API FastAPI merespons dengan status: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      let teksBalasanKuis = aiData.answer;

      if (!teksBalasanKuis) {
        throw new Error("Respons teks kuis dari FastAPI kosong.");
      }

      if (teksBalasanKuis.includes("```")) {
        teksBalasanKuis = teksBalasanKuis.replace(/```json|```/g, "").trim();
      }

      const arraySoalKuis = JSON.parse(teksBalasanKuis);

      return {
        type: "QUIZ_DATA",
        content: arraySoalKuis 
      };

    } catch (error) {
      console.error("❌ [Quiz Generation Error]: Gagal generate kuis lewat prompt chat:", error.message);
      return {
        type: "QUIZ_DATA",
        content: [
          {
            "soal": `Materi petualangan sains untuk topik '${topik}' siap diujikan! Manakah sikap ilmuwan yang benar saat melakukan eksperimen?`,
            "opsi": ["A. Semangat dan Teliti", "B. Putus Asa", "C. Terburu-buru", "D. Main-main"],
            "jawaban_benar": "A"
          }
        ]
      };
    }
  }

  // ====================================================================
  // 💬 SKENARIO B: CHATBOT REGULER (POST /chat)
  // ====================================================================
  try {
    console.log(`📡 Meneruskan chat ke API Publik Ngrok Tim AI untuk diproses...`);

    const aiResponse = await fetch(`${AI_ENGINEER_API_URL}/chat`, {
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
    const balasanAI = aiData.answer || "Halo Ilmuwan Cilik!";

    // 🔬 PARSING DATA AGAR ANGKA KONSISTEN DENGAN PYTHON TERMINAL
    let rawConfidence = aiData.tf_confidence ? parseFloat(aiData.tf_confidence) : 0;
    let formattedConfidence = rawConfidence < 1 ? `${(rawConfidence * 100).toFixed(1)}%` : `${rawConfidence.toFixed(1)}%`;

    let rawSimilarity = aiData.similarity_score ? parseFloat(aiData.similarity_score) : 0;
    // Jika dari Python bernilai 0.6349, kalikan 100 -> 63.5%. Jika sudah 63.49, langsung tampilkan.
    let formattedSimilarity = rawSimilarity < 1 ? `${(rawSimilarity * 100).toFixed(2)}%` : `${rawSimilarity.toFixed(2)}%`;

    // 1. 💾 SIMPAN KE SUPABASE (Data bersih konsisten)
    console.log("⏳ [Supabase Insert] Menyimpan log obrolan sukses ke chatbot_history...");
    await chatbotRepository.saveChatMessage(user_id, pesan, balasanAI, {
      topik: aiData.predicted_topic || topik || null, 
      subtopik: aiData.subtopik || null,
      konteks: aiData.question_matched || null,
      jenisPertanyaan: aiData.category || null,       
      kompleksitas: formattedSimilarity 
    });

    // 2. 🟢 RETURNING DATA KE FRONTEND
    return {
      type: "CHAT_TEXT",
      content: {
        text: balasanAI,
        predicted_topic: aiData.predicted_topic || "Tidak terdeteksi",
        tf_confidence: formattedConfidence,          // 🧠 Hasil Model TF (cth: 13.0%)
        similarity_score: formattedSimilarity       // 🎯 Hasil Jarak RAG TiDB (cth: 63.49%)
      }
    };

  } catch (error) {
    console.error("❌ [Chatbot Service Error]:", error.message);
    return {
      type: "CHAT_TEXT",
      content: {
        text: `Halo Ilmuwan Cilik! 👋 Profesor Cerdas sedang merapikan laboratorium jurnal sains dulu. Yuk coba kembali sesaat lagi! 🚀`,
        predicted_topic: null,
        tf_confidence: null,
        similarity_score: null
      }
    };
  }
};