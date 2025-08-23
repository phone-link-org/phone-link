import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const MyPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const navigate = useNavigate();

  useEffect(() => {
    // AuthProvider가 로드되고 user 상태가 확정된 후, 비로그인 상태라면 리다이렉트
    if (authContext !== null && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate, authContext]);

  // 리다이렉션이 실행되기 전에 컴포넌트 내용이 잠시 보이는 것을 방지
  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-lg p-8 space-y-6 rounded-lg shadow-md bg-white dark:bg-[#292929]">
        <h1 className="text-3xl font-bold text-center text-primary-light dark:text-primary-dark">
          마이페이지
        </h1>
        <div className="space-y-4 text-center">
          <p className="text-lg">
            안녕하세요, <span className="font-semibold">{user.nickname}</span>
            님!
          </p>
          <p className="text-md text-gray-600 dark:text-gray-400">
            회원님은{" "}
            <span className="font-semibold">
              {user.userType === "seller"
                ? "판매자"
                : user.userType === "admin"
                  ? "관리자"
                  : "일반 사용자"}
            </span>
            입니다.
          </p>
          {/* 추가적인 마이페이지 컨텐츠 */}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
