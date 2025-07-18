"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface OrderInfoFormProps {
  orderDate: string
  checkIn: string
  checkOut: string
  onOrderInfoChange: (field: string, value: string) => void
}

export default function OrderInfoForm({ orderDate, checkIn, checkOut, onOrderInfoChange }: OrderInfoFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Thông Tin Đơn
        </CardTitle>
        <CardDescription>Thời gian và ngày tháng</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orderDate">Ngày đặt</Label>
          <Input
            id="orderDate"
            type="date"
            value={orderDate}
            onChange={(e) => onOrderInfoChange("orderDate", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="checkIn">Giờ nhận</Label>
            <Input
              id="checkIn"
              type="time"
              value={checkIn}
              onChange={(e) => onOrderInfoChange("checkIn", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkOut">Giờ trả</Label>
            <Input
              id="checkOut"
              type="time"
              value={checkOut}
              onChange={(e) => onOrderInfoChange("checkOut", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
