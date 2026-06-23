"use client";

import { useState } from "react";
import Image from "next/image";
import { addToast } from "@heroui/react";
import { Eye, EyeOff, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAuthManager } from "@/services/useAuthManager";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login: loginApi, loading } = useAuthManager();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      addToast({
        title: "Vui lòng nhập đầy đủ thông tin",
        color: "warning",
      });
      return;
    }
    try {
      const response = await loginApi({ username, password });
      login(
        response.token,
        { username: response.username, role: response.role },
        response.expiresIn
      );
      addToast({ title: "Đăng nhập thành công", color: "success" });
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get("from") || "/statistics";
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        "Tên đăng nhập hoặc mật khẩu không đúng";
      addToast({ title: "Đăng nhập thất bại", description: msg, color: "danger" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="Shine Autowerkz"
            width={180}
            height={180}
            className="object-contain"
            priority
          />
          <p className="text-gray-500 text-sm mt-1">
            Hệ thống quản lý rửa xe chuyên nghiệp
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">
              Đăng nhập
            </CardTitle>
            <CardDescription className="text-center">
              Nhập thông tin tài khoản để tiếp tục
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    className="pl-9"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    className="pl-9 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium mt-2"
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Shine Autowerkz. All rights reserved.
        </p>
      </div>
    </div>
  );
}
