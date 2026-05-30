// src/services/chatbotService.js
import { request } from './api';

export const fetchDashboardKuis = async (userId) => {
  return request(`/quests/dashboard?user_id=${userId}`, { method: 'GET' });
};

export const kirimPesanChatbot = async (userId, pesan, topik, isQuizMode) => {
  return request('/chatbot/message', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, pesan, topik, isQuizMode })
  });
};