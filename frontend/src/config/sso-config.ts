// Vite 환경 변수를 안전하게 가져오는 헬퍼 함수
const getEnv = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Vite 환경 변수 ${key}가 설정되지 않았습니다.`);
  }
  return value;
};

// SSO 프로바이더별 공개 설정 객체
export const ssoConfig = {
  // 가이드: https://developers.naver.com/docs/login/devguide/devguide.md
  naver: {
    clientId: getEnv("VITE_NAVER_CLIENT_ID"),
    redirectUri: getEnv("VITE_NAVER_REDIRECT_URI"),
    authUrl: "https://nid.naver.com/oauth2.0/authorize",
  },
  kakao: {
    clientId: getEnv("VITE_KAKAO_CLIENT_ID"),
    redirectUri: getEnv("VITE_KAKAO_REDIRECT_URI"),
    authUrl: "https://kauth.kakao.com/oauth/authorize",
  },
  // TODO: 추후 kakao, google, apple 등 다른 프로바이더 설정 추가
};
