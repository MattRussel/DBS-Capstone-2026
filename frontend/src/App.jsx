// src/App.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 

import AuthModal from './pages/AuthModal';
import QuizPage from './pages/QuizPage'; 
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import TopikPage from './pages/TopikPage';
import CheckInPage from './pages/CheckInPage';
import ChatbotPage from './pages/ChatbotPage';
import ParentPage from './pages/ParentPage'; // 🟢 Sudah aktif diimpor sempurna

const App = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State Navigasi Router Sederhana Lokal
  const [activePage, setActivePage] = useState('home');
  const [chatInput, setChatInput] = useState('');

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 🛡️ STATE TAMBAHAN: Pengendali Gerbang Pop-Up Mode Orang Tua
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [parentPasswordInput, setParentPasswordInput] = useState('');
  const [parentAuthError, setParentAuthError] = useState('');

  // Sesi Sinkronisasi Terintegrasi Database Cloud & Status Guest Mode
  const [session, setSession] = useState({
    token: localStorage.getItem('student_token') || null,
    name: localStorage.getItem('student_name') || '',
    role: localStorage.getItem('student_role') || '',
    id: localStorage.getItem('student_id') || null,
    parentPassword: localStorage.getItem('parent_password') || '123456', // 🔒 Ambil data password orang tua dari DB login
    isGuest: localStorage.getItem('app_mode_guest') === 'true'
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setSession({
        token: localStorage.getItem('student_token'),
        name: localStorage.getItem('student_name'),
        role: localStorage.getItem('student_role'),
        id: localStorage.getItem('student_id'),
        parentPassword: localStorage.getItem('parent_password') || '123456',
        isGuest: localStorage.getItem('app_mode_guest') === 'true'
      });
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    alert(`Mengirim pertanyaan ke kontainer Flask AI Docker: "${chatInput}"`);
    setChatInput('');
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.clear();
      setSession({ token: null, name: '', role: '', id: null, parentPassword: '123456', isGuest: false });
      setActivePage('home');
      setIsLoggingOut(false); 
      setIsMobileMenuOpen(false); 
    }, 1500);
  };

  // ====================================================================
  // 🔐 VERIFIKASI GERBANG ORANG TUA (PARENTAL GATE VALIDATION)
  // ====================================================================
  const handleVerifyParentMode = () => {
    setParentAuthError('');

    // Validasi apakah input password cocok dengan parent_password dari registrasi database
    if (parentPasswordInput === session.parentPassword) {
      setIsParentModalOpen(false);
      setParentPasswordInput('');
      
      // Mengalihkan halaman aktif ke ruang pantau orang tua
      setActivePage('parent'); 
      setIsMobileMenuOpen(false);
      alert("🔐 Pintu Gerbang Terbuka! Selamat Datang di Ruang Pantau Orang Tua.");
    } else {
      setParentAuthError('❌ Kata sandi salah! Pintu gerbang terkunci.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F5F0E8] font-medium text-[#2C1A0E] overflow-x-hidden relative">
      
      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden flex items-center justify-between bg-[#7A8C5C] text-[#FAF7F2] p-4 sticky top-0 z-30 rounded-b-[40px]">
        <div onClick={() => setActivePage('profil')} className="flex items-center gap-3 cursor-pointer active:opacity-80">
          <div className="w-8 h-8 bg-[#FAF7F2] rounded-lg flex items-center justify-center text-[#7A8C5C] font-bold shadow-sm">S</div>
          <div>
            <h1 className="font-extrabold text-lg text-[#FAF7F2] leading-none">SainsCerdas</h1>
            <span className="text-[10px] opacity-90 font-bold block mt-0.5">
              {activePage === 'parent' ? '👨‍👩‍👦 Mode Orang Tua' : 'Ilmuwan Cilik 👤'}
            </span>
          </div>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#FAF7F2] p-2 focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path></svg>
        </button>
      </div>

      {isMobileMenuOpen && <div className="fixed inset-0 bg-[#2C1A0E]/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* --- 1. KIRI: SIDEBAR MENU UTAMA --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#FAF7F2] border-r border-[#D6CFC4] flex flex-col justify-between transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* DESKTOP HEADER LOGO */}
          <div onClick={() => setActivePage('profil')} className="hidden md:flex h-20 items-center px-6 border-b border-[#D6CFC4] bg-[#F5F0E8] rounded-b-xl cursor-pointer hover:bg-[#FAF7F2] transition-colors group" title="Lihat Profil Saya">
            <div className="w-10 h-10 bg-[#7A8C5C] rounded-xl flex items-center justify-center text-[#FAF7F2] font-bold mr-3 shadow-md group-hover:scale-105 transition-transform">S</div>
            <div>
              <h1 className="font-extrabold text-xl text-[#2C1A0E] leading-tight group-hover:text-[#7A8C5C] transition-colors">SainsCerdas</h1>
              <p className="text-xs text-[#6B5C4E] font-bold flex items-center gap-1">
                {activePage === 'parent' ? '👨‍👩‍👦 Ruang Pantau' : 'Ilmuwan Cilik'} <span className="text-[10px]">👤</span>
              </p>
            </div>
          </div>

          {/* Navigasi Menu Samping */}
          <nav className="p-6 space-y-3 overflow-y-auto mt-2">
            <p className="text-xs font-semibold text-[#6B5C4E] mb-3 px-2 uppercase tracking-wider">Menu Utama</p>
            <button onClick={() => { setActivePage('home'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-full font-semibold text-sm transition-all ${activePage === 'home' ? 'bg-[#7A8C5C] text-white shadow-sm' : 'text-[#6B5C4E] hover:bg-[#FAF7F2]'}`}><span>🏠</span> Beranda</button>
            <button onClick={() => { setActivePage('chatbot'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-full font-semibold text-sm transition-all ${activePage === 'chatbot' ? 'bg-[#7A8C5C] text-white shadow-sm' : 'text-[#6B5C4E] hover:bg-[#FAF7F2]'}`}><span>💬</span> Chatbot</button>
            <button onClick={() => { setActivePage('topik'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-full font-semibold text-sm transition-all ${activePage === 'topik' ? 'bg-[#7A8C5C] text-white shadow-sm' : 'text-[#6B5C4E] hover:bg-[#FAF7F2]'}`}><span>📚</span> Jelajahi Topik</button>
            <button onClick={() => { setActivePage('quiz'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-full font-semibold text-sm transition-all ${activePage === 'quiz' ? 'bg-[#7A8C5C] text-white shadow-sm' : 'text-[#6B5C4E] hover:bg-[#FAF7F2]'}`}><span>🎯</span> Misi Kuis</button>
            
            {/* 💡 SAKLAR LINK JIKA PARENT DASHBOARD SEDANG AKTIF */}
            {activePage === 'parent' && (
              <button onClick={() => setActivePage('parent')} className="w-full flex items-center gap-3 px-3 py-3 rounded-full font-black text-sm transition-all bg-[#2C1A0E] text-[#FAF7F2] shadow-md animate-fadeIn"><span>📊</span> Ruang Pantau</button>
            )}
          </nav>
        </div>

        {/* Daily Check-In Widget */}
        <div className="p-6 mx-4 mb-2 bg-[#7A8C5C] text-[#FAF7F2] rounded-3xl shadow-lg">
          <h3 className="font-bold text-sm mb-1">Daily Check-In!</h3>
          <p className="text-xs text-[#FAF7F2]/90 mb-4 leading-relaxed">Selesaikan jurnal harianmu dan klaim bintang emas.</p>
          <button onClick={() => { setActivePage('checkin'); setIsMobileMenuOpen(false); }} className="w-full bg-[#FAF7F2] text-[#7A8C5C] text-sm font-semibold py-2 rounded-full hover:bg-white transition-colors shadow-sm">
            Mulai Check-In
          </button>
        </div>

        {/* --- BAGIAN BAWAH SIDEBAR (PARENT GATE & AUTH BUTTONS) --- */}
        <div className="p-6 border-t border-[#D6CFC4] bg-[#F5F0E8]/30 space-y-3">
          
          {/* 👨‍👩‍👦 BUTTON TRIGGER PARENT MODE ACCORDING TO SCHEMA COLUMN */}
          <button 
            onClick={() => setIsParentModalOpen(true)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-black rounded-2xl border transition-all shadow-sm active:scale-95 ${
              activePage === 'parent' 
                ? 'bg-[#7A8C5C] border-transparent text-white' 
                : 'bg-[#FAF7F2] border-[#D6CFC4] text-[#6B5C4E] hover:bg-white hover:text-[#2C1A0E]'
            }`}
          >
            <span>🔒</span> Mode Orang Tua
          </button>

          {session.token ? (
            <div className="flex flex-col gap-2 text-center text-xs">
              <span>Halo, <b>{session.name}</b></span>
              <button onClick={handleLogout} disabled={isLoggingOut} className="w-full bg-[#C4621D] text-white font-bold py-2 rounded-full shadow-md disabled:opacity-50">Keluar Akun</button>
            </div>
          ) : session.isGuest ? (
            <div className="flex flex-col gap-2 text-center text-xs">
              <span className="text-[#6B5C4E] font-bold">Mode Tamu (Guest)</span>
              <button onClick={() => setIsAuthModalOpen(true)} className="w-full bg-[#2C1A0E] text-white font-bold py-2 rounded-full shadow-md hover:bg-[#3B2314]">🔐 Daftar Akun Resmi</button>
              <button onClick={handleLogout} disabled={isLoggingOut} className="w-full border border-[#D6CFC4] text-[#6B5C4E] text-[10px] font-bold py-1 rounded-full hover:bg-white mt-1 disabled:opacity-50">Keluar Guest Mode</button>
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="w-full bg-[#2C1A0E] text-white text-sm font-bold py-3 rounded-full shadow-lg">Masuk / Daftar</button>
          )}
        </div>
      </aside>

      {/* --- AREA DISTRIBUSI UTAMA WORKSPACE --- */}
      {activePage === 'home' && <HomePage setActivePage={setActivePage} />}
      {activePage === 'quiz' && <QuizPage />}
      {activePage === 'profil' && <ProfilePage session={session} />}
      {activePage === 'topik' && <TopikPage />}
      
      {/* 🟢 PERBAIKAN 1: Bersihkan pengoperan props sisa mockup agar ChatbotPage membaca state lokal AI-nya sendiri */}
      {activePage === 'chatbot' && <ChatbotPage session={session} />}

      {activePage === 'checkin' && <CheckInPage onClose={() => setActivePage('home')} />}

      {/* 🟢 PERBAIKAN 2: Melepas komentar komponen <ParentPage /> dan menghapus isi tag div placeholder lama */}
      {activePage === 'parent' && <ParentPage />}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      {/* --- DIALOG MODAL: GERBANG VALIDASI ORANG TUA --- */}
      <AnimatePresence>
        {isParentModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[110] p-4 font-['Nunito']"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#FAF7F2] border border-[#D6CFC4] rounded-[35px] p-6 sm:p-8 w-full max-w-sm shadow-2xl space-y-4 relative overflow-hidden"
            >
              <div className="text-center">
                <span className="text-4xl">🔒</span>
                <h3 className="text-lg font-black text-[#2C1A0E] mt-2">Pintu Gerbang Orang Tua</h3>
                <p className="text-xs font-bold text-[#6B5C4E] mt-1">Masukkan kata sandi khusus orang tua untuk melihat statistik perkembangan belajar anak.</p>
              </div>

              <div className="space-y-1">
                <input 
                  type="password"
                  value={parentPasswordInput}
                  onChange={(e) => setParentPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyParentMode()}
                  placeholder="Masukkan password orang tua..."
                  className="w-full text-xs font-bold border border-[#D6CFC4] rounded-2xl p-3.5 bg-white text-[#2C1A0E] outline-none shadow-inner focus:border-[#7A8C5C] transition-all"
                />
                {parentAuthError && (
                  <p className="text-[11px] font-black text-red-600 mt-1 ml-1 animate-pulse">{parentAuthError}</p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setIsParentModalOpen(false); setParentPasswordInput(''); setParentAuthError(''); }}
                  className="flex-1 py-3 bg-white border border-[#D6CFC4] rounded-full text-xs font-black text-[#6B5C4E] hover:bg-[#F5F0E8] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleVerifyParentMode}
                  className="flex-1 py-3 bg-[#2C1A0E] text-[#FAF7F2] rounded-full text-xs font-black hover:bg-[#3B2314] transition-colors shadow-md"
                >
                  Buka Mode 🚀
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- POP-UP ANIMASI KELUAR AKUN --- */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2C1A0E]/60 backdrop-blur-sm font-['Nunito']">
            <motion.div initial={{ scale: 0.5, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="bg-[#FAF7F2] p-8 sm:p-10 rounded-[40px] shadow-2xl border-2 border-[#D6CFC4] flex flex-col items-center gap-4 text-center max-w-sm w-[90%] relative overflow-hidden">
              <motion.div animate={{ rotate: [0, 25, -15, 25, 0] }} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }} className="text-7xl mb-1 origin-bottom-right">👋</motion.div>
              <div className="space-y-1 z-10">
                <h3 className="text-2xl font-extrabold text-[#2C1A0E]">Sampai Jumpa!</h3>
                <p className="text-sm font-bold text-[#6B5C4E] leading-relaxed">Merapikan alat laboratorium... <br/>Tunggu sebentar ya! 🔬</p>
              </div>
              <div className="w-full h-2 bg-[#EAE4D9] rounded-full mt-4 overflow-hidden z-10">
                <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.5, ease: "linear" }} className="h-full bg-[#7A8C5C] rounded-full relative overflow-hidden">
                   <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="absolute top-0 bottom-0 w-1/2 bg-white/30 skew-x-12"/>
                </motion.div>
              </div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#F5F0E8] rounded-full mix-blend-multiply opacity-70"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#F5F0E8] rounded-full mix-blend-multiply opacity-70"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default App;