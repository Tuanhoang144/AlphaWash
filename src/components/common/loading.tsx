import { Car, Sparkles } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="text-center space-y-8 max-w-md mx-auto">
        {/* Logo và tên thương hiệu */}
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center justify-center space-x-3">
              <div className="relative">
                <Car className="h-12 w-12 text-black" />
                <Sparkles className="h-6 w-6 text-gray-600 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-black tracking-tight">Alpha Wash</h1>
            <p className="text-lg text-gray-700 font-medium">Chăm xe đẹp đến từng centimet</p>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-gray-500 rounded-full animate-spin"
                style={{ animationDelay: "0.15s" }}
              ></div>
            </div>
          </div>

          <p className="text-sm text-gray-600 animate-pulse">Đang tải...</p>
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center space-x-2 opacity-60">
          <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>

        {/* Thêm một số hiệu ứng trang trí */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-gray-300 rounded-full animate-ping opacity-20"></div>
          <div
            className="absolute top-3/4 right-1/4 w-1 h-1 bg-gray-400 rounded-full animate-ping opacity-30"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/6 w-0.5 h-0.5 bg-gray-300 rounded-full animate-ping opacity-25"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
      </div>
    </div>
  )
}
