// API配置
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const API_ENDPOINTS = {
  // 汉字管理
  words: `${API_BASE_URL}/words`,
  word: (id) => `${API_BASE_URL}/words/${id}`,
  
  // 学习记录
  learn: (id) => `${API_BASE_URL}/learn/${id}`,
  
  // 星星管理
  stars: `${API_BASE_URL}/stars`,
  resetStars: `${API_BASE_URL}/stars/reset`,
  
  // 周统计
  weeklyStats: `${API_BASE_URL}/weekly-stats`,
  weeklyWords: (year, week) => `${API_BASE_URL}/weekly-words/${year}/${week}`,
  currentWeek: `${API_BASE_URL}/current-week`,
  
  // 健康检查
  health: `${API_BASE_URL}/health`,
};

