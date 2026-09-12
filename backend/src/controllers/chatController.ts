import { Request, Response } from 'express';
import { askGeminiRAG } from '../services/ragService';

export const handleChat = async (req: Request, res: Response) => {
    const { message, conversation_history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không hợp lệ' });
    }

    const trimmedMessage = message.trim();

    // 1. Ưu tiên: Xử lý bằng RAG Engine trực tiếp tích hợp trong Backend qua Gemini API
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
        try {
            const reply = await askGeminiRAG(trimmedMessage, conversation_history || []);
            return res.json({
                success: true,
                reply: reply
            });
        } catch (err: any) {
            console.error('[Chat RAG Error]:', err.message);
            return res.json({
                success: true,
                reply: `Lỗi kết nối AI: ${err.message}. Lưu ý: GEMINI_API_KEY chuẩn của Google AI Studio luôn bắt đầu bằng tiền tố "AIzaSy...". Vui lòng kiểm tra lại giá trị key trên Render.`
            });
        }
    }

    // 2. Dự phòng: Gọi tới microservice Python RAG Service nếu có cấu hình RAG_SERVICE_URL
    const ragServiceUrl = process.env.RAG_SERVICE_URL;
    if (ragServiceUrl && ragServiceUrl.trim()) {
        try {
            const cleanUrl = ragServiceUrl.replace(/\/$/, '');
            const response = await fetch(`${cleanUrl}/chat/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: trimmedMessage,
                    conversation_history: conversation_history || []
                }),
                signal: AbortSignal.timeout(30000)
            });

            if (response.ok) {
                const data = await response.json() as { reply?: string };
                return res.json({
                    success: true,
                    reply: data.reply || 'Xin lỗi, không nhận được phản hồi từ hệ thống.'
                });
            }
        } catch (err: any) {
            console.warn(`[Chat] Kết nối tới RAG Service (${ragServiceUrl}) thất bại:`, err.message);
        }
    }

    // 3. Nếu chưa cấu hình cả GEMINI_API_KEY lẫn RAG_SERVICE_URL
    return res.json({
        success: true,
        reply: 'Xin chào! Hệ thống Trợ lý AI đang chờ cấu hình biến môi trường GEMINI_API_KEY trên Render. Bạn chỉ cần lấy API key miễn phí tại Google AI Studio (https://aistudio.google.com/) và thêm vào mục Environment trên Render là có thể bắt đầu trò chuyện.'
    });
};
