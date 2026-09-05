import api from './api';
import { Donation } from '../types';
import staticDonations from '../data/donations.json';

export const donationService = {
  getDonations: async (): Promise<Donation[]> => {
    try {
      const response = await api.get('/donations');
      if (response.data?.data && response.data.data.length > 0) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('Backend API not reachable, loading static donations.');
    }
    return (staticDonations as unknown as Donation[]) || [];
  },

  getAdminDonations: async (): Promise<Donation[]> => {
    try {
      const response = await api.get('/donations/admin');
      if (response.data?.data && response.data.data.length > 0) {
        return response.data.data;
      }
    } catch (err) {
      console.warn('Backend API not reachable, loading static donations.');
    }
    return (staticDonations as unknown as Donation[]) || [];
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
