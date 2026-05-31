// frontend/src/pages/ChatbotPage.jsx
import React, { useState, useEffect, useRef } from 'react';

const ChatbotPage = ({ session }) => {
  // --- STATE MANAGEMENT ---
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Halo Ilmuwan Cilik! 👋 Aku Profesor Cerdas. Di laboratorium ini, kamu bebas menanyakan apa saja tentang materi sains IPA! Mulai dari sistem pernapasan, tumbuhan, siklus air, hingga fenomena alam di bumi. Yuk, tulis hal yang membuatmu penasaran di bawah ini! 🔬✨' 
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);

  // 📋 State penampung list riwayat percakapan secara global
  const [chatHistory, setChatHistory] = useState([
    { id: "session_1", title: "🐾 Tentang Adaptasi Makhluk Hidup" },
    { id: "session_2", title: "🌋 Proses Terjadinya Gunung Meletus" }
  ]);

  const messagesEndRef = useRef(null);
  const userId = localStorage.getItem('student_id') || 1;

  // 📡 KONFIGURASI URL API: Sesuaikan dengan URL backend kamu (Lokal / Vercel Production)
  const BACKEND_API_URL = 'http://localhost:5000'; 

  // Auto-scroll otomatis ke pesan paling baru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ====================================================================
  // FUNGSI UNTUK MEMBUAT SESI BARU (KOTAK CHAT DIRESET)
  // ====================================================================
  const handleStartNewChat = () => {
    setMessages([
      { 
        role: 'assistant', 
        content: 'Laboratorium dikosongkan! 🧪 Sesi baru telah siap. Yuk, ketik pertanyaan sains barumu di bawah ini, biar Profesor bantu cari jawabannya!' 
      }
    ]);
  };

  // ====================================================================
  // FUNGSI UNTUK MEMBUKA DISKUSI LAMA DARI SIDEBAR HISTORY
  // ====================================================================
  const handleLoadHistory = (id, title) => {
    setLoading(true);
    // Simulasi memanggil percakapan lama berdasarkan ID sesi dari database
    setTimeout(() => {
      setMessages([
        { role: 'assistant', content: `Membuka kembali arsip lab percakapan tentang: "${title}" 📂` },
        { role: 'user', content: `Prof, jelaskan kembali ringkasan tentang hal itu.` },
        { 
          role: 'assistant', 
          content: `Tentu! Berdasarkan data yang kita kumpulkan sebelumnya, inti dari fenomena tersebut adalah interaksi energi yang stabil. Ada bagian spesifik yang ingin kamu tanyakan lagi? 🔬`,
          topicTag: title.replace(/[^a-zA-Z0-9 ]/g, '').trim(),
          confidenceTag: "100%"
        }
      ]);
      setLoading(false);
    }, 500);
  };

  // ====================================================================
  // FUNGSI KIRIM PESAN GLOBAL (TANPA PEMILIHAN TOPIK MANUAL)
  // ====================================================================
  const handleSendMessage = async () => {
    if (!chatInput.trim() || loading) return;

    const userMessage = chatInput.trim();
    setChatInput(''); 

    // Tampilkan pesan anak langsung di layar chat
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // 🧠 OTOMATIS TAMBAH HISTORY: Jika ini chat pertama di sesi kosong, jadikan judul di sidebar
    if (messages.length <= 1) {
      const judulHistory = userMessage.length > 25 ? userMessage.substring(0, 25) + "..." : userMessage;
      setChatHistory((prev) => [
        { id: `session_${Date.now()}`, title: `💬 ${judulHistory}` },
        ...prev
      ]);
    }

    try {
      console.log(`📡 Menembak Chat Global ke Express backend...`);
      
      const response = await fetch(`${BACKEND_API_URL}/api/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          pesan: userMessage,
          topik: null, // Biar backend AI yang mengklasifikasi topik secara otomatis
          isQuizMode: false 
        })
      });

      if (!response.ok) {
        throw new Error(`Server merespons dengan status: ${response.status}`);
      }

      const result = await response.json();

      // 🟢 PERBAIKAN: Menangkap struktur object baru (text, predicted_topic, tf_confidence) dari Service Express
      if (result.type === "CHAT_TEXT") {
  setMessages((prev) => [
    ...prev, 
    { 
      role: 'assistant', 
      content: result.data.text,
      topicTag: result.data.predicted_topic,   // Mengambil teks topik TF
      confidenceTag: result.data.tf_confidence, // Mengambil % Akurasi TF (cth: 79.3%)
      similarityTag: result.data.similarity_score // 💡 Opsi Tambahan: Mengambil % Jarak RAG
    }
  ]);
}else if (result.data && result.data.content) {
        setMessages((prev) => [
          ...prev, 
          { 
            role: 'assistant', 
            content: result.data.content.text || result.data.content,
            topicTag: result.data.content.predicted_topic || null,
            confidenceTag: result.data.content.tf_confidence || null
          }
        ]);
      }

    } catch (error) {
      console.error("❌ Gagal terhubung atau memproses chat:", error.message);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Waduh, sinyal laboratorium Profesor sedang terganggu angin kencang. Coba kirim pesan lagi sebentar ya! 🌪️🔬' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 w-full h-screen font-['Nunito'] relative bg-[#F5F0E8]">
      
      {/* --- SEBELAH KIRI: SIDEBAR KHUSUS RIWAYAT CHAT (HISTORY) --- */}
      <aside className="hidden lg:flex w-80 bg-[#FAF7F2] border-r border-[#D6CFC4] flex-col shrink-0">
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#D6CFC4]">
          <h2 className="font-black text-base text-[#2C1A0E]">Riwayat Belajar</h2>
          <button 
            onClick={handleStartNewChat}
            className="text-xs font-black text-[#FAF7F2] bg-[#7A8C5C] px-3 py-1.5 rounded-full hover:bg-[#66754D] transition-all shadow-sm border border-[#7A8C5C]/20"
          >
            + Baru
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <p className="text-[10px] font-black text-[#6B5C4E] uppercase tracking-wider px-2">Diskusi Kamu</p>
          <div className="flex flex-col gap-2">
            {chatHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLoadHistory(item.id, item.title)}
                className="w-full text-left p-3.5 text-xs font-bold rounded-2xl border transition-all duration-200 flex items-center shadow-sm bg-white/60 border-[#D6CFC4] text-[#6B5C4E] hover:bg-white hover:text-[#2C1A0E] hover:border-[#7A8C5C]"
              >
                <span className="truncate">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* --- SEBELAH KANAN: AREA CHAT UTAMA --- */}
      <main className="flex-1 flex flex-col w-full h-[calc(100vh-73px)] md:h-screen max-w-5xl px-4 mx-auto">
        
        {/* Kepala Identitas Ruang Obrolan Global */}
        <header className="h-auto md:h-20 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-[#7A8C5C] rounded-b-[40px] gap-4 sm:gap-0 sticky top-0 md:relative z-20 shadow-md shrink-0 mt-2">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-11 h-11 bg-[#FAF7F2] shrink-0 rounded-full flex items-center justify-center text-[#7A8C5C] font-black text-2xl shadow-inner border border-[#D6CFC4]">P</div>
            <div className="flex-1">
              <h2 className="font-black text-lg sm:text-xl text-[#FAF7F2] leading-tight">Profesor Cerdas</h2>
              <p className="text-[11px] sm:text-xs text-[#FAF7F2]/90 font-bold">Ruang Belajar Sains Serba Tahu</p>
            </div>
          </div>
          
          <div className="flex items-center w-full sm:w-auto bg-[#FAF7F2] rounded-2xl px-4 py-2 border border-[#D6CFC4] shadow-inner text-xs font-black text-[#7A8C5C]">
            🚀 Semua Topik Sains SD Aktif
          </div>
        </header>

        {/* Dynamic Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-5 bg-[#F5F0E8]">
          {messages.map((msg, index) => {
            if (msg.role === 'user') {
              return (
                <div key={index} className="flex flex-col items-end w-full animate-fadeIn">
                  <div className="bg-[#2C1A0E] text-[#FAF7F2] px-5 py-3 rounded-3xl rounded-tr-xl max-w-[85%] sm:max-w-xl shadow-md border border-[#FAF7F2]/5">
                    <p className="text-sm leading-relaxed font-bold">{msg.content}</p>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={index} className="flex gap-3 sm:gap-4 max-w-full sm:max-w-3xl items-start animate-fadeIn">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#7A8C5C] shrink-0 rounded-full flex items-center justify-center text-[#FAF7F2] font-black text-base mt-0.5 shadow-sm border border-[#D6CFC4]">P</div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="bg-[#FAF7F2] border border-[#D6CFC4] px-5 py-3.5 rounded-3xl rounded-tl-xl shadow-sm">
                      <p className="text-sm leading-relaxed text-[#2C1A0E] font-semibold whitespace-pre-line">
                        {msg.content}
                      </p>
                    </div>

                    {/* 🟢 RENDERING BARU: Menampilkan tag metadata lencana hasil klasifikasi TensorFlow */}
                    {msg.topicTag && msg.topicTag !== "Tidak terdeteksi" && (
                      <div className="flex flex-wrap items-center gap-2 ml-1 animate-fadeIn">
                        <span className="text-[10px] bg-[#2C1A0E] text-[#FAF7F2] font-black px-2.5 py-1 rounded-md shadow-xs tracking-wide">
                          🧠 Topik TF model: {msg.topicTag.toLowerCase()} ({msg.confidenceTag})
                        </span>
                      </div>
                    )}

                    {index > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 ml-1 mt-0.5">
                        <span className="text-[10px] text-[#6B5C4E] font-black uppercase tracking-wide mr-1 hidden sm:block">Jawaban ini:</span>
                        <div className="flex gap-2">
                          <button className="text-[11px] font-bold px-3 py-1.5 border border-[#D6CFC4] rounded-full text-[#2C1A0E] bg-white hover:bg-[#FAF7F2] shadow-xs active:scale-95 transition-transform">👍 Mudah dipahami</button>
                          <button className="text-[11px] font-bold px-3 py-1.5 border border-[#D6CFC4] rounded-full text-[#2C1A0E] bg-white hover:bg-[#FDE8DC] shadow-xs active:scale-95 transition-transform">👎 Kurang jelas</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          })}

          {loading && (
            <div className="flex gap-3 items-center max-w-xs ml-2 text-xs font-black text-[#7A8C5C] animate-pulse bg-white/50 py-2 px-4 rounded-full border border-[#D6CFC4]/60 w-max shadow-sm">
              <span>🔬 Profesor sedang meramu berkas sains...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box Area */}
        <div className="p-4 sm:p-6 border-t border-[#D6CFC4] bg-white rounded-t-[40px] shrink-0 mb-2 shadow-lg">
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 bg-[#F5F0E8] rounded-full flex items-center pr-2 pl-5 py-2 border border-transparent focus-within:border-[#7A8C5C] focus-within:ring-2 focus-within:ring-[#7A8C5C]/30 focus-within:bg-white transition-all shadow-inner justify-between">
              <input 
                type="text" 
                disabled={loading}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={loading ? "Profesor sedang berpikir..." : "Tanya apa saja (cth: Kenapa cicak memutuskan ekornya?)"} 
                className="w-full bg-transparent border-none outline-none text-sm text-[#2C1A0E] placeholder-[#6B5C4E] font-bold disabled:cursor-not-allowed"
              />
              <button 
                onClick={handleSendMessage}
                disabled={loading || !chatInput.trim()}
                className={`p-2.5 rounded-full transition-all flex items-center justify-center shadow-md shrink-0 ${
                  loading || !chatInput.trim() ? 'bg-[#D6CFC4] text-white cursor-not-allowed shadow-none' : 'bg-[#2C1A0E] hover:bg-[#3B2314]'
                }`}
              >
                <svg className="w-4 h-4 transform rotate-45 -translate-x-0.5 translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
              </button>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default ChatbotPage;