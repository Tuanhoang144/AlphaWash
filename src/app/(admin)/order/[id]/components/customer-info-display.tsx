"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { User, Plus, Minus } from "lucide-react"
import type { Customer } from "../types/invoice"
import { Button } from "@/components/ui/button"

interface CustomerInfoDisplayProps {
  customer: Customer | null
}

export default function CustomerInfoDisplay({ customer }: CustomerInfoDisplayProps) {
  const [isOpen, setIsOpen] = useState(false) 

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông Tin Khách Hàng
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
            {customer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Tên khách hàng</p>
                  <div className="p-2 bg-gray-50 rounded-md font-semibold">{customer.customerName}</div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
                  <div className="p-2 bg-gray-50 rounded-md">{customer.phone}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                <p className="text-sm">Hóa đơn này không có thông tin khách hàng.</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
