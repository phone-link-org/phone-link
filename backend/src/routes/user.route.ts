import { Router } from "express";
import { UserLogin, UserSignup } from "../dto/users";
import { AppDataSource } from "../db";
import { User } from "../typeorm/users.entity";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";

const router = Router();

router.post("/signup", async (req, res) => {
  const { signupToken, ...signupData }: UserSignup & { signupToken?: string } =
    req.body;

  try {
    if (signupToken) {
      // SSO 가입 처리
      const decoded = jwt.verify(
        signupToken,
        process.env.JWT_SIGNUP_SECRET || "default_signup_secret",
      ) as {
        sso_id: string;
        sso_provider: "naver" | "google" | "apple" | "kakao";
        email: string;
        name: string;
      };

      const newUser = new User();
      newUser.email = decoded.email;
      newUser.sso_id = decoded.sso_id;
      newUser.login_provider = decoded.sso_provider;
      newUser.name = decoded.name;
      // 프론트에서 받은 추가 정보
      newUser.id = signupData.id;
      newUser.address = signupData.address;
      newUser.phone_number = signupData.phoneNumber;
      newUser.gender = signupData.gender;
      newUser.role = signupData.role;
      // SSO 가입이므로 password는 null

      await AppDataSource.getRepository(User).save(newUser);
    } else {
      // 일반 가입 처리
      await AppDataSource.transaction(async (transactionEntityManager) => {
        const existing = await transactionEntityManager.findOne(User, {
          where: { email: signupData.email, id: signupData.id },
        });

        if (existing) {
          return res
            .status(400)
            .json({ message: "this email is already signed up" });
        }

        const newUser = new User();
        newUser.email = signupData.email;
        newUser.id = signupData.id;
        newUser.password = await bcrypt.hash(signupData.password, 10);
        newUser.name = signupData.name;
        newUser.phone_number = signupData.phoneNumber;
        newUser.address = signupData.address;
        newUser.gender = signupData.gender;
        newUser.role = signupData.role;
        // login_provider는 DB 기본값 'local' 사용

        await transactionEntityManager.save(newUser);
      });
    }

    res.status(201).json({ message: "Successfully signed up!" });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid signup token." });
    }
    console.error("Failed to create new user!", error);
    res.status(400).json({ message: "Failed to signed up. Check the body" });
  }
});

router.post("/login", async (req, res) => {
  const loginData: UserLogin = req.body;

  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: {
        id: loginData.id,
      },
    });
    if (!user) {
      res.status(401).json({ message: `can't find user ${loginData.id}` });
      return;
    }

    const isMatch = await bcrypt.compare(loginData.password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Password is incorrect" });
      return;
    }

    // JWT 생성
    const token = jwt.sign(
      {
        user_id: user.user_id, // DB의 primary key
        id: user.id, // 사용자가 쓰는 아이디
        role: user.role,
      },
      process.env.JWT_SECRET!, // .env 파일에 SECRET KEY를 설정하는 것이 안전합니다.
      { expiresIn: "1h" }, // 토큰 유효 기간
    );

    res.status(200).json({
      message: `${user.id} logged in.`,
      user: {
        id: user.id,
        role: user.role,
      },
      token, // 생성된 토큰을 응답에 추가
    });
  } catch (error) {
    console.error("Failed to Login", error);
    res.status(500).json({ message: "Failed to Login." });
  }
});

router.post("/auth/naver/callback", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Authorization code is missing." });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  const redirectUri = process.env.NAVER_REDIRECT_URI;
  const tokenApiUrl = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&code=${code}&state=test`;

  try {
    // 1. 네이버에 Access Token 요청
    const tokenResponse = await axios.get(tokenApiUrl);
    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.status(400).json({ message: "Failed to get access token." });
    }

    // 2. Access Token으로 사용자 프로필 정보 요청
    const profileResponse = await axios.get(
      "https://openapi.naver.com/v1/nid/me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const naverUser = profileResponse.data.response;
    if (!naverUser) {
      return res.status(400).json({ message: "Failed to get user profile." });
    }

    // 네이버 사용자 ID(sso_id)로 우리 DB에서 사용자 조회
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { sso_id: naverUser.id } });

    // 분기 처리
    if (user) {
      // 1. 사용자가 이미 존재할 경우 -> 로그인 처리
      const token = jwt.sign(
        {
          user_id: user.user_id,
          id: user.id,
          role: user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" },
      );

      return res.status(200).json({
        message: "SSO login successful.",
        user: {
          id: user.id,
          role: user.role,
        },
        token,
        isNewUser: false,
      });
    } else {
      // 2. 사용자가 존재하지 않을 경우 -> 신규 가입 처리
      // 회원가입 페이지에 전달할 사전 정보
      const ssoData = {
        sso_id: naverUser.id,
        sso_provider: "naver",
        email: naverUser.email,
        name: naverUser.name,
        gender: naverUser.gender === "M" ? "male" : "female",
        phone_number: naverUser.mobile,
        role: "user",
      };

      // 임시 회원가입 토큰 생성 (유효시간 10분)
      const signupToken = jwt.sign(
        ssoData,
        process.env.JWT_SIGNUP_SECRET || "default_signup_secret",
        { expiresIn: "10m" },
      );

      return res.status(200).json({
        message: "New SSO user. Additional info required.",
        ssoData,
        signupToken,
        isNewUser: true,
      });
    }
  } catch (error) {
    console.error("Naver callback error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
