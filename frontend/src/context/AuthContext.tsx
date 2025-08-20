import { createContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

interface User {
  id: string;
  userType: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      setUser(JSON.parse(userCookie));
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    Cookies.set("user", JSON.stringify(userData), { expires: 7 }); // 7일 동안 쿠키 저장
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
