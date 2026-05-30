// backend/services/chatbotService.js
import * as chatbotRepository from '../repositories/chatbotRepository.js';

// 🔗 URL API Publik yang dibuat oleh Tim AI Engineer via Ngrok
const AI_ENGINEER_API_URL = 'https://groin-multitude-earphone.ngrok-free.dev';

export const handleChatOrQuizLogic = async (userId, pesan, topik, isQuizMode) => {
  
  // ====================================================================
  // 🌟 SKENARIO A: JIKA JALUR KUIS AKTIF (isQuizMode: true)
  // ====================================================================
  if (isQuizMode) {
    try {
      console.log(`📡 Menghubungkan ke API Tim AI untuk mengambil data kuis: ${topik}`);

      const aiResponse = await fetch(`${AI_ENGINEER_API_URL}/generate-quiz`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ topik: topik, jumlah_soal: 3 })
      });

      if (!aiResponse.ok) {
        throw new Error(`API Tim AI merespons dengan status: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();

      return {
        type: "QUIZ_DATA",
        content: aiData.quiz_questions 
      };

    } catch (error) {
      console.error("❌ Gagal mengambil kuis dari API Tim AI:", error.message);
      
      // Fallback Darurat: Jika API Tim AI mati, tampilkan cetakan kuis kosong
      return {
        type: "QUIZ_DATA",
        content: [
          {
            "soal": `Materi kuis untuk topik '${topik}' sedang dipersiapkan oleh Tim AI kami! ✨`,
            "opsi": ["A. Semangat", "B. Pantang Menyerah", "C. Sukses Capstone", "D. Kerja Bagus"],
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
    // 1. Ambil memori obrolan lama dari Supabase (Isinya berpasangan per baris)
    const historyMentah = await chatbotRepository.getChatHistoryByUserId(userId);
    
    // 🔄 RE-MAPPING: Bongkar format sebaris Supabase menjadi format array beruntun (user & assistant) untuk kebutuhan Flask AI
    const percakapanMasaLalu = [];
    historyMentah.forEach(h => {
      percakapanMasaLalu.push({ role: 'user', content: h.message });
      percakapanMasaLalu.push({ role: 'assistant', content: h.bot_response });
    });

    console.log(`📡 Meneruskan chat ke API Publik Ngrok Tim AI untuk diproses...`);

    // 2. Kirim ke endpoint POST /chat milik tim AI
    const aiResponse = await fetch(`${AI_ENGINEER_API_URL}/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        message: pesan, 
        history: percakapanMasaLalu
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`API Tim AI merespons dengan status: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    
    const balasanAI = aiData.reply_message || aiData.reply || aiData.response || "Halo Ilmuwan Cilik!";

    // 3. 💾 SIMPAN KE SUPABASE: Cukup panggil 1x karena fungsi baru kita menyimpan sebaris berpasangan
    // Kita bisa menyelipkan parameter topik jika AI-nya mengembalikan data topik di JSON responsnya
    await chatbotRepository.saveChatMessage(userId, pesan, balasanAI, {
      topik: aiData.topik || topik || null,
      subtopik: aiData.subtopik || null,
      konteks: aiData.konteks || null,
      jenisPertanyaan: aiData.jenis_pertanyaan || null,
      kompleksitas: aiData.kompleksitas || null
    });

    return {
      type: "CHAT_TEXT",
      content: balasanAI
    };

  } catch (error) {
    console.error("❌ Gagal mendapatkan balasan dari API Tim AI:", error.message);
    
    const balasanFallback = `Halo Ilmuwan Cilik! 👋 Profesor Cerdas sedang merapikan laboratorium jurnal sains dulu. Yuk coba kembali sesaat lagi atau selesaikan misi yang lain! 🚀`;
    return {
      type: "CHAT_TEXT",
      content: balasanFallback
    };
  }
};