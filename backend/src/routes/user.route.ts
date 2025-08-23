import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../db";
import { User } from "../typeorm/users.entity";
import { SocialAccount } from "../typeorm/socialAccounts.entity";
import { LoginFormData, SignupFormData } from "../../../shared/types";
import axios from "axios";

// 타입을 명확하게 하기 위해 TokenPayload 인터페이스 정의
interface SsoSignupTokenPayload {
  provider: string;
  provider_user_id: string;
  email: string;
  name: string;
  gender?: "M" | "F";
  phone_number?: string;
  birth_year?: string;
  birthday?: string; // MM-DD
}

const router = Router();

router.post("/signup", async (req, res) => {
  const {
    signupToken,
    ...signupData
  }: SignupFormData & { signupToken?: string } = req.body;

  if (signupToken) {
    // --- SSO 회원가입 ---
    try {
      const decoded = jwt.verify(
        signupToken,
        process.env.JWT_SIGNUP_SECRET || "default_signup_secret",
      ) as SsoSignupTokenPayload;

      await AppDataSource.transaction(async (transactionalEntityManager) => {
        // 1. 소셜 계정 정보가 이미 DB에 있는지 확인
        const existingSocialAccount = await transactionalEntityManager.findOne(
          SocialAccount,
          {
            where: {
              provider: decoded.provider,
              provider_user_id: decoded.provider_user_id,
            },
          },
        );

        if (existingSocialAccount) {
          throw new Error("ALREADY_LINKED_ACCOUNT");
        }

        // 2. 이메일 및 전화번호 중복 확인
        const existingUserByEmail = await transactionalEntityManager.findOne(
          User,
          {
            where: { email: decoded.email },
          },
        );
        if (existingUserByEmail) {
          throw new Error("EMAIL_ALREADY_EXISTS");
        }

        const finalPhoneNumber =
          signupData.phone_number || decoded.phone_number;
        if (finalPhoneNumber) {
          const existingUserByPhone = await transactionalEntityManager.findOne(
            User,
            {
              where: { phone_number: finalPhoneNumber },
            },
          );
          if (existingUserByPhone) {
            throw new Error("PHONE_ALREADY_EXISTS");
          }
        }

        // 3. Users 테이블에 새로운 사용자 생성
        const newUser = new User();
        newUser.email = decoded.email;
        newUser.name = decoded.name;
        newUser.nickname = `user_${Math.floor(100000 + Math.random() * 900000)}`;

        // SSO 정보 + 사용자가 추가 입력한 정보
        newUser.gender = signupData.gender || decoded.gender;
        newUser.phone_number = finalPhoneNumber;

        // 생년월일 및 연령대 처리
        const birthDate = signupData.birthday; // YYYY-MM-DD
        if (birthDate) {
          const birthYear = Number(birthDate.split("-")[0]);
          newUser.birth_year = birthYear;
          newUser.birthday = `${birthDate.split("-")[1]}-${
            birthDate.split("-")[2]
          }`;

          const currentYear = new Date().getFullYear();
          const age = currentYear - birthYear;
          if (age >= 0) {
            const startOfRange = Math.floor(age / 10) * 10;
            newUser.age_range = `${startOfRange}-${startOfRange + 9}`;
          }
        } else if (decoded.birth_year && decoded.birthday) {
          const birthYear = Number(decoded.birth_year);
          newUser.birth_year = birthYear;
          newUser.birthday = decoded.birthday;

          const currentYear = new Date().getFullYear();
          const age = currentYear - birthYear;
          if (age >= 0) {
            const startOfRange = Math.floor(age / 10) * 10;
            newUser.age_range = `${startOfRange}-${startOfRange + 9}`;
          }
        }

        newUser.role = signupData.role;
        // SSO 가입 시 password는 null

        const savedUser = await transactionalEntityManager.save(newUser);

        // 3. SocialAccounts 테이블에 데이터 생성
        const newSocialAccount = new SocialAccount();
        newSocialAccount.user_id = savedUser.id;
        newSocialAccount.provider = decoded.provider;
        newSocialAccount.provider_user_id = decoded.provider_user_id;

        await transactionalEntityManager.save(newSocialAccount);
      });

      res
        .status(201)
        .json({ message: "SSO 계정으로 성공적으로 가입되었습니다!" });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res
          .status(401)
          .json({ message: "유효하지 않은 가입 토큰입니다." });
      }
      if (error.message === "ALREADY_LINKED_ACCOUNT") {
        return res
          .status(409)
          .json({ message: "이미 연동된 소셜 계정입니다." });
      }
      if (error.message === "EMAIL_ALREADY_EXISTS") {
        return res.status(409).json({ message: "이미 가입된 이메일입니다." });
      }
      if (error.message === "PHONE_ALREADY_EXISTS") {
        return res
          .status(409)
          .json({ message: "이미 사용 중인 전화번호입니다." });
      }
      console.error("SSO Signup Error:", error);
      return res
        .status(500)
        .json({ message: "SSO 회원가입 중 오류가 발생했습니다." });
    }
  } else {
    // --- 일반 회원가입 ---
    try {
      const userRepo = AppDataSource.getRepository(User);

      // 1. 이메일 중복 확인
      const existingUserByEmail = await userRepo.findOne({
        where: { email: signupData.email },
      });

      if (existingUserByEmail) {
        return res.status(409).json({ message: "이미 가입된 이메일입니다." });
      }

      // 2. 전화번호 중복 확인 (입력된 경우)
      if (signupData.phone_number) {
        const existingUserByPhone = await userRepo.findOne({
          where: { phone_number: signupData.phone_number },
        });
        if (existingUserByPhone) {
          return res
            .status(409)
            .json({ message: "이미 사용 중인 전화번호입니다." });
        }
      }

      // 3. 비밀번호 해싱
      if (!signupData.password) {
        return res.status(400).json({ message: "비밀번호를 입력해주세요." });
      }
      const hashedPassword = await bcrypt.hash(signupData.password, 10);

      // 4. 새로운 사용자 생성
      const newUser = new User();
      newUser.email = signupData.email;
      newUser.password = hashedPassword;
      newUser.name = signupData.name;
      newUser.nickname = `user_${Math.floor(100000 + Math.random() * 900000)}`;

      // 선택 정보
      newUser.gender = signupData.gender;
      newUser.phone_number = signupData.phone_number;
      const birthDate = signupData.birthday; // YYYY-MM-DD
      if (birthDate) {
        const birthYear = Number(birthDate.split("-")[0]);
        newUser.birth_year = birthYear;
        newUser.birthday = `${birthDate.split("-")[1]}-${
          birthDate.split("-")[2]
        }`;

        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        if (age >= 0) {
          const startOfRange = Math.floor(age / 10) * 10;
          newUser.age_range = `${startOfRange}-${startOfRange + 9}`;
        }
      }
      newUser.role = signupData.role;
      newUser.address = signupData.address;
      newUser.address_detail = signupData.address_detail;
      // newUser.postal_code = signupData.postal_code;
      // newUser.sido = signupData.sido;
      // newUser.sigungu = signupData.sigungu;

      await userRepo.save(newUser);

      res.status(201).json({ message: "성공적으로 가입되었습니다!" });
    } catch (error) {
      console.error("Traditional Signup Error:", error);
      res.status(500).json({ message: "회원가입 중 오류가 발생했습니다." });
    }
  }
});

router.post("/login", async (req, res) => {
  const loginData: LoginFormData = req.body;

  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: {
        email: loginData.email,
      },
    });
    if (!user || !user.password) {
      return res
        .status(401)
        .json({ message: "이메일 또는 비밀번호를 확인해주세요." });
    }

    const isMatch = await bcrypt.compare(loginData.password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "이메일 또는 비밀번호를 확인해주세요." });
    }

    // JWT 생성
    const token = jwt.sign(
      {
        user_id: user.id, // DB의 primary key
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!, // .env 파일에 SECRET KEY를 설정하는 것이 안전합니다.
      { expiresIn: "1h" }, // 토큰 유효 기간
    );

    res.status(200).json({
      message: `${user.email} logged in.`,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
      token, // 생성된 토큰을 응답에 추가
    });
  } catch (error) {
    console.error("Failed to Login", error);
    res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
  }
});

router.post("/auth/naver/callback", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Authorization code is missing." });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
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

    // 1. 소셜 계정 정보로 기존 사용자 찾기
    const socialAccountRepo = AppDataSource.getRepository(SocialAccount);
    const socialAccount = await socialAccountRepo.findOne({
      where: {
        provider: "naver",
        provider_user_id: naverUser.id,
      },
      relations: ["user"], // user 정보도 함께 로드
    });

    let user = socialAccount?.user;

    // 2. 소셜 계정이 없으면, 전화번호로 기존 사용자를 찾아 연동
    if (!user && naverUser.mobile) {
      const userRepo = AppDataSource.getRepository(User);

      // Naver에서 받은 전화번호 정규화 (e.g., +82 10-1234-5678 -> 010-1234-5678)
      let formattedPhoneNumber = naverUser.mobile.replace("+82 ", "0");
      formattedPhoneNumber = formattedPhoneNumber.replace(/[^0-9]/g, "");

      if (formattedPhoneNumber.length === 11) {
        formattedPhoneNumber = formattedPhoneNumber.replace(
          /^(\d{3})(\d{4})(\d{4})$/,
          "$1-$2-$3",
        );
      } else {
        formattedPhoneNumber = ""; // 유효하지 않은 형식이면 연동 시도 안함
      }

      if (formattedPhoneNumber) {
        const existingUserByPhone = await userRepo.findOne({
          where: { phone_number: formattedPhoneNumber },
        });

        if (existingUserByPhone) {
          // 전화번호가 같은 기존 계정이 있으면, 새 소셜 계정을 연동
          const newSocialAccount = new SocialAccount();
          newSocialAccount.user = existingUserByPhone;
          newSocialAccount.provider = "naver";
          newSocialAccount.provider_user_id = naverUser.id;
          await socialAccountRepo.save(newSocialAccount);
          user = existingUserByPhone;
        }
      }
    }

    // 3. 최종 분기 처리
    if (user) {
      // 로그인 처리 (기존 사용자를 찾았거나, 성공적으로 연동한 경우)
      const token = jwt.sign(
        {
          user_id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" },
      );

      return res.status(200).json({
        message: "SSO login successful.",
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          role: user.role,
        },
        token,
        isNewUser: false,
      });
    } else {
      // 신규 가입 처리 (연동할 기존 계정도 없는 새로운 사용자)
      const ssoData = {
        provider_user_id: naverUser.id,
        provider: "naver",
        email: naverUser.email,
        name: naverUser.name,
        gender: naverUser.gender, // "M" or "F"
        phone_number: naverUser.mobile,
        birth_year: naverUser.birthyear,
        birthday: naverUser.birthday,
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
