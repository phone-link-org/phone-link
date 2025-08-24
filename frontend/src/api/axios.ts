import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:4000/api", // 백엔드 API 주소
  withCredentials: true, // 쿠키 전송을 위함
});

export default apiClient;
