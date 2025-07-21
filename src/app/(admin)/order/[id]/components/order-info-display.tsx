"use client";

import { Button } from "@/components/ui/button";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Calendar, Plus, Minus } from "lucide-react";
import { tool } from "@/utils/tool";

interface OrderInfoDisplayProps {
  orderDate: string;
  checkIn: string;
  checkOut: string;
}

export default function OrderInfoDisplay({
  orderDate,
  checkIn,
  checkOut,
}: OrderInfoDisplayProps) {
  const [isOpen, setIsOpen] = useState(true);

  const { formatDate, formatTime } = tool();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <Card className="border border-gray-200 shadow-sm rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Thông Tin Đơn
          </CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? (
                <Minus className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="sr-only">{isOpen ? "Thu gọn" : "Mở rộng"}</span>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-5 text-gray-900">
            {/* Ngày đặt */}
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-600 font-medium">Ngày đặt</p>
              <div className="text-base font-semibold text-gray-900 bg-gray-50 rounded-md px-3 py-1.5 min-w-[100px] text-center">
                {formatDate(orderDate)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Giờ nhận */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
                <p className="text-sm text-gray-600 font-medium mb-1 md:mb-0">
                  Giờ nhận
                </p>
                <div className="text-center text-base font-semibold text-gray-900 bg-gray-50 rounded-md px-3 py-1.5 min-w-[50px]">
                  {formatTime(checkIn)}
                </div>
              </div>

              {/* Giờ trả */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
                <p className="text-sm text-gray-600 font-medium mb-1 md:mb-0">
                  Giờ trả
                </p>
                <div className="text-center text-base font-semibold text-gray-900 bg-gray-50 rounded-md px-3 py-1.5 min-w-[50px]">
                  {formatTime(checkOut)}
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
