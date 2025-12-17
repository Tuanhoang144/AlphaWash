"use client";
import React from "react";
import { Button, Space, Typography } from "antd";
import { GiftOutlined } from "@ant-design/icons";
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

const { Text } = Typography;

export function EmptyPromotionCard({
  disabled,
  onOpen,
}: {
  disabled?: boolean;
  onOpen: () => void;
}) {
  return (
    <Collapsible className="space-y-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2">
              <GiftOutlined className="h-5 w-5" />
              Khuyến Mãi
            </CardTitle>
            <CardDescription>Chọn chương trình để áp dụng</CardDescription>
          </div>
          <CollapsibleTrigger asChild>
            <Button
              type="primary"
              onClick={onOpen}
              disabled={disabled}
              style={{ borderRadius: 10 }}
            >
              Chọn
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
      </Card>
    </Collapsible>
  );
}
