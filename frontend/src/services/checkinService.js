// frontend/src/services/checkinService.js
import API from './api';

export const sendDailyCheckIn = async (userId) => {
  try {
    // Menembak POST http://localhost:5000/api/checkin/daily
    const response = await API.post('/checkin/daily', { user_id: userId });
    return response.data; // Mengembalikan data sukses dari backend ({ success: true, message: '...' })
  } catch (error) {
    // Menangkap pesan eror ramah anak yang dilempar dari layer controller backend tadi
    throw new Error(error.response?.data?.message || 'Waduh, koneksi ke server terputus!');
  }
};