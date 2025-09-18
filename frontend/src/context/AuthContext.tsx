import React, { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

interface User {
  userId: string; // id -> userId 로 변경
  nickname: string; // email -> nickname 으로 변경
  userType: string;
}

interface LoginData extends Omit<User, "email"> {
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (data: LoginData) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const userCookie = Cookies.get("user");
    return userCookie ? JSON.parse(userCookie) : null;
  });

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      setUser(JSON.parse(userCookie));
    }
  }, []);

  const login = (data: LoginData) => {
    const { token, ...userData } = data;
    setUser(userData);
    Cookies.set("user", JSON.stringify(userData), { expires: 7 });
    Cookies.set("token", token, { expires: 7 });
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("user");
    Cookies.remove("token");
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
