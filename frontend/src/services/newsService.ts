import api from './api';
import { NewsItem } from '../types';
import staticNews from '../data/news.json';

export const newsService = {
  getNewsList: async (params?: { category?: string; limit?: number }): Promise<NewsItem[]> => {
    try {
      const response = await api.get('/news', { params });
      if (response.data?.data && response.data.data.length > 0) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('Backend API not reachable, loading static news data.');
    }
    let list = (staticNews as unknown as NewsItem[]) || [];
    if (params?.limit) {
      list = list.slice(0, params.limit);
    }
    return list;
  },

  getNewsById: async (slug: string): Promise<NewsItem> => {
    try {
      const response = await api.get(`/news/${slug}`);
      if (response.data?.data) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('Backend API not reachable, loading news detail from static data.');
    }
    const found = (staticNews as unknown as NewsItem[]).find(
      n => n.slug === slug || n.id.toString() === slug
    );
    if (found) return found;
    throw new Error('News item not found');
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
