import api from './api';
import { NewsItem } from '../types';
import staticNews from '../data/news.json';

export const newsService = {
  getNewsList: async (params?: { category?: string; limit?: number }): Promise<NewsItem[]> => {
    try {
      const response = await api.get('/news', { params });
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('Backend API not reachable, loading static news data.');
      let list = (staticNews as unknown as NewsItem[]) || [];
      if (params?.limit) {
        list = list.slice(0, params.limit);
      }
      return list;
    }
    return [];
  },

  getNewsById: async (slug: string): Promise<NewsItem> => {
    try {
      const response = await api.get(`/news/${slug}`);
      if (response.data?.data) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('Backend API not reachable or item not found, checking static news data.');
      const found = (staticNews as unknown as NewsItem[]).find(
        n => n.slug === slug || n.id.toString() === slug
      );
      if (found) return found;
      throw err;
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
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/news/upload-image', formData);
    return response.data.url;
  }
};
