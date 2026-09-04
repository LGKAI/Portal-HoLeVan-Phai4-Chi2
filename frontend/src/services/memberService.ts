import api from './api';
import { Member } from '../types';

export const memberService = {
  getTree: async (): Promise<Member[]> => {
    const response = await api.get('/members');
    return response.data.data || [];
  },

  getMemberById: async (id: number): Promise<Member> => {
    const response = await api.get(`/members/${id}`);
    return response.data.data;
  },

  createMember: async (data: Partial<Member>): Promise<any> => {
    const response = await api.post('/members', data);
    return response.data;
  },

  updateMember: async (id: number, data: Partial<Member>): Promise<any> => {
    const response = await api.put(`/members/${id}`, data);
    return response.data;
  },

  deleteMember: async (id: number): Promise<void> => {
    await api.delete(`/members/${id}`);
  },
};
