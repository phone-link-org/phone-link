// src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import offerRoutes from "./routes/offer.routes";
import priceInputRoutes from "./routes/priceInput.route";
import userRoutes from "./routes/user.route";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// JSON 파싱 미들웨어 설정
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // 프론트 주소
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

// 정적 파일 제공을 위한 미들웨어 설정
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/offer", offerRoutes);
app.use("/api/price-input", priceInputRoutes);
app.use("/api/user", userRoutes);

export default app;
