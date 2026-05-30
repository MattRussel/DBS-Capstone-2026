import React, { useState, useEffect, useRef } from 'react';

const ChatbotPage = ({ session }) => {
  // 📋 Daftar 15 Topik Resmi dari dataclean_revisi.csv beserta Label Cantiknya
  const daftarTopikSains = [
    { id: "adaptasi makhluk hidup", label: "🐾 Adaptasi Makhluk Hidup" },
    { id: "peredaran darah", label: "❤️ Peredaran Darah" },
    { id: "peristiwa alam", label: "🌋 Peristiwa Alam" },
    { id: "sumber daya alam dan kegunaannya", label: "🌾 Sumber Daya Alam & Kegunaannya" },
    { id: "alat pencernaan dan makanan", label: "🍔 Alat Pencernaan & Makanan" },
    { id: "benda dan sifatnya", label: "📦 Benda & Sifatnya" },
    { id: "bumi dan peristiwa alam", label: "🪐 Bumi & Peristiwa Alam" },
    { id: "air", label: "💧 Air & Siklus Hidrologi" },
    { id: "alat tubuh manusia dan hewan", label: "🦴 Alat Tubuh Manusia & Hewan" },
    { id: "tumbuhan hijau", label: "🌿 Tumbuhan Hijau" },
    { id: "gaya, gerak, dan energi", label: "⚡ Gaya, Gerak, dan Energi" },
    { id: "cahaya dan sifat-sifatnya", label: "🔦 Cahaya & Sifat-Sifatnya" },
    { id: "alat pernapasan manusia dan hewan", label: "🌬️ Alat Pernapasan Manusia & Hewan" },
    { id: "organ tubuh manusia dan hewan", label: "🧬 Organ Tubuh Manusia & Hewan" },
    { id: "sistem pernapasan", label: "🫁 Sistem Pernapasan" }
  ];

  // --- STATE MANAGEMENT ---
  const [selectedTopic, setSelectedTopic] = useState('adaptasi makhluk hidup');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo Ilmuwan Cilik! 👋 Aku Profesor Cerdas. Ada hal seru apa yang mau kita pelajari bersama hari ini? Tulis pertanyaanmu di bawah ya! 🔬' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 🌟 PERUBAHAN: Sekarang default-nya HANYA 1 topik pertama saja yang muncul di sidebar samping
  const [activeSessions, setActiveSessions] = useState([
    { id: "adaptasi makhluk hidup", label: "🐾 Adaptasi Makhluk Hidup" }
  ]);

  // State untuk mengontrol buka/tutup Pop-up Modal & pilihan topik di dalam modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSelectedTopic, setModalSelectedTopic] = useState('peredaran darah');

  const messagesEndRef = useRef(null);
  const userId = localStorage.getItem('student_id') || 1;

  // Mengatur sapaan awal otomatis setiap kali anak berpindah topik diskusi
  useEffect(() => {
    const topikSkrg = daftarTopikSains.find(t => t.id === selectedTopic);
    setMessages([
      { 
        role: 'assistant', 
        content: `Kamu memilih topik ${topikSkrg?.label || selectedTopic}. Yuk, tanyakan apa saja yang membuatmu penasaran tentang materi ini ke Profesor! 🧠🔬` 
      }
    ]);
  }, [selectedTopic]);

  // Auto-scroll ke pesan paling bawah
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ====================================================================
  // LOGIKA MENYETUJUI PILIHAN TOPIK BARU DARI POP-UP MODAL
  // ====================================================================
  const handleConfirmNewChat = () => {
    const topikBaru = daftarTopikSains.find(t => t.id === modalSelectedTopic);
    
    if (topikBaru) {
      // Masukkan ke dalam daftar sidebar kiri (jika belum terdaftar sebelumnya)
      setActiveSessions((prev) => {
        const sudahAda = prev.some(s => s.id === modalSelectedTopic);
        if (!sudahAda) {
          return [topikBaru, ...prev]; // Tambah ke baris paling atas sidebar
        }
        return prev;
      });

      // Langsung set topik aktif ke topik baru tersebut
      setSelectedTopic(modalSelectedTopic);
    }

    // Tutup Pop-up Modal kembali
    setIsModalOpen(false);
  };

  // ====================================================================
  // FUNGSI KIRIM PESAN KE BACKEND EXPRESS (PORT 5000)
  // ====================================================================
  const handleSendMessage = async () => {
    if (!chatInput.trim() || loading) return;

    const userMessage = chatInput.trim();
    setChatInput(''); 

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      console.log("📡 Menembak Chat ke Express backend localhost:5000...");
      
      const response = await fetch('http://localhost:5000/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          pesan: userMessage,
          topik: selectedTopic,
          isQuizMode: false 
        })
      });

      if (!response.ok) {
        throw new Error(`Server merespons dengan status: ${response.status}`);
      }

      const result = await response.json();

      if (result.type === "CHAT_TEXT") {
        setMessages((prev) => [...prev, { role: 'assistant', content: result.content }]);
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
    <div className="flex flex-1 w-full h-screen font-['Nunito'] relative">
      
      {/* --- KIRI: DAFTAR SESI CHAT (SIDEBAR) --- */}
      <aside className="hidden lg:flex w-80 bg-[#F5F0E8]/50 border-r border-[#D6CFC4] flex-col shrink-0">
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#D6CFC4] bg-[#FAF7F2] rounded-b-xl">
          <h2 className="font-black text-base text-[#2C1A0E]">Sesi Percakapan</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-black text-[#FAF7F2] bg-[#7A8C5C] px-3 py-1.5 rounded-full hover:bg-[#66754D] transition-all shadow-sm border border-[#7A8C5C]/20"
          >
            + Baru
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <p className="text-[10px] font-black text-[#6B5C4E] uppercase tracking-wider px-2">Lanjutkan Diskusi</p>
          <div className="flex flex-col gap-2">
            {activeSessions.map((sessionItem) => (
              <button
                key={sessionItem.id}
                onClick={() => setSelectedTopic(sessionItem.id)}
                className={`w-full text-left p-3.5 text-xs font-bold rounded-2xl border transition-all duration-200 flex items-center shadow-sm ${
                  selectedTopic === sessionItem.id
                    ? 'bg-[#FAF7F2] border-[#7A8C5C] text-[#2C1A0E] ring-2 ring-[#7A8C5C]/10 font-black'
                    : 'bg-[#FAF7F2]/60 border-[#D6CFC4] text-[#6B5C4E] hover:bg-white hover:text-[#2C1A0E]'
                }`}
              >
                <span className="truncate">{sessionItem.label}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* --- KANAN: AREA CHAT UTAMA --- */}
      <main className="flex-1 flex flex-col bg-[#F5F0E8] w-full h-[calc(100vh-73px)] md:h-screen">
        
        {/* Kepala Identitas Ruang Obrolan */}
        <header className="h-auto md:h-16 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-[#7A8C5C] rounded-b-[40px] gap-4 sm:gap-0 sticky top-0 md:relative z-20 shadow-md shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#FAF7F2] shrink-0 rounded-full flex items-center justify-center text-[#7A8C5C] font-black text-xl shadow-inner border border-[#D6CFC4]">P</div>
            <div className="flex-1">
              <h2 className="font-black text-lg sm:text-xl text-[#FAF7F2] leading-tight">Profesor Cerdas</h2>
              <p className="text-[11px] sm:text-xs text-[#FAF7F2]/90 font-bold">Siap menemani petualangan sainsmu!</p>
            </div>
          </div>
          
          <div className="flex items-center w-full sm:w-auto bg-[#FAF7F2] rounded-2xl px-3 py-1.5 border border-[#D6CFC4] shadow-inner text-xs font-black text-[#2C1A0E]">
            📌 {daftarTopikSains.find(t => t.id === selectedTopic)?.label}
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
                    {index > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 ml-1">
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
            <div className="flex gap-3 items-center max-w-xs ml-2 text-xs font-black text-[#7A8C5C] animate-pulse bg-white/50 py-2 px-4 rounded-full border border-[#D6CFC4]/60 w-max shadow-xs">
              <span>🔬 Profesor sedang membaca berkas sains...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box Area */}
        <div className="p-4 sm:p-6 border-t border-[#D6CFC4] bg-white rounded-t-[40px] shrink-0">
          <div className="w-full max-w-7xl mx-auto flex items-center gap-3">
            <button className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full bg-[#F5F0E8] border border-[#D6CFC4] flex items-center justify-center text-[#6B5C4E] shadow-xs hover:bg-[#EAE4DB] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            
            <div className="flex-1 bg-[#F5F0E8] rounded-full flex items-center pr-2 pl-5 py-1.5 border border-transparent focus-within:border-[#7A8C5C] focus-within:ring-2 focus-within:ring-[#7A8C5C]/30 focus-within:bg-white transition-all shadow-inner justify-between">
              <input 
                type="text" 
                disabled={loading}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={loading ? "Profesor sedang mengetik..." : "Tanya Profesor Cerdas di sini..."} 
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

      {/* ====================================================================
          POP-UP MODAL INTERAKTIF: PILIH TOPIK SAINS BARU
          ==================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#FAF7F2] border border-[#D6CFC4] rounded-[40px] p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-5 transform scale-100 transition-all">
            
            <div className="text-center">
              <span className="text-3xl">🧪</span>
              <h3 className="text-lg font-black text-[#2C1A0E] mt-2">Mulai Diskusi Baru</h3>
              <p className="text-xs font-semibold text-[#6B5C4E] mt-1">Pilih salah satu materi sains resmi di bawah ini untuk berdiskusi bersama Profesor Cerdas!</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#6B5C4E] uppercase tracking-wider block ml-1">Pilih Materi IPA:</label>
              <select
                value={modalSelectedTopic}
                onChange={(e) => setModalSelectedTopic(e.target.value)}
                className="w-full text-xs font-black border border-[#D6CFC4] rounded-2xl p-3 bg-white text-[#2C1A0E] outline-none shadow-inner cursor-pointer focus:border-[#7A8C5C]"
              >
                {daftarTopikSains.map((topik) => (
                  <option key={topik.id} value={topik.id}>
                    {topik.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-white border border-[#D6CFC4] rounded-full text-xs font-black text-[#6B5C4E] hover:bg-[#F5F0E8] transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmNewChat}
                className="flex-1 py-3 bg-[#2C1A0E] text-[#FAF7F2] rounded-full text-xs font-black hover:bg-[#3B2314] transition-colors shadow-md"
              >
                Mulai Percakapan 🚀
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ChatbotPage;