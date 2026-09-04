import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { initDb } from './config/db';

import authRoutes from './routes/auth';
import membersRoutes from './routes/members';
import newsRoutes from './routes/news';
import documentsRoutes from './routes/documents';
import donationsRoutes from './routes/donations';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check (dùng cho Docker healthcheck)
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'backend', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.send('Portal Họ Lê Văn - Backend API is running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/donations', donationsRoutes);

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await initDb();
});
