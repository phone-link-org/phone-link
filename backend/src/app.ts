// src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import offerRoutes from "./routes/offer.routes";
import priceInputRoutes from "./routes/priceInput.route";
import userRoutes from "./routes/user.route";
import storeRoutes from "./routes/store.routes";
import adminRoutes from "./routes/admin.routes";
import regionRoutes from "./routes/region.routes";
import phoneRoutes from "./routes/phone.routes";
import authRoutes from "./routes/auth.routes";
import uploadRoutes from "./routes/upload.routes";
import postRoutes from "./routes/post.routes";
import utilRoutes from "./routes/util.routes";
import session from "express-session";

dotenv.config();

const app = express();

// JSON 파싱 미들웨어 설정
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // 프론트 주소
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

const secretKey = process.env.SECRET_KEY;

app.use(
  session({
    secret: secretKey!, // 실제 프로덕션에서는 .env 파일 등으로 관리하세요.
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 프로덕션 환경에서는 https를 사용하므로 true
      maxAge: 1000 * 60 * 60 * 24, // 쿠키 유효 기간: 1일
    },
  }),
);

// 정적 파일 제공을 위한 미들웨어 설정
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/offer", offerRoutes);
app.use("/api/price-input", priceInputRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/region", regionRoutes);
app.use("/api/phone", phoneRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/post", postRoutes);
app.use("/api/util", utilRoutes);

export default app;
