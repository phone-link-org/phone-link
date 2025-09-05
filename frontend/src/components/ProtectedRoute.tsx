import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// allowedRoles prop이 안넘어오면 로그인만 확인
interface ProtectedRouteProps {
  allowedRoles?: Array<"USER" | "SELLER" | "ADMIN">;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  const checkAuthorization = () => {
    // 로그인이 되어있지 않으면 무조건 false
    if (!isAuthenticated) {
      return false;
    }

    // allowedRoles prop이 주어지지 않았다면, 로그인만 되어있으면 통과(true)
    if (!allowedRoles) {
      return true;
    }

    // allowedRoles prop이 주어졌다면, 사용자의 역할이 배열에 포함되어야 통과(true)
    return user?.role && allowedRoles.includes(user.role);
  };

  const isAuthorized = checkAuthorization();

  if (!isAuthenticated) {
    // 아예 로그인이 안된 경우 -> 로그인 페이지로 (replace : 브라우저 히스토리에 저장 x)
    return <Navigate to="/login" replace />;
  }

  // 로그인은 했지만 권한이 없는 경우 -> 메인 페이지로 (replace : 브라우저 히스토리에 저장 x)
  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  // 모든 검사를 통과한 경우 -> 요청된 페이지로
  return <Outlet />;
};

export default ProtectedRoute;
