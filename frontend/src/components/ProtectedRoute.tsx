import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ProtectedRoute: React.FC = () => {
  // authStore에서 로그인 여부만 가져옵니다.
  const { isAuthenticated } = useAuthStore();

  // 로그인 상태이면 요청된 페이지(자식 컴포넌트)를 보여주고,
  // 그렇지 않으면 로그인 페이지로 리디렉션합니다.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
