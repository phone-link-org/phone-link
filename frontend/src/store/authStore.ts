// src/stores/authStore.ts
import { create } from "zustand";
import apiClient from "../api/axios"; // 제공해주신 axios 인스턴스 경로
import type { UserAuthData, LoginFormData } from "../../../shared/types"; // DTO 경로

// API의 data 필드에 담겨 오는 성공 응답의 타입을 정의합니다.
interface LoginSuccessData {
  token: string;
  userAuthData: UserAuthData;
}

// 스토어의 상태(state) 타입 정의
interface AuthState {
  user: UserAuthData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// 스토어의 액션(action) 타입 정의
interface AuthActions {
  login: (credentials: LoginFormData) => Promise<{ status: number }>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
}

// 최종 스토어 타입
type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // 초기 상태 (Initial State)
  user: null,
  isAuthenticated: false,
  isLoading: true, // 앱 시작 시 인증 상태 확인을 위해 true로 설정
  error: null,

  // Action: 일반 로그인
  login: async (credentials: LoginFormData) => {
    set({ isLoading: true, error: null });
    try {
      // 서버의 로그인 API 호출 (/api/auth/login)
      // 성공 시 { token: string, user: UserAuthData } 형태의 응답을 기대
      const response = await apiClient.post<{ data: LoginSuccessData }>(
        "/auth/login",
        credentials,
      );

      const loginData = response.data.data;
      const status = response.status;

      // localStorage에 토큰 저장
      localStorage.setItem("token", loginData.token);

      // Axios 인스턴스 헤더에 인증 토큰 설정 (이미 인터셉터에서 처리하지만, 즉시 적용을 위해 추가)
      apiClient.defaults.headers.common["Authorization"] =
        `Bearer ${loginData.token}`;

      // 스토어 상태 업데이트
      set({
        user: loginData.userAuthData,
        isAuthenticated: true,
        isLoading: false,
      });

      return { status };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "로그인에 실패했습니다.";
      set({ error: errorMessage, isLoading: false, isAuthenticated: false });
      // 에러를 다시 throw하여 컴포넌트 단에서 후속 처리를 할 수 있도록 함
      throw new Error(errorMessage);
    }
  },

  // Action: 로그아웃
  logout: async () => {
    set({ isLoading: true });
    // 서버에 로그아웃 요청 (선택 사항)
    // await apiClient.post('/auth/logout');

    // localStorage에서 토큰 제거
    localStorage.removeItem("token");

    // Axios 인스턴스 헤더에서 토큰 제거
    delete apiClient.defaults.headers.common["Authorization"];

    // 스토어 상태 초기화
    set({ user: null, isAuthenticated: false, isLoading: false });

    // 로그인 페이지로 리디렉션
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  },

  // Action: 앱 로드 시 또는 페이지 새로고침 시 인증 상태를 확인
  checkAuthStatus: async () => {
    const token = localStorage.getItem("token");

    // 토큰이 없으면 비로그인 상태로 확정
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      // 토큰이 유효한지 확인하기 위해 사용자 프로필 정보를 요청하는 API 호출
      // (/api/auth/profile 또는 /api/users/me)
      const response = await apiClient.get<UserAuthData>("/auth/profile");
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error("Auth check failed:", error);
      // 토큰이 유효하지 않은 경우 (ex: 만료)
      localStorage.removeItem("token");
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Action: 에러 메시지 초기화
  clearError: () => {
    set({ error: null });
  },
}));
