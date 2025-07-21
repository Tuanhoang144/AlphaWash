"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { tool } from "@/utils/tool";

interface OrderInfoFormProps {
  orderDate: string;
  checkIn: string;
  checkOut: string;
  onOrderInfoChange: (field: string, value: string) => void;
}

export default function OrderInfoForm({
  orderDate,
  checkIn,
  checkOut,
  onOrderInfoChange,
}: OrderInfoFormProps) {
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const { formatDate } = tool();

  console.log("Order Info Form Rendered", {
    orderDate,
    checkIn,
    checkOut,
  });

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
        {/* Ngày đặt */}
        <div className="space-y-2">
          <Label htmlFor="orderDate">Ngày đặt</Label>
          <Input
            id="orderDate"
            type="date"
            value={orderDate ? orderDate.slice(0, 10) : ""}
            onChange={(e) => onOrderInfoChange("orderDate", e.target.value)}
            className="w-full"
          />
        </div>

        {/* Giờ nhận và Giờ trả */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Giờ nhận */}
          <div className="space-y-2">
            <Label htmlFor="checkIn">Giờ nhận</Label>
            <div className="flex gap-2">
              <Input
                id="checkIn"
                type="time"
                value={checkIn}
                onChange={(e) => onOrderInfoChange("checkIn", e.target.value)}
                className="w-full"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onOrderInfoChange("checkIn", getCurrentTime())}
              >
                <Clock className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Giờ trả */}
          <div className="space-y-2">
            <Label htmlFor="checkOut">Giờ trả</Label>
            <div className="flex gap-2">
              <Input
                id="checkOut"
                type="time"
                value={checkOut}
                onChange={(e) => onOrderInfoChange("checkOut", e.target.value)}
                className="w-full"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onOrderInfoChange("checkOut", getCurrentTime())}
              >
                <Clock className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
