import { useState, useCallback } from 'react';
import { ChatMessage } from '../types';
import { useAuthStore } from '../store/authStore';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý AI của dòng họ Lê Văn - Phái 4 - Chi 2. Tôi có thể giải đáp những thắc mắc của bạn.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuthStore();

  const sendMessage = useCallback(async (content: string) => {
    const newUserMessage: ChatMessage = { role: 'user', content, timestamp: new Date() };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // HTTP call to backend chatbot with SSE support if needed, or simple fetch
      // Assumes endpoint is available at backend
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: content })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Handle simple JSON response for now, can be updated for SSE
      const data = await response.json();
      
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.reply || 'Xin lỗi, tôi không thể trả lời lúc này.',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra khi kết nối tới hệ thống AI.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  return { messages, isLoading, sendMessage };
};
