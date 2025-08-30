import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../db";
import { User } from "../typeorm/users.entity";
import { SocialAccount } from "../typeorm/socialAccounts.entity";
import { Seller } from "../typeorm/sellers.entity";
import { LoginFormData, SignupFormData } from "../../../shared/types";
import axios from "axios";
import { ssoConfig } from "../config/sso-config";
import { nanoid } from "nanoid";

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
        newUser.address = signupData.address;
        newUser.address_detail = signupData.address_detail;
        newUser.postal_code = signupData.postal_code;
        newUser.sido = signupData.sido;
        newUser.sigungu = signupData.sigungu;
        // SSO 가입 시 password는 null

        const savedUser = await transactionalEntityManager.save(newUser);

        // 판매자일 경우 sellers 테이블에 추가
        if (savedUser.role === "seller" && storeId !== -8574) {
          if (!storeId) {
            throw new Error("STORE_ID_REQUIRED");
          }
          const newSeller = new Seller();
          newSeller.user_id = savedUser.id;
          newSeller.store_id = storeId;
          await transactionalEntityManager.save(newSeller);
        }

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
      if (error.message === "STORE_ID_REQUIRED") {
        return res
          .status(400)
          .json({ message: "판매자 가입 시 소속 매장을 선택해야 합니다." });
      }
      console.error("SSO Signup Error:", error);
      return res
        .status(500)
        .json({ message: "SSO 회원가입 중 오류가 발생했습니다." });
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
        if (signupData.phone_number) {
          const existingUserByPhone = await userRepo.findOne({
            where: { phone_number: signupData.phone_number },
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
        newUser.postal_code = signupData.postal_code;
        newUser.sido = signupData.sido;
        newUser.sigungu = signupData.sigungu;

        const savedUser = await userRepo.save(newUser);

        // 판매자일 경우 sellers 테이블에 추가
        if (savedUser.role === "seller" && storeId !== -8574) {
          if (!storeId) {
            throw new Error("STORE_ID_REQUIRED");
          }
          const sellerRepo = transactionalEntityManager.getRepository(Seller);
          const newSeller = new Seller();
          newSeller.user_id = savedUser.id;
          newSeller.store_id = storeId;
          await sellerRepo.save(newSeller);
        }
      });

      res.status(201).json({ message: "성공적으로 가입되었습니다!" });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message === "EMAIL_ALREADY_EXISTS") {
        return res.status(409).json({ message: "이미 가입된 이메일입니다." });
      }
      if (error.message === "PHONE_ALREADY_EXISTS") {
        return res
          .status(409)
          .json({ message: "이미 사용 중인 전화번호입니다." });
      }
      if (error.message === "PASSWORD_REQUIRED") {
        return res.status(400).json({ message: "비밀번호를 입력해주세요." });
      }
      if (error.message === "STORE_ID_REQUIRED") {
        return res
          .status(400)
          .json({ message: "판매자 가입 시 소속 매장을 선택해야 합니다." });
      }
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

    //user role이 seller인데 매장 등록이 안되어있으면 매장 등록 페이지로 이동
    if (user.role === "seller") {
      const seller = await AppDataSource.getRepository(Seller).findOne({
        where: { user_id: user.id },
      });
      if (!seller) {
        return res.status(202).json({
          message: `매장 등록 페이지로 이동합니다.`,
          user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            role: user.role,
          },
          token, // 생성된 토큰을 응답에 추가
        });
      }
    }

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

// 기존 /auth/naver/callback 라우트를 범용 라우트로 변경
router.post("/auth/callback/:provider", async (req, res) => {
  const { provider } = req.params;
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Authorization code is missing." });
  }

  try {
    let userProfile;

    switch (provider) {
      case "naver":
        userProfile = await getNaverUserProfile(code);
        break;
      case "kakao":
        userProfile = await getKakaoUserProfile(code);
        break;
      // TODO: case "kakao": ... 등 다른 프로바이더 추가
      default:
        return res
          .status(400)
          .json({ message: "지원하지 않는 SSO 프로바이더입니다." });
    }

    if (!userProfile) {
      return res
        .status(500)
        .json({ message: "SSO 사용자 프로필을 가져오는데 실패했습니다." });
    }

    // --- 여기부터는 기존의 사용자 조회/연동/생성 로직과 거의 동일 ---

    // 1. 소셜 계정 정보로 기존 사용자 찾기
    const socialAccountRepo = AppDataSource.getRepository(SocialAccount);
    const socialAccount = await socialAccountRepo.findOne({
      where: {
        provider: provider,
        provider_user_id: userProfile.sso_id,
      },
      relations: ["user"],
    });

    let user = socialAccount?.user;

    // 2. 소셜 계정이 없으면, 전화번호로 기존 사용자를 찾아 연동
    if (!user && userProfile.phone_number) {
      const userRepo = AppDataSource.getRepository(User);
      let formattedPhoneNumber = userProfile.phone_number.replace("+82 ", "0");
      formattedPhoneNumber = formattedPhoneNumber.replace(/[^0-9]/g, "");
      if (formattedPhoneNumber.length === 11) {
        formattedPhoneNumber = formattedPhoneNumber.replace(
          /^(\d{3})(\d{4})(\d{4})$/,
          "$1-$2-$3",
        );
      } else {
        formattedPhoneNumber = "";
      }

      if (formattedPhoneNumber) {
        const existingUserByPhone = await userRepo.findOne({
          where: { phone_number: formattedPhoneNumber },
        });

        if (existingUserByPhone) {
          const newSocialAccount = new SocialAccount();
          newSocialAccount.user = existingUserByPhone;
          newSocialAccount.provider = provider;
          newSocialAccount.provider_user_id = userProfile.sso_id;
          await socialAccountRepo.save(newSocialAccount);
          user = existingUserByPhone;
        }
      }
    }

    // 3. 최종 분기 처리
    if (user) {
      // 로그인 처리
      const token = jwt.sign(
        { user_id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" },
      );

      // user role이 seller인데 매장 등록이 안되어있으면 매장 등록 페이지로 이동
      if (user.role === "seller") {
        const seller = await AppDataSource.getRepository(Seller).findOne({
          where: { user_id: user.id },
        });
        if (!seller) {
          return res.status(202).json({
            message: `매장 등록 페이지로 이동합니다.`,
            user: {
              id: user.id,
              email: user.email,
              nickname: user.nickname,
              role: user.role,
            },
            token, // 생성된 토큰을 응답에 추가
          });
        }
      }

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
      // 신규 가입 처리
      const ssoData = {
        provider_user_id: userProfile.sso_id,
        provider: provider,
        email: userProfile.email,
        name: userProfile.name,
        gender: userProfile.gender,
        phone_number: userProfile.phone_number,
        birth_year: userProfile.birthyear,
        birthday: userProfile.birthday,
        role: "user",
      };
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
    console.error(`${provider} callback error:`, error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// --- Helper Functions ---

// 네이버 사용자 프로필을 가져오는 함수
async function getNaverUserProfile(code: string) {
  try {
    const { clientId, clientSecret, redirectUri, tokenUrl, userInfoUrl } =
      ssoConfig.naver;

    const tokenApiUrl = `${tokenUrl}?grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&code=${code}&redirect_uri=${redirectUri}&state=test`;

    const tokenResponse = await axios.get(tokenApiUrl);
    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      console.error(
        "Naver Access Token response does not contain access_token.",
      );
      return null;
    }

    const profileResponse = await axios.get(userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // 응답 데이터와 그 안의 response 객체가 존재하는지 확인
    if (profileResponse?.data?.response) {
      const naverProfile = profileResponse.data.response;
      const userProfile = {
        sso_id: naverProfile.id,
        name: naverProfile.name,
        email: naverProfile.email,
        phone_number: naverProfile.mobile,
        birthyear: naverProfile.birthyear,
        birthday: naverProfile.birthday,
        gender: naverProfile.gender,
      };
      return userProfile;
    } else {
      console.error(
        "Invalid Naver user profile response structure:",
        profileResponse.data,
      );
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error while getting Naver user profile:",
        error.response?.status,
        error.response?.data,
      );
    } else {
      console.error("Unknown error in getNaverUserProfile:", error);
    }
    return null;
  }
}

async function getKakaoUserProfile(code: string) {
  try {
    const { clientId, clientSecret, redirectUri, tokenUrl, userInfoUrl } =
      ssoConfig.kakao;

    const tokenApiUrl = `${tokenUrl}?grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&code=${code}&redirect_uri=${redirectUri}`;

    const tokenResponse = await axios.get(tokenApiUrl, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) throw new Error("카카오 Access Token 발급 실패");

    const profileResponse = await axios.get(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    // 응답 데이터와 그 안의 response 객체가 존재하는지 확인
    if (profileResponse?.data) {
      const kakaoProfile = profileResponse.data;
      console.log(kakaoProfile);
      const userProfile = {
        sso_id: kakaoProfile.id,
        name: kakaoProfile.kakao_account.name,
        email: kakaoProfile.kakao_account.email,
        phone_number: kakaoProfile.kakao_account.phone_number.replace(
          "+82 ",
          "0",
        ),
        birthyear: kakaoProfile.kakao_account.birthyear,
        birthday: kakaoProfile.kakao_account.birthday.replace(
          /(\d{2})(\d{2})/,
          "$1-$2",
        ),
        gender: kakaoProfile.kakao_account.gender === "male" ? "M" : "F",
      };
      return userProfile;
    } else {
      console.error(
        "Invalid Kakao user profile response structure:",
        profileResponse.data,
      );
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error while getting Kakao user profile:",
        error.response?.status,
        error.response?.data,
      );
    } else {
      console.error("Unknown error in getKakaoUserProfile:", error);
    }
    return null;
  }
}

export default router;
