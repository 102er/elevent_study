import { API_ENDPOINTS } from '../config';

// 通用fetch封装
async function fetchAPI(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// 汉字相关API
export const wordAPI = {
  // 获取所有汉字
  getAll: () => fetchAPI(API_ENDPOINTS.words),
  
  // 添加汉字
  add: (word) => fetchAPI(API_ENDPOINTS.words, {
    method: 'POST',
    body: JSON.stringify(word),
  }),
  
  // 更新汉字
  update: (id, word) => fetchAPI(API_ENDPOINTS.word(id), {
    method: 'PUT',
    body: JSON.stringify(word),
  }),
  
  // 删除汉字
  delete: (id) => fetchAPI(API_ENDPOINTS.word(id), {
    method: 'DELETE',
  }),
};

// 学习记录API
export const learningAPI = {
  // 标记为已学习
  markAsLearned: (wordId) => fetchAPI(API_ENDPOINTS.learn(wordId), {
    method: 'POST',
  }),
};

// 星星API
export const starAPI = {
  // 获取星星数量
  get: () => fetchAPI(API_ENDPOINTS.stars),
  
  // 重置进度
  reset: () => fetchAPI(API_ENDPOINTS.resetStars, {
    method: 'POST',
  }),
};

// 周统计API
export const weeklyAPI = {
  // 获取所有周统计
  getStats: () => fetchAPI(API_ENDPOINTS.weeklyStats),
  
  // 获取指定周的汉字
  getWords: (year, week) => fetchAPI(API_ENDPOINTS.weeklyWords(year, week)),
  
  // 获取当前周统计
  getCurrentWeek: () => fetchAPI(API_ENDPOINTS.currentWeek),
};

// 书籍API
export const bookAPI = {
  // 获取所有书籍
  getAll: () => fetchAPI(API_ENDPOINTS.books),
  
  // 添加书籍
  add: (book) => fetchAPI(API_ENDPOINTS.books, {
    method: 'POST',
    body: JSON.stringify(book),
  }),
  
  // 更新书籍
  update: (id, book) => fetchAPI(API_ENDPOINTS.book(id), {
    method: 'PUT',
    body: JSON.stringify(book),
  }),
  
  // 删除书籍
  delete: (id) => fetchAPI(API_ENDPOINTS.book(id), {
    method: 'DELETE',
  }),
};

// 阅读记录API
export const readingAPI = {
  // 开始阅读
  start: (bookId) => fetchAPI(API_ENDPOINTS.startReading(bookId), {
    method: 'POST',
  }),
  
  // 标记为读完
  complete: (bookId) => fetchAPI(API_ENDPOINTS.completeReading(bookId), {
    method: 'POST',
  }),
  
  // 更新阅读进度
  updateProgress: (bookId, currentPage, notes = '') => fetchAPI(API_ENDPOINTS.updateProgress(bookId), {
    method: 'POST',
    body: JSON.stringify({ currentPage, notes }),
  }),
  
  // 获取阅读统计
  getStats: () => fetchAPI(API_ENDPOINTS.readingStats),
};

