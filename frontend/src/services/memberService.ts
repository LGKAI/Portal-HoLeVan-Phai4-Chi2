import api from './api';
import { Member } from '../types';
import staticMembers from '../data/members.json';

export const memberService = {
  getTree: async (): Promise<Member[]> => {
    try {
      const response = await api.get('/members');
      if (response.data?.data && response.data.data.length > 0) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('Backend API not reachable, loading static members data.');
    }
    return (staticMembers as unknown as Member[]) || [];
  },

  getMemberById: async (id: number): Promise<Member> => {
    try {
      const response = await api.get(`/members/${id}`);
      if (response.data?.data) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('Backend API not reachable, loading member from static data.');
    }
    const found = (staticMembers as unknown as Member[]).find(m => m.id === id);
    if (found) return found;
    throw new Error('Member not found');
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
