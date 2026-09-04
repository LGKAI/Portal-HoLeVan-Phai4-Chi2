import api from './api';
import { Donation } from '../types';

export const donationService = {
  getDonations: async (): Promise<Donation[]> => {
    const response = await api.get('/donations');
    return response.data.data || [];
  },

  getAdminDonations: async (): Promise<Donation[]> => {
    const response = await api.get('/donations/admin');
    return response.data.data || [];
  },

  createDonation: async (data: { donor_name: string; amount: number; message?: string }): Promise<any> => {
    const response = await api.post('/donations', data);
    return response.data;
  },

  verifyDonation: async (id: number): Promise<any> => {
    const response = await api.put(`/donations/${id}/verify`);
    return response.data;
  },

  deleteDonation: async (id: number): Promise<any> => {
    const response = await api.delete(`/donations/${id}`);
    return response.data;
  },
};
