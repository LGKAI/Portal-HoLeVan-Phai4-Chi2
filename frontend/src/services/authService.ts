import api from './api';
import { User } from '../types';

export const authService = {
  login: async (phone: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', { phone, password });
    return response.data.data;
  },

  register: async (data: { full_name: string; phone: string; password: string }): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },
};
