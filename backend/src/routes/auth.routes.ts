import { Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppDataSource } from "../db";
import { User } from "../typeorm/users.entity";
import { SocialAccount } from "../typeorm/socialAccounts.entity";
import { Seller } from "../typeorm/sellers.entity";
import { LoginFormData, UserAuthData } from "../../../shared/types";
import axios from "axios";
import { ssoConfig } from "../config/sso-config";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { ROLES, SSO_PROVIDERS } from "../../../shared/constants";

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: UserAuthData & JwtPayload; // 토큰에서 디코딩된 사용자 정보
}

// 소셜 서비스로부터 가져온 정규화된 프로필 타입
interface UserProfile {
  sso_id: string;
  name: string;
  email: string;
  phone_number?: string;
  birthyear?: string;
  birthday?: string;
  gender?: "M" | "F";
  accessToken: string;
  refreshToken: string;
}

/**
 * 사용자 정보를 바탕으로 JWT를 생성합니다.
 * @param user User 엔티티 객체
 * @returns 생성된 JWT string
 */
const createToken = (user: User, storeId?: number): string => {
  const payload: UserAuthData = {
    id: user.id,
    nickname: user.nickname,
    role: user.role,
  };

  if (storeId) payload.storeId = storeId;

  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;

  if (!secret) throw new Error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");

  // jwt.sign 옵션 객체 생성
  const options: jwt.SignOptions = {};
  if (expiresIn) options.expiresIn = expiresIn as jwt.SignOptions["expiresIn"];

  return jwt.sign(payload, secret, options);
};

router.post("/login", async (req, res) => {
  const loginData: LoginFormData = req.body;

  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: {
        email: loginData.email,
      },
    });

    if (
      !user ||
      !user.password ||
      user.status !== "ACTIVE" ||
      user.deletedAt !== null ||
      !(await bcrypt.compare(loginData.password, user.password))
    ) {
      return res.status(401).json({
        success: false,
        message: "이메일 또는 비밀번호를 확인해주세요.",
        error: "Unauthorized",
      });
    }

    let isNewStore: boolean = false;
    let storeId: number | undefined;

    if (user.role === ROLES.SELLER) {
      const sellerRepository = await AppDataSource.getRepository(Seller);
      // user.id를 기준으로 해당하는 판매자(상점) 정보를 찾습니다.
      const seller = await sellerRepository.findOne({
        where: { user: { id: user.id } },
      });

      if (seller) {
        if (seller.status === "ACTIVE") {
          storeId = seller.storeId;
        } else {
          // 비즈니스 로직상 판매자 계정임에도 상점 정보가 없는 경우에 대한 예외 처리
          console.warn(`판매자 계정(id: ${user.id})에 연결된 상점 정보가 없습니다.`);
        }
      } else {
        isNewStore = true;
      }
    }

    // JWT 생성
    const token = createToken(user, storeId);

    user.lastLoginAt = new Date();
    user.lastLoginType = "local";
    await AppDataSource.getRepository(User).save(user);

    delete user.password;

    const userAuthData: UserAuthData = {
      id: user.id,
      nickname: user.nickname,
      role: user.role,
      storeId: storeId,
    };

    if (isNewStore) {
      return res.status(202).json({
        success: true,
        message: `매장 등록 페이지로 이동합니다.`,
        data: { token, userAuthData },
      });
    }

    res.status(200).json({
      success: true,
      message: "로그인에 성공했습니다.",
      data: { token, userAuthData },
    });
  } catch (error) {
    console.error("Failed to Login", error);
    res.status(500).json({
      success: false,
      message: "로그인 중 오류가 발생했습니다.",
      error: "Internal Server Error",
    });
  }
});

// 토큰을 기반으로 현재 로그인된 사용자의 정보를 반환
router.get("/profile", isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const userRepository = AppDataSource.getRepository(User);
    // 판매자(Seller) 정보도 함께 조회하여 storeId를 확인합니다.
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["sellers"],
    });

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 프론트엔드 authStore에서 사용하는 UserAuthData 타입에 맞게 응답 데이터 구성
    const userAuthData: UserAuthData = {
      id: user.id,
      nickname: user.nickname,
      role: user.role,
    };

    // 판매자이고, 유효한 매장이 있으면 storeId를 추가
    if (user.role === ROLES.SELLER && user.sellers && user.sellers.length > 0) {
      const activeSeller = user.sellers.find((s) => s.status === "ACTIVE");
      if (activeSeller) {
        userAuthData.storeId = activeSeller.storeId;
      }
    }

    res.status(200).json(userAuthData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "프로필 조회 중 서버 오류 발생" });
  }
});

router.post("/callback/:provider", async (req, res) => {
  const { provider } = req.params;
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "Authorization code is missing.",
    });
  }

  try {
    // 소셜 프로필 정보 가져오기
    const userProfile = await getUserProfile(provider, code);

    if (!userProfile) {
      return res.status(500).json({
        success: false,
        message: "SSO 사용자 프로필을 가져오는 데 실패했습니다.",
      });
    }

    // 기존 사용자 조회 또는 계정 연동
    const socialAccountRepo = AppDataSource.getRepository(SocialAccount);
    const userRepo = AppDataSource.getRepository(User);
    let user: User | null = null;

    const socialAccount = await socialAccountRepo.findOne({
      where: { provider, providerUserId: userProfile.sso_id },
      relations: ["user", "user.sellers"],
    });

    if (socialAccount) {
      // Access & Refresh 토큰 갱신
      socialAccount.accessToken = userProfile.accessToken;
      socialAccount.refreshToken = userProfile.refreshToken;
      await socialAccountRepo.save(socialAccount);

      user = socialAccount.user;
      user.lastLoginType = provider;
      await userRepo.save(user);
    } else if (userProfile.phone_number) {
      // 소셜 연동 데이터는 없는데 기존 사용자면 자동 연동
      // TODO: 이런 식으로 처리해도 되는지 검토 후 개선 필요!!
      let formattedPhoneNumber = userProfile.phone_number.replace("+82 ", "0");
      formattedPhoneNumber = formattedPhoneNumber.replace(/[^0-9]/g, "");
      if (formattedPhoneNumber.length === 11) {
        formattedPhoneNumber = formattedPhoneNumber.replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3");
      } else {
        formattedPhoneNumber = "";
      }

      if (formattedPhoneNumber) {
        const existingUser = await userRepo.findOne({
          where: { phoneNumber: formattedPhoneNumber },
          relations: ["sellers"],
        });

        if (existingUser) {
          const newSocialAccount = socialAccountRepo.create({
            user: existingUser,
            provider,
            providerUserId: userProfile.sso_id,
          });
          await socialAccountRepo.save(newSocialAccount);
          user = existingUser;
        }
      }
    }

    // 사용자 존재 여부에 따라 분기 처리
    if (user) {
      // [기존 사용자 로그인 처리]
      let storeId: number | undefined;
      if (user.role === ROLES.SELLER && user.sellers && user.sellers.length > 0) {
        const activeSeller = user.sellers.find((s) => s.status === "ACTIVE");
        if (activeSeller) {
          storeId = activeSeller.storeId;
        }
      }

      const token = createToken(user, storeId);
      const userAuthData: UserAuthData = {
        id: user.id,
        nickname: user.nickname,
        role: user.role,
        storeId,
      };

      if (user.role === ROLES.SELLER && !storeId) {
        return res.status(202).json({
          success: true,
          data: { isNewUser: false, token, userAuthData },
        });
      }

      return res.status(200).json({
        success: true,
        data: { isNewUser: false, token, userAuthData },
      });
    } else {
      // [신규 사용자 가입 처리]
      const ssoData = {
        provider,
        providerUserId: userProfile.sso_id,
        email: userProfile.email,
        name: userProfile.name,
        gender: userProfile.gender,
        phoneNumber: userProfile.phone_number,
        birthYear: userProfile.birthyear,
        birthday: userProfile.birthday,
      };
      const signupToken = jwt.sign(ssoData, process.env.JWT_SIGNUP_SECRET || "default_signup_secret", {
        expiresIn: "10m",
      });

      return res.status(200).json({
        success: true,
        data: { isNewUser: true, ssoData, signupToken },
      });
    }
  } catch (error) {
    console.error(`${provider} callback error:`, error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// 로그아웃 할 때 네이버나 카카오에 뭐 해줘야되는줄 알고 만들었는데 아니였음 ㅅㅂ
// router.post("/logout", async (req, res) => {
//   try {
//     const user = req.body;
//     const userRepository = AppDataSource.getRepository(User);
//     const userEntity = await userRepository.findOne({
//       where: { id: user.id },
//     });
//     switch (userEntity?.lastLoginType) {
//       case SSO_PROVIDERS.NAVER:

//         break;
//       case SSO_PROVIDERS.KAKAO:
//         break;
//     }
//   } catch (error) {
//     console.error("Error logging out:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

/**
 * 네이버 Access Token 갱신
 */
async function refreshNaverToken(refreshToken: string | null): Promise<string | null> {
  const { clientId, clientSecret, tokenUrl } = ssoConfig.naver;
  if (refreshToken) {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    });
    const response = await axios.post(tokenUrl, params);
    if (!response.data.access_token) {
      throw new Error("네이버 토큰 갱신에 실패했습니다.");
    }
    return response.data.access_token;
  }

  return null;
}

/**
 * 네이버 계정 연동 해제(탈퇴) (토큰 만료 시 갱신 후 재시도)
 */
async function unlinkNaverAccount(account: SocialAccount): Promise<void> {
  const { clientId, clientSecret, tokenUrl } = ssoConfig.naver;

  const requestUnlink = async (accessToken: string | null) => {
    if (accessToken) {
      const params = new URLSearchParams({
        grant_type: "delete",
        client_id: clientId,
        client_secret: clientSecret,
        access_token: accessToken,
        service_provider: "NAVER",
      });
      await axios.post(tokenUrl, params);
    }
  };

  try {
    await requestUnlink(account.accessToken);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log("Naver Access Token 만료. 토큰을 갱신합니다...");
      const newAccessToken = await refreshNaverToken(account.refreshToken);

      // DB에 갱신된 토큰을 저장하고, 새로 발급받은 토큰으로 다시 연동 해제를 요청
      account.accessToken = newAccessToken;
      await AppDataSource.getRepository(SocialAccount).save(account);

      await requestUnlink(newAccessToken);
    } else {
      throw error; // 401 외 다른 에러는 그대로 전파
    }
  }
}

/**
 * 카카오 계정 연동 해제 (Admin 키 사용)
 */
async function unlinkKakaoAccount(account: SocialAccount): Promise<void> {
  const { adminKey, unlinkUrl } = ssoConfig.kakao;
  const headers = { Authorization: `KakaoAK ${adminKey}` };
  const params = new URLSearchParams({
    target_id_type: "user_id",
    target_id: account.providerUserId,
  });

  const response = await axios.post(unlinkUrl, params, { headers });
  if (response.data?.id?.toString() !== account.providerUserId) {
    throw new Error(`카카오 연동 해제 실패 (사용자 ID: ${account.providerUserId})`);
  }
}

router.post("/withdrawal", async (req, res) => {
  try {
    const user = req.body;

    // DB 작업이 아니므로 트랜잭션 외부에서 실행
    const userEntity = await AppDataSource.getRepository(User).findOne({
      where: { id: user.id },
      relations: ["socialAccounts"],
    });

    if (!userEntity) {
      return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }

    // SSO 프로바이더 탈퇴(연결 해제) API 호출
    const unlinkPromises = userEntity.socialAccounts.map((account) => {
      switch (account.provider) {
        case SSO_PROVIDERS.NAVER:
          return unlinkNaverAccount(account);
        case SSO_PROVIDERS.KAKAO:
          return unlinkKakaoAccount(account);
        default:
          return Promise.resolve(); // 알려지지 않은 provider는 그냥 통과
      }
    });
    const results = await Promise.allSettled(unlinkPromises);

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const userRepo = transactionalEntityManager.getRepository(User);
      const socialRepo = transactionalEntityManager.getRepository(SocialAccount);

      // 성공적으로 연동 해제된 계정들의 토큰 정보를 정리
      const successfulAccounts: SocialAccount[] = [];
      results.forEach((result, index) => {
        const account = userEntity.socialAccounts[index];
        if (result.status === "fulfilled") {
          console.log(`${account.provider} 연동 해제 성공.`);
          account.accessToken = null;
          account.refreshToken = null;
          successfulAccounts.push(account);
        } else {
          console.error(`${account.provider} 연동 해제 실패:`, result.reason);
        }
      });

      if (successfulAccounts.length > 0) {
        await socialRepo.save(successfulAccounts);
      }

      // 사용자 상태를 '탈퇴'로 변경
      userEntity.status = "WITHDRAWN";
      userEntity.deletedAt = new Date();
      await userRepo.save(userEntity);
    });

    return res.status(200).json({
      success: true,
      message: "탈퇴가 완료되었습니다.",
    });
  } catch (error) {
    console.error("탈퇴 처리 중 에러 발생:", error);
    return res.status(500).json({
      success: false,
      message: "탈퇴 과정에서 서버 에러가 발생했습니다.",
    });
  }
});

async function getUserProfile(provider: string, code: string): Promise<UserProfile | null> {
  switch (provider) {
    case SSO_PROVIDERS.NAVER:
      return await getNaverUserProfile(code);
    case SSO_PROVIDERS.KAKAO:
      return await getKakaoUserProfile(code);
    default:
      console.warn(`지원하지 않는 SSO 프로바이더입니다: ${provider}`);
      return null;
  }
}

// 네이버 사용자 프로필을 가져오는 함수
async function getNaverUserProfile(code: string): Promise<UserProfile | null> {
  try {
    const { clientId, clientSecret, tokenUrl, userInfoUrl } = ssoConfig.naver;

    // Token 발급
    // TODO: 지금 state를 'test'로 하드코딩해놨는데 수정 필요. 랜덤문자열값으로 바꿨는데 에러발생함 원인 파악 필요.
    const tokenApiUrl = `${tokenUrl}?grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&code=${code}&state=test`;

    const tokenResponse = await axios.get(tokenApiUrl);

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      console.error("Naver Access Token response does not contain access_token.");
      return null;
    }

    const profileResponse = await axios.get(userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // 응답 데이터와 그 안의 response 객체가 존재하는지 확인
    if (profileResponse?.data?.response) {
      const naverProfile = profileResponse.data.response;
      const userProfile: UserProfile = {
        sso_id: naverProfile.id,
        name: naverProfile.name,
        email: naverProfile.email,
        phone_number: naverProfile.mobile,
        birthyear: naverProfile.birthyear,
        birthday: naverProfile.birthday,
        gender: naverProfile.gender,
        accessToken: tokenResponse.data.access_token,
        refreshToken: tokenResponse.data.refresh_token,
      };
      return userProfile;
    } else {
      console.error("Invalid Naver user profile response structure:", profileResponse.data);
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error while getting Naver user profile:", error.response?.status, error.response?.data);
    } else {
      console.error("Unknown error in getNaverUserProfile:", error);
    }
    return null;
  }
}

async function getKakaoUserProfile(code: string): Promise<UserProfile | null> {
  try {
    const { clientId, clientSecret, redirectUri, tokenUrl, userInfoUrl } = ssoConfig.kakao;

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
      const userProfile: UserProfile = {
        sso_id: kakaoProfile.id,
        name: kakaoProfile.kakao_account.name,
        email: kakaoProfile.kakao_account.email,
        phone_number: kakaoProfile.kakao_account.phone_number.replace("+82 ", "0"),
        birthyear: kakaoProfile.kakao_account.birthyear,
        birthday: kakaoProfile.kakao_account.birthday.replace(/(\d{2})(\d{2})/, "$1-$2"),
        gender: kakaoProfile.kakao_account.gender === "male" ? "M" : "F",
        accessToken: tokenResponse.data.access_token,
        refreshToken: tokenResponse.data.refresh_token,
      };
      return userProfile;
    } else {
      console.error("Invalid Kakao user profile response structure:", profileResponse.data);
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error while getting Kakao user profile:", error.response?.status, error.response?.data);
    } else {
      console.error("Unknown error in getKakaoUserProfile:", error);
    }
    return null;
  }
}

export default router;
