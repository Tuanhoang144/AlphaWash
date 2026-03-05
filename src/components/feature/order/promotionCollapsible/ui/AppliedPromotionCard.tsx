"use client";
import React from "react";
import { Button, Tooltip, Typography } from "antd";
import { GiftOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { PromotionApiItem } from "@/shared/types/PromotionApiItem";
import { formatDateVN } from "@/shared/utils/formatDate";
import {
  promoTypeLabel,
  promoValueLabel,
} from "@/shared/utils/order/promotion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

export function AppliedPromotionCard({
  value,
  disabled,
  onRemove,
  onOpen,
}: {
  value: PromotionApiItem;
  disabled?: boolean;
  onRemove: () => void;
  onOpen: () => void;
}) {
  return (
    <Collapsible defaultOpen className="space-y-2">
      <Card className="rounded-2xl border bg-white shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="min-w-0 flex-1 gap-1.5 flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <GiftOutlined />
                <span className="min-w-0 truncate">{value.promoName}</span>
              </CardTitle>

              <Tooltip title="Bỏ áp dụng">
                <X className="h-5 w-5" onClick={onRemove} />
              </Tooltip>
            </div>

            <CardDescription className="mt-1 flex items-center justify-between gap-2">
              <span className="truncate font-mono text-xs text-muted-foreground">
                {value.promoCode}
              </span>

              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                Hạn:{" "}
                <span className="ml-1 font-medium text-gray-800">
                  {value.endDate
                    ? formatDateVN(value.endDate)
                    : "Không giới hạn"}
                </span>
              </span>
            </CardDescription>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-2">
            <Separator />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="truncate text-xs text-muted-foreground">
                {promoTypeLabel(value.promoType)}
              </span>

              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {promoValueLabel(value)}
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Bạn đang áp dụng khuyến mãi này cho hóa đơn hiện tại.
              </div>

              <Button
                onClick={onOpen}
                disabled={disabled}
                className="rounded-xl"
              >
                Đổi khuyến mãi
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
