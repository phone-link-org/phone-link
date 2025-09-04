import { create } from "zustand";
import api from "../api/axios"; // 미리 설정된 Axios 인스턴스

// 사용자 정보 타입 정의
interface User {
  id: number;
  name: string;
  nickname: string;
  email: string;
  role: "USER" | "SELLER" | "ADMIN";
  storeId: number | null;
}

// Store의 상태와 액션에 대한 타입 정의
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  handleSocialLogin: (
    provider: "kakao" | "naver" | "google" | "apple",
    code: string,
  ) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  // 초기 상태
  isAuthenticated: false,
  user: null,
  isLoading: true, // 앱 시작 시 인증 상태를 확인하므로 true로 시작

  // 로그인 액션
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await api.post<{ user: User; token: string }>(
        "/auth/login",
        credentials,
      );
      const { user, token } = response.data;

      // Axios 인스턴스의 기본 헤더에 토큰 설정
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // 필요하다면 localStorage에 토큰 저장 (보안 고려 필요)
      localStorage.setItem("token", token);

      set({ isAuthenticated: true, user, isLoading: false });
    } catch (error) {
      console.error("Login failed:", error);
      set({ isAuthenticated: false, user: null, isLoading: false });
      // 에러를 다시 던져서 로그인 폼에서 처리할 수 있게 함
      throw error;
    }
  },

  // 소셜 로그인(SSO) 처리 액션 구현
  handleSocialLogin: async (provider, code) => {
    set({ isLoading: true });
    try {
      // 우리 백엔드에 인가 코드를 보내 최종 인증을 요청
      const response = await api.post<{ user: User; token: string }>(
        `/auth/${provider}/callback`,
        { code }, // 백엔드에 { "code": "ABCDEFG..." } 형태로 전송
      );
      const { user, token } = response.data;

      // 이후 로직은 일반 로그인과 동일
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);

      set({ isAuthenticated: true, user, isLoading: false });
    } catch (error) {
      console.error("Social login failed:", error);
      set({ isAuthenticated: false, user: null, isLoading: false });
      throw error;
    }
  },

  // 로그아웃 액션
  logout: () => {
    // 토큰 및 인증 정보 제거
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    set({ isAuthenticated: false, user: null });
  },

  // 앱 로드 시 인증 상태 확인 액션
  checkAuthStatus: async () => {
    set({ isLoading: true });
    const token = localStorage.getItem("token");
    if (!token) {
      set({ isAuthenticated: false, user: null, isLoading: false });
      return;
    }

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get<{ user: User }>("/auth/me"); // 현재 사용자 정보를 가져오는 엔드포인트

      set({
        isAuthenticated: true,
        user: response.data.user,
        isLoading: false,
      });
    } catch (error) {
      // 토큰이 유효하지 않은 경우
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },
}));
