"use client";

import { Badge } from "@/components/ui/badge";
import type { QuoteStatus } from "@/types/Quote";

const CONFIG: Record<QuoteStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  DRAFT: { label: "Nháp", variant: "secondary" },
  SENT: { label: "Đã gửi", variant: "default" },
  ACCEPTED: { label: "Chấp nhận", variant: "default" },
  REJECTED: { label: "Từ chối", variant: "destructive" },
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const { label, variant } = CONFIG[status] ?? CONFIG.DRAFT;
  const extra =
    status === "ACCEPTED"
      ? "bg-emerald-600 hover:bg-emerald-700"
      : status === "SENT"
      ? "bg-blue-600 hover:bg-blue-700"
      : "";
  return (
    <Badge variant={variant} className={extra}>
      {label}
    </Badge>
  );
}
