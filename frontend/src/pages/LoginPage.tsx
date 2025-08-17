import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = (userType: "user" | "seller") => {
    if (authContext) {
      authContext.login({ id: "testuser", userType });
      navigate("/");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <div className="flex gap-4">
        <button
          onClick={() => handleLogin("user")}
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          일반 유저로 로그인
        </button>
        <button
          onClick={() => handleLogin("seller")}
          className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
        >
          판매자로 로그인
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
