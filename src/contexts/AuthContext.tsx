"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { UserInfo } from "@/types/Auth";

interface AuthContextType {
  user: UserInfo | null;
  login: (token: string, userInfo: UserInfo, expiresIn?: number) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("jwtToken");
    const stored = localStorage.getItem("userInfo");
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("userInfo");
      }
    }
  }, []);

  const login = (
    token: string,
    userInfo: UserInfo,
    expiresIn?: number
  ) => {
    const days = expiresIn ? expiresIn / 86400000 : 1;
    Cookies.set("jwtToken", token, { expires: days });
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    setUser(userInfo);
  };

  const logout = () => {
    Cookies.remove("jwtToken");
    localStorage.removeItem("userInfo");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
