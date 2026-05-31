import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    nama_lengkap: '',
    username: '',
    email: '', 
    password: '',
    role: 'anak', 
    parent_id: '',
    agreed: false,
  });

  // Reset pesan dan data setiap kali berpindah tab
  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
    setFormData({ 
      nama_lengkap: '', 
      username: '', 
      email: '', 
      password: '', 
      role: 'anak', 
      parent_id: '', 
      agreed: false 
    });
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleGuestLogin = () => {
    localStorage.setItem('app_mode_guest', 'true');
    localStorage.removeItem('student_token'); 
    localStorage.removeItem('student_id');
    localStorage.removeItem('student_name');
    localStorage.removeItem('student_role');
    onClose?.();
    window.location.reload(); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setErrorMessage('');
    setSuccessMessage('');

    // 🛡️ VALIDASI PASSWORD MINIMAL 6 KARAKTER
    if (!formData.password || formData.password.length < 6) {
      setErrorMessage('Waduh, kata sandi terlalu pendek! 🔑\nMinimal harus 6 karakter ya, biar akun kamu aman!');
      return; 
    }

    try {
      if (activeTab === 'register') {
        // --- 1. PROSES REGISTRASI ---
        if (!formData.agreed) {
          setErrorMessage('Kamu harus menyetujui syarat & ketentuan platform SainsCerdas.');
          return;
        }

        const response = await axios.post('http://localhost:5000/api/user/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          parent_id: formData.role === 'anak' && formData.parent_id ? parseInt(formData.parent_id, 10) : null,
          nama_lengkap: formData.nama_lengkap
        });

        if (response.data.success) {
          setSuccessMessage(response.data.message || 'Hore, Registrasi sukses! ✨');
          setTimeout(() => setActiveTab('login'), 2000);
        }

      } else {
        // --- 2. PROSES LOGIN ---
        const response = await axios.post('http://localhost:5000/api/user/login', {
          username: formData.username,
          password: formData.password
        });

        if (response.data.success) {
          localStorage.setItem('student_token', response.data.token);
          localStorage.setItem('student_id', response.data.user.id);
          localStorage.setItem('student_name', response.data.user.nama_lengkap);
          localStorage.setItem('student_role', response.data.user.role);
          localStorage.removeItem('app_mode_guest'); 

          setSuccessMessage('Selamat datang kembali, Ilmuwan Hebat! 🚀');
          onLoginSuccess?.(response.data.user);

          setTimeout(() => {
            onClose?.();
            window.location.reload(); 
          }, 1200);
        }
      }
    } catch (error) {
      const serverMessage = error.response?.data?.message || 'Terjadi gangguan jaringan dengan server.';
      const lowerCaseMessage = serverMessage.toLowerCase();
      
      // ✨ DETEKSI 1: Belum terdaftar (Saat Login)
      if (activeTab === 'login' && lowerCaseMessage.includes('belum terdaftar')) {
        setErrorMessage(serverMessage + '\nMari buat akun baru dulu yuk!');
        
        // Otomatis memindahkan ke tab register dalam 2.5 detik
        setTimeout(() => {
          setActiveTab('register');
        }, 2500);
      } 
      // ✨ DETEKSI 2: Email/Username sudah terpakai (Saat Daftar)
      else if (activeTab === 'register' && (lowerCaseMessage.includes('sudah terdaftar') || lowerCaseMessage.includes('terpakai') || lowerCaseMessage.includes('already exist'))) {
        setErrorMessage('Waduh, Email atau Username ini sudah pernah didaftarkan! 😅\nLangsung masuk aja yuk pakai akun ini.');
        
        // Otomatis memindahkan ke tab login dalam 3 detik
        setTimeout(() => {
          setActiveTab('login');
        }, 3000);
      } 
      // Error server umum lainnya
      else {
        setErrorMessage(serverMessage);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2C1A0E]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-['Nunito']" onClick={onClose}>
      
      <div className="bg-[#FAF7F2] rounded-[40px] sm:rounded-[50px] w-full max-w-md p-6 sm:p-8 lg:p-10 shadow-xl border border-[#D6CFC4] relative" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#D6CFC4] bg-[#F5F0E8] p-4 rounded-[30px]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#7A8C5C] rounded-full flex items-center justify-center text-[#FAF7F2] font-black text-2xl border-2 border-white">S</div>
            <h2 className="font-extrabold text-2xl text-[#2C1A0E]">SainsCerdas</h2>
          </div>
          <button type="button" onClick={onClose} className="text-[#6B5C4E] hover:text-[#C4621D] hover:bg-[#FDE8DC]/50 p-2 rounded-full transition-colors focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Tab Navigasi */}
        <div className="flex bg-[#F5F0E8] rounded-full p-1.5 mb-6 border-2 border-[#D6CFC4]">
          <button type="button" onClick={() => setActiveTab('login')} className={`flex-1 text-center py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'login' ? 'bg-[#7A8C5C] text-[#FAF7F2] shadow-md' : 'text-[#6B5C4E] hover:text-[#2C1A0E]'}`}>Masuk</button>
          <button type="button" onClick={() => setActiveTab('register')} className={`flex-1 text-center py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'register' ? 'bg-[#7A8C5C] text-[#FAF7F2] shadow-md' : 'text-[#6B5C4E] hover:text-[#2C1A0E]'}`}>Daftar</button>
        </div>

        {/* 🚨 AREA POP-UP ERROR & SUCCESS (UPGRADED ANIMATION) 🚨 */}
        <div className="relative w-full z-10">
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div 
                key="error-box"
                // Posisi awal
                initial={{ opacity: 0, y: -20, scale: 0.8 }} 
                // Animasi masuk ditambah efek SHAKE sumbu X (kiri-kanan)
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  x: [0, -8, 8, -8, 8, 0] // ⬅️ Efek geleng-geleng
                }} 
                exit={{ opacity: 0, scale: 0.9, y: -10 }} 
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 25,
                  x: { duration: 0.4 } // Kecepatan gelengnya
                }}
                className="mb-5 p-4 bg-[#FDE8DC] border border-[#C4621D] text-[#2C1A0E] text-xs sm:text-sm rounded-2xl font-bold whitespace-pre-line shadow-md flex items-start gap-3"
              >
                <motion.span 
                  // Bikin icon warning kedap-kedip pelan
                  animate={{ rotate: [0, -15, 15, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
                  className="text-xl leading-none"
                >
                  ⚠️
                </motion.span>
                <span className="leading-relaxed">{errorMessage}</span>
              </motion.div>
            )}
            
            {successMessage && (
              <motion.div 
                key="success-box"
                // Datang dari bawah biar kesannya melompat kegirangan
                initial={{ opacity: 0, y: 30, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                // Settingan spring yang lebih "Bouncy" (damping diturunkan)
                transition={{ type: "spring", stiffness: 300, damping: 12, mass: 0.8 }}
                className="mb-5 p-4 bg-[#F5F0E8] border border-[#7A8C5C] text-[#2C1A0E] text-xs sm:text-sm rounded-2xl font-bold shadow-md flex items-center gap-3"
              >
                <motion.span 
                  // Bikin icon party popper-nya lompat-lompat kecil
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-xl leading-none"
                >
                  🎉
                </motion.span>
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <>
              {/* Nama Lengkap */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#6B5C4E]">Nama Lengkap Kamu</label>
                <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} placeholder="Contoh: Budi Santoso" className="w-full px-5 py-3 border border-[#D6CFC4] bg-white text-sm rounded-xl outline-none font-medium text-[#2C1A0E] focus:border-[#7A8C5C] focus:ring-1 focus:ring-[#7A8C5C] transition-all" required />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#6B5C4E]">Alamat Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="budi@example.com" className="w-full px-5 py-3 border border-[#D6CFC4] bg-white text-sm rounded-xl outline-none font-medium text-[#2C1A0E] focus:border-[#7A8C5C] focus:ring-1 focus:ring-[#7A8C5C] transition-all" required={activeTab === 'register'} />
              </div>
              
              {/* Peran Akun */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#6B5C4E]">Peran Akun</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full px-5 py-3 border border-[#D6CFC4] rounded-xl bg-white text-sm font-bold text-[#2C1A0E] outline-none focus:border-[#7A8C5C] focus:ring-1 focus:ring-[#7A8C5C] transition-all cursor-pointer">
                  <option value="anak">👦 Anak (Siswa Sekolah Dasar)</option>
                  <option value="orangtua">👨‍👩‍👦 Orang Tua (Wali Murid)</option>
                </select>
              </div>

              {/* ID Orang Tua */}
              {formData.role === 'anak' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6B5C4E]">ID Hubung Orang Tua (Opsional)</label>
                  <input type="number" name="parent_id" value={formData.parent_id} onChange={handleChange} placeholder="Masukkan ID user orang tua jika ada..." className="w-full px-5 py-3 border border-[#D6CFC4] bg-white text-sm rounded-xl outline-none font-medium text-[#2C1A0E] focus:border-[#7A8C5C] focus:ring-1 focus:ring-[#7A8C5C] transition-all" />
                </div>
              )}
            </>
          )}

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#6B5C4E]">Nama Pengguna (Username)</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Masukkan nama pengguna..." className="w-full px-5 py-3 border border-[#D6CFC4] bg-white text-sm rounded-xl outline-none font-medium text-[#2C1A0E] focus:border-[#7A8C5C] focus:ring-1 focus:ring-[#7A8C5C] transition-all" required />
          </div>

          {/* Password */}
          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-[#6B5C4E]">Kata Sandi</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" minLength={6} className="w-full px-5 py-3 pr-12 border border-[#D6CFC4] bg-white text-sm rounded-xl outline-none font-medium text-[#2C1A0E] focus:border-[#7A8C5C] focus:ring-1 focus:ring-[#7A8C5C] transition-all" required />
              
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B5C4E] hover:text-[#C4621D] hover:bg-[#FDE8DC] transition-colors p-1.5 rounded-full"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.822 7.822L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {activeTab === 'register' && (
            <div className="flex items-start gap-2.5 pt-2">
              <input type="checkbox" id="agreed" name="agreed" checked={formData.agreed} onChange={handleChange} className="w-5 h-5 mt-0.5 border-2 border-[#D6CFC4] rounded-md accent-[#7A8C5C] cursor-pointer" />
              <label htmlFor="agreed" className="text-xs text-[#6B5C4E] leading-relaxed select-none cursor-pointer">Saya menyetujui semua aturan pengerjaan platform SainsCerdas.</label>
            </div>
          )}

          {/* Tombol Submit Utama */}
          <button type="submit" className="w-full bg-[#2C1A0E] text-[#FAF7F2] font-extrabold py-3.5 rounded-full mt-4 hover:bg-[#3B2314] transition-all shadow-md text-sm tracking-wide focus:ring-4 focus:ring-[#7A8C5C]/30 outline-none">
            {activeTab === 'login' ? '🚀 MASUK SEKARANG' : '✨ BUAT AKUN BARU'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-0.5 bg-[#D6CFC4]/60 rounded-full"></div>
          <span className="text-[10px] text-[#6B5C4E] font-bold uppercase tracking-wider">Atau</span>
          <div className="flex-1 h-0.5 bg-[#D6CFC4]/60 rounded-full"></div>
        </div>

        {/* Guest Mode Shortcut */}
        <button 
          type="button" 
          onClick={handleGuestLogin}
          className="w-full bg-white border-2 border-[#D6CFC4] text-[#2C1A0E] font-bold py-3 rounded-full shadow-sm hover:border-[#7A8C5C] hover:bg-[#FAF7F2] transition-all text-sm focus:ring-4 focus:ring-[#D6CFC4]/30 outline-none"
        >
          🎮 Jelajahi Sebagai Tamu (Guest Mode)
        </button>

      </div>
    </div>
  );
};

export default AuthModal;