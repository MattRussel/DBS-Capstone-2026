import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    e.preventDefault(); // Mencegah reload halaman bawaan form browser
    setErrorMessage('');
    setSuccessMessage('');

    // 🛡️ VALIDASI PASSWORD MINIMAL 6 KARAKTER (Berlaku untuk Daftar maupun Masuk)
    if (!formData.password || formData.password.length < 6) {
      setErrorMessage('Waduh, kata sandi terlalu pendek! 🔑\nMinimal harus 6 karakter ya, biar akun Ilmuwan Cilik kamu tetap aman!');
      return; // 🛑 Hentikan aliran kode di sini, jangan tembak server dulu
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
          setSuccessMessage(response.data.message || 'Registrasi sukses! ✨');
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
      
      // ✨ DETEKSI AKURAT: Mencari substring "belum terdaftar" secara spesifik dari backend Supabase kita
      if (activeTab === 'login' && serverMessage.toLowerCase().includes('belum terdaftar')) {
        setErrorMessage(serverMessage);
        
        // Otomatis memindahkan anak ke tab register dalam 2.5 detik agar interaktif
        setTimeout(() => {
          setActiveTab('register');
        }, 2500);
      } else {
        setErrorMessage(serverMessage);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2C1A0E]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-['Nunito']" onClick={onClose}>
      <div className="bg-[#FAF7F2] rounded-[40px] sm:rounded-[50px] w-full max-w-md p-6 sm:p-8 lg:p-10 shadow-xl border border-[#D6CFC4]" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#D6CFC4] bg-[#F5F0E8] p-4 rounded-[30px]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#7A8C5C] rounded-full flex items-center justify-center text-[#FAF7F2] font-black text-2xl border-2 border-white">S</div>
            <h2 className="font-extrabold text-2xl text-[#2C1A0E]">SainsCerdas</h2>
          </div>
          <button type="button" onClick={onClose} className="text-[#6B5C4E] hover:text-[#C4621D] p-2 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Tab Navigasi */}
        <div className="flex bg-[#F5F0E8] rounded-full p-1.5 mb-6 border-2 border-[#D6CFC4]">
          <button type="button" onClick={() => setActiveTab('login')} className={`flex-1 text-center py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'login' ? 'bg-[#7A8C5C] text-[#FAF7F2] shadow-md' : 'text-[#6B5C4E]'}`}>Masuk</button>
          <button type="button" onClick={() => setActiveTab('register')} className={`flex-1 text-center py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'register' ? 'bg-[#7A8C5C] text-[#FAF7F2] shadow-md' : 'text-[#6B5C4E]'}`}>Daftar</button>
        </div>

        {errorMessage && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center font-bold whitespace-pre-line">⚠️ {errorMessage}</div>}
        {successMessage && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl text-center font-bold">🎉 {successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <>
              {/* Nama Lengkap */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#6B5C4E]">Nama Lengkap Kamu</label>
                <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} placeholder="Contoh: Budi Santoso" className="w-full px-4 py-2.5 border border-[#D6CFC4] bg-white text-sm rounded-xl outline-none font-medium text-[#2C1A0E] focus:border-[#7A8C5C]" required />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#6B5C4E]">Alamat Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="budi@example.com" className="w-full px-4 py-2.5 border border-[#D6CFC4] bg-white text-sm rounded-xl outline-none font-medium text-[#2C1A0E] focus:border-[#7A8C5C]" required={activeTab === 'register'} />
              </div>
              
              {/* Peran Akun */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#6B5C4E]">Peran Akun</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2.5 border border-[#D6CFC4] rounded-xl bg-white text-sm font-bold text-[#2C1A0E] outline-none focus:border-[#7A8C5C]">
                  <option value="anak">👦 Anak (Siswa Sekolah Dasar)</option>
                  <option value="orangtua">👨‍👩‍👦 Orang Tua (Wali Murid)</option>
                </select>
              </div>

              {/* ID Orang Tua */}
              {formData.role === 'anak' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6B5C4E]">ID Hubung Orang Tua (Opsional)</label>
                  <input type="number" name="parent_id" value={formData.parent_id} onChange={handleChange} placeholder="Masukkan angka ID user orang tua jika ada..." className="w-full px-4 py-2.5 border border-[#D6CFC4] bg-white text-sm rounded-xl outline-none font-medium text-[#2C1A0E] focus:border-[#7A8C5C]" />
                </div>
              )}
            </>
          )}

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#6B5C4E]">Nama Pengguna (Username)</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Masukkan nama pengguna..." className="w-full px-4 py-2.5 border border-[#D6CFC4] bg-white text-sm rounded-xl outline-none font-medium text-[#2C1A0E] focus:border-[#7A8C5C]" required />
          </div>

          {/* Password */}
          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-[#6B5C4E]">Kata Sandi</label>
            <div className="relative">
              {/* Ditambahkan attribute minLength="6" sebagai proteksi ganda bawaan HTML5 HTML */}
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" minLength={6} className="w-full px-4 py-2.5 pr-11 border border-[#D6CFC4] bg-white text-sm rounded-xl outline-none font-medium text-[#2C1A0E] focus:border-[#7A8C5C]" required />
              
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B5C4E] hover:text-[#7A8C5C] transition-colors p-1"
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
            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" id="agreed" name="agreed" checked={formData.agreed} onChange={handleChange} className="w-4 h-4 mt-0.5 accent-[#7A8C5C]" />
              <label htmlFor="agreed" className="text-xs text-[#6B5C4E] leading-relaxed select-none">Saya menyetujui semua aturan pengerjaan platform SainsCerdas.</label>
            </div>
          )}

          {/* Tombol Submit Utama */}
          <button type="submit" className="w-full bg-[#2C1A0E] text-[#FAF7F2] font-bold py-3 rounded-full mt-2 hover:bg-[#3B2314] transition-all shadow-md text-sm tracking-wide">
            {activeTab === 'login' ? '🚀 MASUK SEKARANG' : '✨ BUAT AKUN BARU'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-0.5 bg-[#D6CFC4]/60 rounded-full"></div>
          <span className="text-[10px] text-[#6B5C4E] font-bold uppercase tracking-wider">Atau</span>
          <div className="flex-1 h-0.5 bg-[#D6CFC4]/60 rounded-full"></div>
        </div>

        {/* Guest Mode Shortcut */}
        <button 
          type="button" 
          onClick={handleGuestLogin}
          className="w-full bg-white border-2 border-[#D6CFC4] text-[#6B5C4E] font-bold py-2.5 rounded-full shadow-sm hover:border-[#7A8C5C] hover:text-[#7A8C5C] transition-all text-sm"
        >
          🎮 Jelajahi Sebagai Tamu (Guest Mode)
        </button>

      </div>
    </div>
  );
};

export default AuthModal;