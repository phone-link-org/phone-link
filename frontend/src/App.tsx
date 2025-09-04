import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { useContext, useEffect, useRef } from "react";
import { ThemeContext } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import OfferPage from "./pages/OfferPage";
import NotFound from "./pages/NotFound";
import MainPage from "./pages/MainPage";
import CommunityPage from "./pages/CommunityPage";
import StorePage from "./pages/StorePage";
import StoreRegisterPage from "./pages/StoreRegisterPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyPage from "./pages/MyPage";
import SsoCallbackPage from "./pages/SsoCallbackPage";
import AdminPage from "./pages/AdminPage";

import { useAuthStore } from "./store/authStore";

function App() {
  const { checkAuthStatus, isLoading } = useAuthStore();
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme || "light";

  const isInitialized = useRef(false);

  // App 컴포넌트가 처음 마운트될 때 checkAuthStatus를 실행
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      checkAuthStatus();
    }
  }, [checkAuthStatus]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <h2>앱을 준비 중입니다...</h2>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/offer" element={<OfferPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/auth/callback/:provider" element={<SsoCallbackPage />} />

        {/* 로그인 필수 페이지 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/store/register" element={<StoreRegisterPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-center" duration={3000} richColors theme={theme} />
    </div>
  );
}

export default App;
