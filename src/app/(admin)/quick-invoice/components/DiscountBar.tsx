"use client";

import React, { useState } from "react";

interface DiscountBarProps {
  discount: number;
  onSetDiscount: (value: number) => void;
}

const PRESETS = [0, 5, 10, 15];

function DiscountBarComponent({ discount, onSetDiscount }: DiscountBarProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const isCustom = !PRESETS.includes(discount) && discount > 0;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-muted-foreground">Giảm giá</div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => {
              onSetDiscount(p);
              setShowCustom(false);
            }}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              discount === p && !isCustom
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {p}%
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isCustom
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {isCustom ? `${discount}%` : "Tùy chỉnh"}
        </button>
      </div>
      {showCustom && (
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            max={100}
            placeholder="Nhập %"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            className="w-24 h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => {
              const val = Math.min(100, Math.max(0, parseInt(customValue) || 0));
              onSetDiscount(val);
              setShowCustom(false);
              setCustomValue("");
            }}
            className="px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            Áp dụng
          </button>
        </div>
      )}
    </div>
  );
}

const DiscountBar = React.memo(DiscountBarComponent);
export default DiscountBar;
