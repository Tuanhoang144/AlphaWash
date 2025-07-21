"use client";

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function WelcomePage() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="flex flex-col items-center space-y-8 max-w-md w-full">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-6">
          <Image
            src="/logo.png"
            alt="Alpha Wash Logo"
            width={300}
            height={300}
            className="object-contain"
            priority
          />

          {/* Welcome Text */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Chào mừng đến với Alpha Wash</h1>
            <p className="text-gray-600 text-sm">Hệ thống quản lý rửa xe chuyên nghiệp</p>
          </div>
        </div>

        <Button size="lg" className="w-full max-w-xs h-12 text-base font-medium" onClick={() => router.push("/dashboard")}>
          Đi đến trang làm việc
        </Button>
      </div>
    </div>
  )
}
