import { Routes, Route } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { Toaster } from "sonner";
import { useContext, useEffect, useRef } from "react";
import { ThemeContext } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import OfferPage from "./pages/OfferPage";
import OfferDetailPage from "./pages/OfferDetailPage";
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
import { ROLES } from "../../shared/constants";

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
        <ClipLoader
          size={48}
          color={theme === "light" ? "#4F7942" : "#9DC183"}
          loading={true}
          className="animate-pulse"
        />
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback/:provider" element={<SsoCallbackPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/offer" element={<OfferPage />} />
        <Route path="/store/:storeId" element={<StorePage />} />
        <Route path="/offer/:id" element={<OfferDetailPage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/community" element={<CommunityPage />} />

        {/* role 상관없이 로그인만 체크 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/mypage" element={<MyPage />} />
        </Route>

        {/* SELLER */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.SELLER]} />}>
          <Route path="/store/register" element={<StoreRegisterPage />} />
        </Route>

        {/* ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster
        position="top-center"
        duration={3000}
        richColors
        theme={theme}
        toastOptions={{
          style: { background: theme === "dark" ? "#292929" : "white" },
        }}
      />
    </div>
  );
}

export default App;
