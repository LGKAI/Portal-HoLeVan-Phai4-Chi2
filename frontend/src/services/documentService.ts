import api from './api';
import { Document } from '../types';

export const documentService = {
  getDocuments: async (): Promise<Document[]> => {
    const response = await api.get('/documents');
    return response.data.data || [];
  },
  createDocument: async (formData: FormData): Promise<Document> => {
    const response = await api.post('/documents', formData);
    return response.data.data;
  },
  deleteDocument: async (id: number): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
  updateDocument: async (id: number, data: { title: string; description: string }): Promise<void> => {
    await api.put(`/documents/${id}`, data);
  }
};
