"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { User, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerDTO } from "@/types/OrderResponse";

interface CustomerInfoDisplayProps {
  customer: CustomerDTO | null;
}

export default function CustomerInfoDisplay({
  customer,
}: CustomerInfoDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);

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
          <CardContent className="space-y-4">
            {customer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tên khách hàng */}
                <div className="flex flex-col bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <span className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                    Tên khách hàng
                  </span>
                  <span className="text-base font-semibold text-gray-900">
                    {customer.name}
                  </span>
                </div>

                {/* Số điện thoại */}
                <div className="flex flex-col bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <span className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                    Số điện thoại
                  </span>
                  <span className="text-base text-gray-800">
                    {customer.phone}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-600 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-sm">
                  Hóa đơn này không có thông tin khách hàng.
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
