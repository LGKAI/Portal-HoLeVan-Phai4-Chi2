import api from './api';
import { NewsItem } from '../types';

export const newsService = {
  getNewsList: async (params?: { category?: string; limit?: number }): Promise<NewsItem[]> => {
    const response = await api.get('/news', { params });
    return response.data.data || [];
  },

  getNewsById: async (slug: string): Promise<NewsItem> => {
    const response = await api.get(`/news/${slug}`);
    return response.data.data;
  },

  createNews: async (data: FormData | Partial<NewsItem>): Promise<void> => {
    await api.post('/news', data);
  },

  updateNews: async (id: number, data: FormData | Partial<NewsItem>): Promise<void> => {
    await api.put(`/news/${id}`, data);
  },

  deleteNews: async (id: number): Promise<void> => {
    await api.delete(`/news/${id}`);
  }
};
