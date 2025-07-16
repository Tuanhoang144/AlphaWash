import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="flex flex-col items-center space-y-8 max-w-md w-full">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-6">
          <Image
            src="/logo.jpg"
            alt="Alpha Wash Logo"
            width={200}
            height={200}
            className="w-48 h-48 object-contain"
            priority
          />

          {/* Welcome Text */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Chào mừng đến với Alpha Wash</h1>
            <p className="text-gray-600 text-sm">Hệ thống quản lý rửa xe chuyên nghiệp</p>
          </div>
        </div>

        {/* Action Button */}
        <Button asChild size="lg" className="w-full max-w-xs h-12 text-base font-medium">
          <Link href="/dashboard">Đi đến trang làm việc</Link>
        </Button>
      </div>
    </div>
  )
}
