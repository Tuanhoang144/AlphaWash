"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Banknote, Info, Package } from "lucide-react"

interface PaymentInfo {
  amount: number
  accountNumber: string
  accountName: string
  transferInfo: string
  bankName: string
}

interface QRCodeDisplayComboProps {
  paymentInfo: PaymentInfo
}

const generateQRUrl = (paymentInfo: PaymentInfo): string => {
  const { amount, accountNumber, accountName, transferInfo, bankName } = paymentInfo
  return `https://img.vietqr.io/image/${bankName}-${accountNumber}-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(
    transferInfo,
  )}&accountName=${encodeURIComponent(accountName)}`
}

export default function QRCodeDisplayCombo({ paymentInfo }: QRCodeDisplayComboProps) {
  const qrUrl = generateQRUrl(paymentInfo)

  return (
    <Card className="w-full h-fit border-orange-200">
      <CardHeader className="bg-orange-50">
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <Package className="h-5 w-5" />
          Mã QR Thanh Toán Combo
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-4">
        {paymentInfo.amount > 0 ? (
          <>
            <img
              src={qrUrl || "/placeholder.svg"}
              alt="Mã QR Thanh Toán Combo"
              width={250}
              height={250}
              className="w-full max-w-[250px] h-auto rounded-lg border-2 border-orange-300 shadow-md"
            />
            <div className="mt-4 text-center space-y-2 w-full">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Số tiền:</span>
                <span className="font-bold text-orange-600">{paymentInfo.amount.toLocaleString("vi-VN")} VNĐ</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Ngân hàng:</span>
                <span className="font-semibold">{paymentInfo.bankName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Số tài khoản:</span>
                <span className="font-semibold">{paymentInfo.accountNumber}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Tên tài khoản:</span>
                <span className="font-semibold">{paymentInfo.accountName}</span>
              </div>
              <div className="text-sm text-gray-700 text-left pt-2 border-t mt-2">
                <div className="font-medium flex items-center gap-1 mb-1">
                  <Info className="h-3 w-3" />
                  Nội dung chuyển khoản:
                </div>
                <p className="font-semibold text-orange-700 break-words">{paymentInfo.transferInfo}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 p-4">
            <Banknote className="h-12 w-12 mx-auto mb-4 text-orange-400" />
            <p>Vui lòng chọn gói combo để tính tổng tiền và tạo mã QR.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
