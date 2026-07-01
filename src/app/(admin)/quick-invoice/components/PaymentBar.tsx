"use client";

import React from "react";
import { Banknote, Building, CreditCard, Clock } from "lucide-react";

interface PaymentBarProps {
  paymentMethod: string;
  onSetPaymentMethod: (method: string) => void;
}

const METHODS = [
  { value: "Cash", label: "Tiền mặt", icon: Banknote },
  { value: "Transfer", label: "Chuyển khoản", icon: Building },
  { value: "Card", label: "Thẻ", icon: CreditCard },
  { value: "Unpaid", label: "Chưa TT", icon: Clock },
];

function PaymentBarComponent({ paymentMethod, onSetPaymentMethod }: PaymentBarProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-muted-foreground">Thanh toán</div>
      <div className="grid grid-cols-4 gap-2">
        {METHODS.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.value}
              onClick={() => onSetPaymentMethod(m.value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-colors ${
                paymentMethod === m.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const PaymentBar = React.memo(PaymentBarComponent);
export default PaymentBar;
