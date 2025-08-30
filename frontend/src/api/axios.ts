import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";

// API 응답 기본 타입
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  success?: boolean;
}

// 에러 응답 타입
export interface ApiError {
  error: string;
  message?: string;
  status?: number;
}

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`, // 백엔드 API 주소
  withCredentials: true, // 쿠키 전송을 위함
  timeout: 10000, // 10초 타임아웃
  headers: {
    "Content-Type": "application/json", // 요청 본문이 JSON임을 명시
    Accept: "application/json", // 서버에게 JSON 응답을 요청
    "X-Requested-With": "XMLHttpRequest", // AJAX 요청임을 서버에 알림 (CSRF 방지)
    "Cache-Control": "no-cache", // 브라우저 캐싱 방지 (항상 최신 데이터 보장)
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 로딩 상태 관리 (필요시)
    // store.dispatch(setLoading(true));

    // 토큰 자동 추가 (localStorage에서)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 로딩 상태 해제 (필요시)
    // store.dispatch(setLoading(false));

    return response;
  },
  (error: AxiosError<ApiError>) => {
    // 로딩 상태 해제 (필요시)
    // store.dispatch(setLoading(false));

    const { response } = error;

    // HTTP 상태 코드별 에러 처리
    switch (response?.status) {
      case 401:
        // 인증 실패 - 로그인 페이지로 리다이렉트
        localStorage.removeItem("token");
        window.location.href = "/login";
        break;
      case 403:
        // 권한 없음
        console.error("접근 권한이 없습니다.");
        break;
      case 404:
        // 리소스 없음
        console.error("요청한 리소스를 찾을 수 없습니다.");
        break;
      case 500:
        // 서버 에러
        console.error("서버 내부 오류가 발생했습니다.");
        break;
      default:
        // 기타 에러
        console.error("알 수 없는 오류가 발생했습니다.");
    }

    return Promise.reject(error);
  },
);

// 타입이 지정된 API 메서드들
export const api = {
  get: <T = any>(url: string, config?: any) =>
    apiClient.get<ApiResponse<T>>(url, config),

  post: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.post<ApiResponse<T>>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.put<ApiResponse<T>>(url, data, config),

  patch: <T = any>(url: string, data?: any, config?: any) =>
    apiClient.patch<ApiResponse<T>>(url, data, config),

  delete: <T = any>(url: string, config?: any) =>
    apiClient.delete<ApiResponse<T>>(url, config),
};

// 기본 export (기존 코드 호환성 유지)
export default apiClient;

// 타입 export
export type { AxiosResponse, AxiosError };
