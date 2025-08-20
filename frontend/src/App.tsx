import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { useContext } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeContext } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import OfferPage from "./pages/OfferPage";
import NotFound from "./pages/NotFound";
import MainPage from "./pages/MainPage";
import CommunityPage from "./pages/CommunityPage";
import PriceInputOfferPage from "./pages/PriceInputPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyPage from "./pages/MyPage";

function App() {
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme || "light";

  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/offer" element={<OfferPage />} />
          <Route path="/price-input" element={<PriceInputOfferPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster
          position="top-center"
          duration={3000}
          richColors
          theme={theme}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
