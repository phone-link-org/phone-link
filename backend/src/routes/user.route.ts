import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../db";
import { User } from "../typeorm/users.entity";
import { SocialAccount } from "../typeorm/socialAccounts.entity";
import { Seller } from "../typeorm/sellers.entity";
import { SignupFormData } from "../../../shared/types";
import { nanoid } from "nanoid";
import { ROLES } from "../../../shared/constants";

// 타입을 명확하게 하기 위해 TokenPayload 인터페이스 정의
interface SsoSignupTokenPayload {
  provider: string;
  providerUserId: string;
  email: string;
  name: string;
  gender?: "M" | "F";
  phoneNumber?: string;
  birthYear?: string;
  birthday?: string; // MM-DD
}

const router = Router();

router.post("/signup", async (req, res) => {
  const {
    signupToken, //있으면 SSO 회원가입, 없으면 일반 회원가입
    storeId,
    ...signupData
  }: SignupFormData & { signupToken?: string; storeId?: number } = req.body;

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
              providerUserId: decoded.providerUserId,
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

        const finalPhoneNumber = signupData.phoneNumber || decoded.phoneNumber;
        if (finalPhoneNumber) {
          const existingUserByPhone = await transactionalEntityManager.findOne(
            User,
            {
              where: { phoneNumber: finalPhoneNumber },
            },
          );
          if (existingUserByPhone) {
            throw new Error("PHONE_ALREADY_EXISTS");
          }
        }

        const userRepo = AppDataSource.getRepository(User);

        // 3. Users 테이블에 새로운 사용자 생성
        const newUser = new User();
        newUser.email = decoded.email;
        newUser.name = decoded.name;

        // 닉네임 자동 생성 (user_{nanoid}) - 중복 확인 포함
        let isNicknameUnique = false;
        let generatedNickname = "";
        while (!isNicknameUnique) {
          // 'user_' 접두사와 10자리 nanoid 결합
          generatedNickname = nanoid(10);
          const existingNickname = await userRepo.findOne({
            where: { nickname: generatedNickname },
          });

          if (!existingNickname) {
            isNicknameUnique = true;
          }
        }
        newUser.nickname = generatedNickname;

        // SSO 정보 + 사용자가 추가 입력한 정보
        newUser.gender = signupData.gender || decoded.gender;
        newUser.phoneNumber = finalPhoneNumber;

        // 생년월일 및 연령대 처리
        const birthDate = signupData.birthday; // YYYY-MM-DD
        if (birthDate) {
          const birthYear = Number(birthDate.split("-")[0]);
          newUser.birthYear = birthYear;
          newUser.birthday = `${birthDate.split("-")[1]}-${
            birthDate.split("-")[2]
          }`;

          const currentYear = new Date().getFullYear();
          const age = currentYear - birthYear;
          if (age >= 0) {
            const startOfRange = Math.floor(age / 10) * 10;
            newUser.ageRange = `${startOfRange}-${startOfRange + 9}`;
          }
        } else if (decoded.birthYear && decoded.birthday) {
          const birthYear = Number(decoded.birthYear);
          newUser.birthYear = birthYear;
          newUser.birthday = decoded.birthday;

          const currentYear = new Date().getFullYear();
          const age = currentYear - birthYear;
          if (age >= 0) {
            const startOfRange = Math.floor(age / 10) * 10;
            newUser.ageRange = `${startOfRange}-${startOfRange + 9}`;
          }
        }

        newUser.role = signupData.role;
        newUser.address = signupData.address;
        newUser.addressDetail = signupData.addressDetail;
        newUser.postalCode = signupData.postalCode;
        newUser.sido = signupData.sido;
        newUser.sigungu = signupData.sigungu;
        // SSO 가입 시 password는 null

        const savedUser = await transactionalEntityManager.save(newUser);

        // 판매자일 경우 sellers 테이블에 추가
        if (savedUser.role === ROLES.SELLER && storeId !== -8574) {
          if (!storeId) {
            throw new Error("STORE_ID_REQUIRED");
          }
          const newSeller = new Seller();
          newSeller.userId = savedUser.id;
          newSeller.storeId = storeId;
          await transactionalEntityManager.save(newSeller);
        }

        // 3. SocialAccounts 테이블에 데이터 생성
        const newSocialAccount = new SocialAccount();
        newSocialAccount.userId = savedUser.id;
        newSocialAccount.provider = decoded.provider;
        newSocialAccount.providerUserId = decoded.providerUserId;

        await transactionalEntityManager.save(newSocialAccount);
      });

      res.status(201).json({
        success: true,
        message: "소셜 회원가입을 통해 정상적으로 가입되었습니다!",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          message: "유효하지 않은 가입 토큰입니다.",
          error: "Unauthorized",
        });
      }
      if (error.message === "ALREADY_LINKED_ACCOUNT") {
        return res.status(409).json({
          success: false,
          message: "이미 연동된 소셜 계정입니다.",
          error: "Conflict",
        });
      }
      if (error.message === "EMAIL_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "이미 가입된 이메일입니다.",
          error: "Conflict",
        });
      }
      if (error.message === "PHONE_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "이미 사용 중인 전화번호입니다.",
          error: "Conflict",
        });
      }
      if (error.message === "STORE_ID_REQUIRED") {
        return res.status(400).json({
          success: false,
          message: "판매자 가입 시 소속 매장을 선택해야 합니다.",
          error: "Bad Request",
        });
      }
      console.error("SSO Signup Error:", error);
      return res.status(500).json({
        success: false,
        message: "SSO 회원가입 중 오류가 발생했습니다.",
        error: "Internal Server Error",
      });
    }
  } else {
    // --- 일반 회원가입 ---
    try {
      await AppDataSource.transaction(async (transactionalEntityManager) => {
        const userRepo = transactionalEntityManager.getRepository(User);

        // 1. 이메일 중복 확인
        const existingUserByEmail = await userRepo.findOne({
          where: { email: signupData.email },
        });
        if (existingUserByEmail) {
          throw new Error("EMAIL_ALREADY_EXISTS");
        }

        // 2. 전화번호 중복 확인 (입력된 경우)
        if (signupData.phoneNumber) {
          const existingUserByPhone = await userRepo.findOne({
            where: { phoneNumber: signupData.phoneNumber },
          });
          if (existingUserByPhone) {
            throw new Error("PHONE_ALREADY_EXISTS");
          }
        }

        // 3. 비밀번호 해싱
        if (!signupData.password) {
          throw new Error("PASSWORD_REQUIRED");
        }
        const hashedPassword = await bcrypt.hash(signupData.password, 10);

        // 4. 새로운 사용자 생성
        const newUser = new User();
        newUser.email = signupData.email;
        newUser.password = hashedPassword;
        newUser.name = signupData.name;

        // 닉네임 자동 생성 (user_{nanoid}) - 중복 확인 포함
        let isNicknameUnique = false;
        let generatedNickname = "";
        while (!isNicknameUnique) {
          // 'user_' 접두사와 10자리 nanoid 결합
          generatedNickname = nanoid(10);
          const existingNickname = await userRepo.findOne({
            where: { nickname: generatedNickname },
          });

          if (!existingNickname) {
            isNicknameUnique = true;
          }
        }
        newUser.nickname = generatedNickname;

        // 선택 정보
        newUser.gender = signupData.gender;
        newUser.phoneNumber = signupData.phoneNumber;
        const birthDate = signupData.birthday; // YYYY-MM-DD
        if (birthDate) {
          const birthYear = Number(birthDate.split("-")[0]);
          newUser.birthYear = birthYear;
          newUser.birthday = `${birthDate.split("-")[1]}-${
            birthDate.split("-")[2]
          }`;

          const currentYear = new Date().getFullYear();
          const age = currentYear - birthYear;
          if (age >= 0) {
            const startOfRange = Math.floor(age / 10) * 10;
            newUser.ageRange = `${startOfRange}-${startOfRange + 9}`;
          }
        }
        newUser.role = signupData.role;
        newUser.address = signupData.address;
        newUser.addressDetail = signupData.addressDetail;
        newUser.postalCode = signupData.postalCode;
        newUser.sido = signupData.sido;
        newUser.sigungu = signupData.sigungu;

        const savedUser = await userRepo.save(newUser);

        // 판매자일 경우 sellers 테이블에 추가
        if (savedUser.role === ROLES.SELLER && storeId !== -8574) {
          if (!storeId) {
            throw new Error("STORE_ID_REQUIRED");
          }
          const sellerRepo = transactionalEntityManager.getRepository(Seller);
          const newSeller = new Seller();
          newSeller.userId = savedUser.id;
          newSeller.storeId = storeId;
          await sellerRepo.save(newSeller);
        }
      });

      res.status(201).json({
        success: true,
        message: "성공적으로 가입되었습니다!",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message === "EMAIL_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "이미 가입된 이메일입니다.",
          error: "Conflict",
        });
      }
      if (error.message === "PHONE_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "이미 사용 중인 전화번호입니다.",
          error: "Conflict",
        });
      }
      if (error.message === "PASSWORD_REQUIRED") {
        return res.status(400).json({
          success: false,
          message: "비밀번호를 입력해주세요.",
          error: "Bad Request",
        });
      }
      if (error.message === "STORE_ID_REQUIRED") {
        return res.status(400).json({
          success: false,
          message: "판매자 가입 시 소속 매장을 선택해야 합니다.",
          error: "Bad Request",
        });
      }
      console.error("Traditional Signup Error:", error);
      res.status(500).json({
        success: false,
        message: "회원가입 중 오류가 발생했습니다.",
        error: "Internal Server Error",
      });
    }
  }
});

router.get("/profile", async (req, res) => {
  const { userId } = req.query;
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: Number(userId) } });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user information:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "사용자 정보를 불러오는 중 오류가 발생했습니다.",
    });
  }
});

export default router;
