import dotenv from "dotenv";

dotenv.config();

// 환경 변수가 제대로 로드되었는지 확인하는 헬퍼 함수
const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`환경 변수 ${key}가 설정되지 않았습니다.`);
  }
  return value;
};

const PHONE_LINK_CLIENT_URL = getEnv("PHONE_LINK_CLIENT_URL");

// SSO 프로바이더별 설정 객체
export const ssoConfig = {
  kakao: {
    clientId: getEnv("KAKAO_CLIENT_ID"),
    clientSecret: getEnv("KAKAO_CLIENT_SECRET"),
    adminKey: getEnv("KAKAO_ADMIN_KEY"),
    redirectUri: `${PHONE_LINK_CLIENT_URL}/auth/callback/kakao`,
    //authUrl: "https://kauth.kakao.com/oauth/authorize",
    tokenUrl: "https://kauth.kakao.com/oauth/token",
    userInfoUrl: "https://kapi.kakao.com/v2/user/me",
    unlinkUrl: "https://kapi.kakao.com/v1/user/unlink",
    scopes: ["profile_nickname", "account_email", "gender", "birthday"],
  },
  naver: {
    clientId: getEnv("NAVER_CLIENT_ID"),
    clientSecret: getEnv("NAVER_CLIENT_SECRET"),
    redirectUri: `${PHONE_LINK_CLIENT_URL}/api/user/auth/callback/naver`,
    //authUrl: "https://nid.naver.com/oauth2.0/authorize",
    tokenUrl: "https://nid.naver.com/oauth2.0/token",
    userInfoUrl: "https://openapi.naver.com/v1/nid/me",
    scopes: ["name", "email", "profile_image", "gender", "birthyear", "mobile"],
  },
  //   google: {
  //     clientId: getEnv("GOOGLE_CLIENT_ID"),
  //     clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
  //     redirectUri: `${PHONE_LINK_CLIENT_URL}/api/auth/callback/google`,
  //     authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  //     tokenUrl: "https://oauth2.googleapis.com/token",
  //     userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
  //     scopes: [
  //       "https://www.googleapis.com/auth/userinfo.profile",
  //       "https://www.googleapis.com/auth/userinfo.email",
  //     ],
  //   },
  //   apple: {
  //     clientId: getEnv("APPLE_CLIENT_ID"), // Service ID
  //     teamId: getEnv("APPLE_TEAM_ID"),
  //     keyId: getEnv("APPLE_KEY_ID"),
  //     privateKeyPath: getEnv("APPLE_PRIVATE_KEY_PATH"), // .p8 파일의 경로
  //     redirectUri: `${PHONE_LINK_CLIENT_URL}/api/auth/callback/apple`,
  //     authUrl: "https://appleid.apple.com/auth/authorize",
  //     tokenUrl: "https://appleid.apple.com/auth/token",
  //     // 애플은 userInfoUrl이 별도로 없으며, 토큰 응답에 포함된 id_token(JWT)을 디코드하여 사용합니다.
  //     scopes: ["name", "email"],
  //   },
};
