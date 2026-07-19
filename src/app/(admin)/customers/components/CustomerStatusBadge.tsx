"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CustomerStatus } from "@/types/Customer";
import { CUSTOMER_STATUS_LABELS } from "@/types/Customer";

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent font-medium",
        status === "ACTIVE"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
          : "bg-muted text-muted-foreground"
      )}
    >
      {CUSTOMER_STATUS_LABELS[status]}
    </Badge>
  );
}
