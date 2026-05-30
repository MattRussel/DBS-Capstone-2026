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
          // 🟢 BYPASS NGROK: Mencegah error fetch failed akibat halaman warning Ngrok
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ 
          message: `Buat kelompokkan 3 soal pilihan ganda tentang materi sains '${topik}' untuk anak SD. Berikan hasil akhir HARUS langsung berbentuk array JSON tanpa penjelasan kata-kata pembuka/penutup lain, dengan format struktur objek seperti ini: [{"soal": "...", "opsi": ["A...", "B...", "C...", "D..."], "jawaban_benar": "A"}].`,
          session_id: `quiz_user_${user_id}`
        })
      });

      if (!aiResponse.ok) {
        throw new Error(`API FastAPI merespons dengan status: ${aiResponse.status} (Kemungkinan URL Ngrok Expired)`);
      }

      const aiData = await aiResponse.json();
      let teksBalasanKuis = aiData.answer;

      if (!teksBalasanKuis) {
        throw new Error("Respons teks kuis dari FastAPI kosong.");
      }

      // 🧠 SAFETY CLEANUP: Bersihkan karakter backtick ```json jika LLM mengirim format markdown
      if (teksBalasanKuis.includes("```")) {
        // 🟢 PERBAIKAN BUG: Menggunakan .trim() milik JavaScript asli agar tidak crash
        teksBalasanKuis = teksBalasanKuis.replace(/```json|```/g, "").trim();
      }

      const arraySoalKuis = JSON.parse(teksBalasanKuis);

      return {
        type: "QUIZ_DATA",
        content: arraySoalKuis 
      };

    } catch (error) {
      console.error("❌ [Quiz Generation Error]: Gagal generate kuis lewat prompt chat:", error.message);
      
      // Fallback Darurat agar modul kuis frontend tidak hang/stuck
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

    // 1. Tembak API FastAPI AI Engineer terlebih dahulu
    const aiResponse = await fetch(`${AI_ENGINEER_API_URL}/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // 🟢 BYPASS NGROK: Mencegah error fetch failed akibat halaman warning Ngrok
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        message: pesan, 
        session_id: `chat_user_${user_id}` 
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`API Tim AI merespons dengan status: ${aiResponse.status} (Kemungkinan URL Ngrok Expired)`);
    }

    const aiData = await aiResponse.json();
    const balasanAI = aiData.answer || "Halo Ilmuwan Cilik!";

    // 2. 💾 SIMPAN KE SUPABASE (Aman jaya tanpa hambatan Foreign Key)
    console.log("⏳ [Supabase Insert] Menyimpan log obrolan sukses ke chatbot_history...");
    await chatbotRepository.saveChatMessage(user_id, pesan, balasanAI, {
      topik: aiData.category || topik || null,
      subtopik: aiData.subtopik || null,
      konteks: aiData.question_matched || null,
      jenisPertanyaan: aiData.predicted_topic || null,
      kompleksitas: aiData.similarity_score ? aiData.similarity_score.toString() : null
    });

    return {
      type: "CHAT_TEXT",
      content: balasanAI
    };

  } catch (error) {
    console.error("❌ [Chatbot Service Error]:", error.message);
    
    // Balasan Fallback pintar jika server python / ngrok mati di tengah jalan
    const balasanFallback = `Halo Ilmuwan Cilik! 👋 Profesor Cerdas sedang merapikan laboratorium jurnal sains dulu. Yuk coba kembali sesaat lagi atau selesaikan misi yang lain! 🚀`;
    return {
      type: "CHAT_TEXT",
      content: balasanFallback
    };
  }
};