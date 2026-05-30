// backend/repositories/userRepository.js
import supabase from '../config/db.js'; // Pastikan file db.js kamu memang ada di folder config!

/**
 * 🔍 Cari user berdasarkan username atau email
 * Digunakan untuk validasi agar tidak ada data ganda saat registrasi
 */
export const findUserByUsernameOrEmail = async (username, email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${email}`)
      .limit(1) // 🛡️ PROTEKSI 1: Batasi hasil maksimal 1 agar maybeSingle() tidak panik jika ada lebih dari 1 user yang cocok
      .maybeSingle(); 

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ [User Repository] Gagal mencari user (regis):", error.message);
    throw error;
  }
};

/**
 * 🔑 Cari user khusus berdasarkan username saja (Untuk proses Login)
 */
export const findUserByUsername = async (username) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .limit(1) // 🛡️ Proteksi tambahan berjaga-jaga jika ada duplicate username di DB
      .maybeSingle(); 

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ [User Repository] Gagal mencari user (login):", error.message);
    throw error;
  }
};

/**
 * 💾 Simpan data user baru saat registrasi ke Supabase
 */
export const createUser = async (userData) => {
  try {
    const { username, email, passwordHash, role, parentId, namaLengkap } = userData;

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          email,
          password_hash: passwordHash, 
          role: role || 'anak',
          parent_id: parentId ? parseInt(parentId, 10) : null,
          nama_lengkap: namaLengkap || 'Siswa Cerdas'
        }
      ])
      .select() 
      .maybeSingle(); // 🛡️ PROTEKSI 2: Ganti .single() jadi .maybeSingle() untuk menghindari error 0 rows karena kebijakan RLS Supabase

    if (error) throw error;
    return data; 
  } catch (error) {
    console.error("❌ [User Repository] Gagal menyimpan user baru:", error.message);
    throw error;
  }
};