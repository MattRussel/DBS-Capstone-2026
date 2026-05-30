// backend/services/chatbotService.js
import * as chatbotRepository from '../repositories/chatbotRepository.js';

// 🔗 URL API Publik yang dibuat oleh Tim AI Engineer via Ngrok
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
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          // 🧠 PROMPT ENGINEERING: Memaksa model RAG/LLM memuntahkan format Array JSON soal kuis
          message: `Buat kelompokkan 3 soal pilihan ganda tentang materi sains '${topik}' untuk anak SD. Berikan hasil akhir HARUS langsung berbentuk array JSON tanpa penjelasan kata-kata pembuka/penutup lain, dengan format struktur objek seperti ini: [{"soal": "...", "opsi": ["A...", "B...", "C...", "D..."], "jawaban_benar": "A"}].`,
          session_id: `quiz_user_${user_id}`
        })
      });

      if (!aiResponse.ok) {
        throw new Error(`API FastAPI merespons dengan status: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      
      // 🟢 SINKRONISASI 1: Ambil teks jawaban dari properti '.answer' sesuai output asli FastAPI
      const teksBalasanKuis = aiData.answer;

      if (!teksBalasanKuis) {
        throw new Error("Respons teks kuis dari FastAPI kosong.");
      }

      // 🧠 Mengubah teks string markdown/mentah LLM menjadi Array Objek JavaScript asli
      const arraySoalKuis = JSON.parse(teksBalasanKuis);

      return {
        type: "QUIZ_DATA",
        content: arraySoalKuis 
      };

    } catch (error) {
      console.error("❌ [Quiz Generation Error]: Gagal generate kuis lewat prompt chat:", error.message);
      
      // Fallback Darurat agar game kuis anak tidak macet/stuck di layar
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

    // Kirim ke endpoint POST /chat milik tim AI sesuai ChatRequest schema FastAPI
    const aiResponse = await fetch(`${AI_ENGINEER_API_URL}/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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
    
    // 🟢 SINKRONISASI 2: Ambil teks jawaban utama dari properti '.answer' FastAPI
    const balasanAI = aiData.answer || "Halo Ilmuwan Cilik!";

    // 💾 SIMPAN KE SUPABASE: Manfaatkan kekayaan metadata dari output FastAPI kelompokmu!
    await chatbotRepository.saveChatMessage(user_id, pesan, balasanAI, {
      topik: aiData.category || topik || null,                // Menangkap 'category' TiDB RAG
      subtopik: aiData.subtopik || null,                      // Menangkap 'subtopik' TiDB RAG
      konteks: aiData.question_matched || null,               // Menyimpan pertanyaan terdekat yang match
      jenisPertanyaan: aiData.predicted_topic || null,        // Menyimpan hasil prediksi klasifikasi model TF
      kompleksitas: aiData.similarity_score ? aiData.similarity_score.toString() : null // Nilai kedekatan semantik
    });

    return {
      type: "CHAT_TEXT",
      content: balasanAI
    };

  } catch (error) {
    console.error("❌ [Chatbot Service Error]:", error);
    
    const balasanFallback = `Halo Ilmuwan Cilik! 👋 Profesor Cerdas sedang merapikan laboratorium jurnal sains dulu. Yuk coba kembali sesaat lagi atau selesaikan misi yang lain! 🚀`;
    return {
      type: "CHAT_TEXT",
      content: balasanFallback
    };
  }
};