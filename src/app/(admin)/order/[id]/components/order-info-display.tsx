"use client"

import { Button } from "@/components/ui/button"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Calendar, Plus, Minus } from "lucide-react"

interface OrderInfoDisplayProps {
  orderDate: string
  checkIn: string
  checkOut: string
}

export default function OrderInfoDisplay({ orderDate, checkIn, checkOut }: OrderInfoDisplayProps) {
  const [isOpen, setIsOpen] = useState(true) // Default to open

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Thông Tin Đơn
          </CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span className="sr-only">{isOpen ? "Thu gọn" : "Mở rộng"}</span>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Ngày đặt</p>
              <div className="p-2 bg-gray-50 rounded-md">{orderDate}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Giờ nhận</p>
                <div className="p-2 bg-gray-50 rounded-md">{checkIn}</div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Giờ trả</p>
                <div className="p-2 bg-gray-50 rounded-md">{checkOut}</div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
