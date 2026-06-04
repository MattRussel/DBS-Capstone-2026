// src/pages/ChatbotPage.jsx
import React, { useState, useEffect, useRef } from 'react';

const ChatbotPage = ({ session }) => {
  const defaultWelcomeMessage = { 
    role: 'assistant', 
    content: 'Halo Ilmuwan Cilik! 👋 Aku Profesor Cerdas. Di laboratorium ini, kamu bebas menanyakan apa saja tentang materi sains IPA! Mulai dari sistem pernapasan, tumbuhan, siklus air, hingga fenomena alam di bumi. Yuk, tulis hal yang membuatmu penasaran di bawah ini! 🔬✨' 
  };

  // Kunci unik LocalStorage yang disesuaikan dengan ID anak yang sedang login agar tidak tertukar
  const STORAGE_KEY = `sainscerdas_chat_history_${session?.id || 'guest'}`;
  const SESSION_KEY = `sainscerdas_current_session_${session?.id || 'guest'}`;

  // --- STATE MANAGEMENT (DIINTEGRASIKAN DENGAN LOCALSTORAGE) ---
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    return localStorage.getItem(SESSION_KEY) || 'session_default';
  });

  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState(() => {
    // AMBIL DATA LAMA: Cek apakah laptop anak sudah menyimpan diskusi chat sebelumnya
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        return JSON.parse(savedHistory);
      } catch (e) {
        console.error("Gagal memuat cache riwayat chat:", e);
      }
    }
    // Nilai bawaan jika anak baru pertama kali membuka ruang obrolan
    return [
      { 
        id: "session_default", 
        title: "✨ Percakapan Baru", 
        messages: [defaultWelcomeMessage] 
      },
      { 
        id: "session_1", 
        title: "🐾 Tentang Adaptasi Makhluk Hidup", 
        messages: [
          { role: 'assistant', content: 'Yuk, tanyakan tentang adaptasi makhluk hidup!' },
          { role: 'user', content: 'Kenapa bunglon berubah warna?' },
          { role: 'assistant', content: 'Bunglon berubah warna untuk mengelabui musuh atau menyesuaikan diri dengan lingkungannya (mimikri)! 🦎', topicTag: 'adaptasi makhluk hidup', confidenceTag: '94.2%', similarityTag: '88.50%' }
        ] 
      }
    ];
  });

  const messagesEndRef = useRef(null);

  // EFEK SINKRONISASI: Setiap kali chatHistory atau sesi berubah, kunci langsung ke LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
  }, [chatHistory, STORAGE_KEY]);

  useEffect(() => {
    localStorage.setItem(SESSION_KEY, currentSessionId);
  }, [currentSessionId, SESSION_KEY]);

  // Ambil pesan dari sesi yang aktif saat ini
  const currentSession = chatHistory.find(s => s.id === currentSessionId) || chatHistory[0];
  const messages = currentSession?.messages || [defaultWelcomeMessage];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, currentSessionId]);

  // ====================================================================
  // FUNGSI MEMBUAT SESI BARU (SISTEM CONTAINER KOSONG)
  // ====================================================================
  const handleStartNewChat = () => {
    const newSessionId = `session_${Date.now()}`;
    const newSessionObj = {
      id: newSessionId,
      title: "✨ Percakapan Baru",
      messages: [
        {
          role: 'assistant',
          content: 'Laboratorium dikosongkan! 🧪 Sesi baru telah siap. Yuk, ketik pertanyaan sains barumu di bawah ini, biar Profesor bantu cari jawabannya!'
        }
      ]
    };

    setChatHistory((prev) => [newSessionObj, ...prev]);
    setCurrentSessionId(newSessionId);
  };

  // ====================================================================
  // FUNGSI MEMBUKA DISKUSI LAMA (BALIK KE DISKUSI SEBELUMNYA)
  // ====================================================================
  const handleLoadHistory = (id) => {
    setCurrentSessionId(id);
  };

  // ====================================================================
  // 📡 FUNGSI KIRIM PESAN GLOBAL DAN UPDATE CONTAINER SESI
  // ====================================================================
  const handleSendMessage = async () => {
    if (!chatInput.trim() || loading) return;

    const userMessage = chatInput.trim();
    setChatInput(''); 

    const userMessageObj = { role: 'user', content: userMessage };
    
    setChatHistory((prevHistory) => {
      return prevHistory.map((sessionItem) => {
        if (sessionItem.id === currentSessionId) {
          const isFirstUserMessage = sessionItem.messages.filter(m => m.role === 'user').length === 0;
          const updatedTitle = isFirstUserMessage 
            ? (userMessage.length > 22 ? `💬 ${userMessage.substring(0, 22)}...` : `💬 ${userMessage}`)
            : sessionItem.title;

          return {
            ...sessionItem,
            title: updatedTitle,
            messages: [...sessionItem.messages, userMessageObj]
          };
        }
        return sessionItem;
      });
    });

    setLoading(true);

    try {
      console.log(`📡 Menembak Chat ke Express backend menuju Supabase...`);
      
      const response = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: parseInt(session?.id, 10) || localStorage.getItem('student_id') || 1,
          pesan: userMessage,
          isQuizMode: false
        })
      });

      if (!response.ok) {
        throw new Error(`Server merespons dengan status: ${response.status}`);
      }

      const result = await response.json();

      // 🟢 PERBAIKAN INTEGRASI UTAMA: Pembongkaran Struktur Berlapis 'result.data.data'
      if (result.success && result.data) { 
        if (result.type === "CHAT_TEXT") {
          
          // Masuk ke dalam bodi data murni keluaran service layer
          const corePayload = result.data.data; 

          // Ambil string teks balasan utama Profesor Cerdas
          const botReplyText = corePayload?.text || 'Halo Ilmuwan Cilik! Profesor siap membantu kembali.';

          // Ekstrak tag visual secara presisi agar metadata kuis/RAG tidak bernilai null
          const botMessageObj = { 
            role: 'assistant', 
            content: botReplyText,
            topicTag: corePayload?.predicted_topic || null,   
            confidenceTag: corePayload?.tf_confidence || null, 
            similarityTag: corePayload?.similarity_score || null 
          };

          // Perbarui riwayat kontainer sesi obrolan aktif anak secara real-time
          setChatHistory(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, botMessageObj] } : s));
        } else {
          console.warn(`⚠️ Menerisma tipe data tidak dikenal: ${result.type}`);
        }
      }

    } catch (error) {
      console.error("❌ Gagal terhubung atau memproses chat:", error.message);
      const errorMessageObj = { 
        role: 'assistant', 
        content: 'Waduh, sinyal laboratorium Profesor sedang terganggu angin kencang. Coba kirim pesan lagi sebentar ya! 🌪️🔬' 
      };
      setChatHistory(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, errorMessageObj] } : s));
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
            className="text-xs font-black text-[#FAF7F2] bg-[#7A8C5C] px-4 py-2 rounded-full hover:bg-[#66754D] transition-all shadow-sm border border-[#7A8C5C]/20"
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
                onClick={() => handleLoadHistory(item.id)}
                className={`w-full text-left p-3.5 text-xs font-bold rounded-2xl border transition-all duration-200 flex items-center shadow-sm ${
                  currentSessionId === item.id 
                    ? 'bg-white border-[#7A8C5C] text-[#2C1A0E] font-black ring-2 ring-[#7A8C5C]/10' 
                    : 'bg-white/60 border-[#D6CFC4] text-[#6B5C4E] hover:bg-white hover:text-[#2C1A0E]'
                }`}
              >
                <span className="truncate">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* --- SEBELAH KANAN: AREA CHAT UTAMA --- */}
      <main className="flex-1 flex flex-col w-full h-[calc(100vh-73px)] md:h-screen max-w-5xl px-4 mx-auto">
        
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

                    {msg.topicTag && msg.topicTag !== "Tidak terdeteksi" && (
                      <div className="flex flex-col gap-1 ml-1 animate-fadeIn">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[10px] bg-[#2C1A0E] text-[#FAF7F2] font-black px-2.5 py-1 rounded-md shadow-xs tracking-wide">
                            🧠 Topik TF model: {msg.topicTag.toLowerCase()} ({msg.confidenceTag})
                          </span>
                          {msg.similarityTag && (
                            <span className="text-[10px] bg-[#7A8C5C] text-[#FAF7F2] font-black px-2.5 py-1 rounded-md shadow-xs tracking-wide">
                              🎯 RAG Similarity: {msg.similarityTag}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {index > 0 && !(
                      msg.content.includes('⚠️') || 
                      msg.content.includes('Maaf, pertanyaan itu belum ada') || 
                      msg.topicTag === 'Sistem Peringatan' || 
                      msg.topicTag === 'Sistem Moderasi'
                    

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

        <div className="p-4 sm:p-6 border-t border-[#D6CFC4] bg-white rounded-t-[40px] shrink-0 mb-2 shadow-lg">
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 bg-[#F5F0E8] rounded-full flex items-center pr-2 pl-5 py-2 border border-transparent focus-within:border-[#7A8C5C] focus-within:ring-2 focus-within:ring-[#7A8C5C]/30 focus-within:bg-white transition-all shadow-inner justify-between">
              <input 
                type="text" 
                disabled={loading}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={loading ? "Profesor sedang berpikir..." : "Tanya apa saja (cth: Kenapa air laut rasanya asin?)"} 
                className="w-full bg-transparent border-none outline-none text-sm text-[#2C1A0E] placeholder-[#6B5C4E] font-bold disabled:cursor-not-allowed"
              />
             
              <button 
                onClick={handleSendMessage}
                disabled={loading || !chatInput.trim()}
                className={`p-3 rounded-full transition-all duration-300 flex items-center justify-center shrink-0 shadow-md ${
                  loading || !chatInput.trim() 
                    ? 'bg-[#D6CFC4] text-white cursor-not-allowed shadow-none' 
                    : 'bg-[#7A8C5C] text-white hover:bg-[#66754D] hover:scale-105 active:scale-95 ring-4 ring-[#7A8C5C]/20'
                }`}
                title="Kirim Pertanyaan"
              >
                {/* Menggunakan warna ikon putih bersih agar kontras dengan latar belakang hijau */}
                <svg 
                  className="w-5 h-5 text-white transform rotate-45 -translate-x-0.5 translate-y-0.5" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default ChatbotPage;