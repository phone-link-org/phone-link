import axios from "axios";

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`, // 백엔드 API 주소
  withCredentials: true, // 쿠키 전송을 위함
});

export default apiClient;
