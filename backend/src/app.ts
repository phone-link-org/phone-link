// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import offerRoutes from './routes/offer.routes';
import priceInputRoutes from './routes/priceInput.route';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // 프론트 주소
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json());

app.use('/api/offer', offerRoutes);
app.use('/api/price-input', priceInputRoutes);

export default app;
