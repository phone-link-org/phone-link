// src/stores/authStore.ts
import { create } from "zustand";
import apiClient from "../api/axios"; // 제공해주신 axios 인스턴스 경로
import type { UserAuthData, LoginFormData, UserSuspensionDto } from "../../../shared/types"; // DTO 경로

// API의 data 필드에 담겨 오는 데이터 타입
interface LoginSuccessData {
  token: string;
  userAuthData: UserAuthData;
}

export type SocialLoginResult =
  | {
      type: "LOGIN_SUCCESS";
      status: number; // 200 (일반) 또는 202 (매장 등록 필요)
    }
  | {
      type: "EXISTING_ACCOUNT";
      status: number; // 기존 계정이 존재하니 로그인 후 마이페이지에서 연동하라고 메시지 출력
    }
  | {
      type: "SIGNUP_REQUIRED";
      ssoData: any;
      signupToken: string;
    }
  | {
      type: "SUSPENDED_ACCOUNT";
      suspendInfo: UserSuspensionDto;
    };

// 소셜로그인(SSO) Response data type
interface SocialLoginResponseData {
  isNewUser: boolean;
  token?: string;
  userAuthData?: UserAuthData;
  ssoData?: any;
  signupToken?: string;
}

// 스토어의 상태(state) 타입 정의
interface AuthState {
  user: UserAuthData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  navigate?: (path: string) => void; // 전역 네비게이션 함수
}

// 스토어의 액션(action) 타입 정의
interface AuthActions {
  login: (credentials: LoginFormData) => Promise<{ status: number; suspendInfo?: UserSuspensionDto }>;
  handleSocialLoginCallback: (provider: string, code: string) => Promise<SocialLoginResult>;
  logout: (onLogout?: () => void) => Promise<void>;
  withdrawal: (user: UserAuthData, onWithdrawal?: () => void) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
  setNavigate: (navigate: (path: string) => void) => void; // 네비게이션 함수 등록
}

// 최종 스토어 타입
type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => {
  // 로그인 성공 시의 공통 로직을 별도의 함수로 분리
  const setLoginSuccessState = (loginData: LoginSuccessData) => {
    localStorage.setItem("token", loginData.token);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${loginData.token}`;
    set({
      user: loginData.userAuthData,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  };

  // 초기 상태 (Initial State)
  return {
    user: null,
    isAuthenticated: false,
    isLoading: true, // 앱 시작 시 인증 상태 확인을 위해 true로 설정
    error: null,
    navigate: undefined,

    // Action: 일반 로그인
    login: async (credentials: LoginFormData) => {
      set({ isLoading: true, error: null });
      try {
        // Server 로그인 API 호출
        const response = await apiClient.post<{
          success: boolean;
          message: string;
          data?: LoginSuccessData; // 로그인 성공 시 데이터
          suspendInfo?: UserSuspensionDto; // 정지된 사용자일 경우 반환되는 정지 정보
        }>("/auth/login", credentials);
        const loginData = response.data.data;
        const status = response.status;
        if (response.data.success && loginData && !response.data.suspendInfo) {
          setLoginSuccessState(loginData);
        }

        if (!loginData && response.data.suspendInfo) {
          // 정지된 계정의 경우 로딩 상태 해제
          set({ isLoading: false });
          return { status, suspendInfo: response.data.suspendInfo };
        }

        // 기타 경우에도 로딩 상태 해제
        set({ isLoading: false });
        return { status };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "로그인에 실패했습니다.";
        set({ error: errorMessage, isLoading: false, isAuthenticated: false });
        // 에러를 다시 throw하여 컴포넌트 단에서 후속 처리를 할 수 있도록 함
        throw new Error(errorMessage);
      }
    },

    // Action: 소셜 로그인 콜백 처리
    handleSocialLoginCallback: async (provider: string, code: string) => {
      set({ isLoading: true, error: null });
      try {
        // Server 소셜 로그인 콜백 API 호출
        const response = await apiClient.post<{
          data?: SocialLoginResponseData;
          suspendInfo?: UserSuspensionDto;
        }>(`/auth/callback/${provider}`, { code });

        const responseData = response.data.data;
        const status = response.status;

        // 정지된 계정 처리
        if (status === 299 && response.data.suspendInfo) {
          set({ isLoading: false });
          return {
            type: "SUSPENDED_ACCOUNT",
            suspendInfo: response.data.suspendInfo,
          };
        }

        // 가입 이력이 없는 신규 사용자인 경우
        if (responseData?.isNewUser && responseData?.ssoData && responseData?.signupToken) {
          set({ isLoading: false }); // 로딩 상태만 해제
          return {
            type: "SIGNUP_REQUIRED",
            ssoData: responseData.ssoData,
            signupToken: responseData.signupToken,
          };
        }

        if (
          !responseData?.isNewUser &&
          status === 202 &&
          responseData?.userAuthData === null &&
          responseData?.token === null
        ) {
          return {
            type: "EXISTING_ACCOUNT",
            status: status,
          };
        }

        // 기존 사용자 로그인 성공 (일반 사용자 또는 매장 등록 필요한 판매자)
        if (responseData?.token && responseData?.userAuthData) {
          setLoginSuccessState({
            token: responseData.token,
            userAuthData: responseData.userAuthData,
          });
          return {
            type: "LOGIN_SUCCESS",
            status: status, // 200 또는 202 상태 코드를 그대로 전달
          };
        }

        // 예기치 않은 응답 형식에 대한 에러
        throw new Error("서버로부터 유효하지 않은 응답을 받았습니다.");
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "소셜 로그인에 실패했습니다.";
        set({ error: errorMessage, isLoading: false, isAuthenticated: false });
        throw new Error(errorMessage);
      }
    },

    // Action: 로그아웃
    logout: async (onLogout?: () => void) => {
      set({ isLoading: true });
      // localStorage에서 토큰 제거
      localStorage.removeItem("token");

      // Axios 인스턴스 헤더에서 토큰 제거
      delete apiClient.defaults.headers.common["Authorization"];

      // 스토어 상태 초기화
      set({ user: null, isAuthenticated: false, isLoading: false });

      // 콜백 함수가 제공되면 실행, 그렇지 않으면 기본 동작
      if (onLogout) {
        onLogout();
      } else {
        // 전역 네비게이션 함수가 등록되어 있으면 사용, 그렇지 않으면 window.location.href 사용
        const { navigate } = useAuthStore.getState();
        if (navigate && window.location.pathname !== "/login") {
          navigate("/login");
        } else if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    },

    // Action: 회원 탈퇴
    withdrawal: async (user: UserAuthData, onWithdrawal?: () => void) => {
      set({ isLoading: true, error: null });
      try {
        // Server 탈퇴 API 호출
        await apiClient.post("/auth/withdrawal", user);

        // 탈퇴 성공 시 로그아웃 처리
        localStorage.removeItem("token");
        delete apiClient.defaults.headers.common["Authorization"];
        set({ user: null, isAuthenticated: false, isLoading: false });

        // 콜백 함수가 제공되면 실행, 그렇지 않으면 기본 동작
        if (onWithdrawal) {
          onWithdrawal();
        } else {
          // 전역 네비게이션 함수가 등록되어 있으면 사용, 그렇지 않으면 window.location.href 사용
          const { navigate } = useAuthStore.getState();
          if (navigate) {
            navigate("/");
          } else {
            window.location.href = "/";
          }
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "회원 탈퇴 중 오류가 발생했습니다.";
        set({ error: errorMessage, isLoading: false });
        // 에러를 다시 throw하여 컴포넌트 단에서 후속 처리를 할 수 있도록 함
        throw new Error(errorMessage);
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

    // Action: 전역 네비게이션 함수 등록
    setNavigate: (navigate: (path: string) => void) => {
      set({ navigate });
    },
  };
});
