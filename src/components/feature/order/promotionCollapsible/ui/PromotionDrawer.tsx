"use client";
import React from "react";
import { Button, Drawer, Empty, Input, List, Segmented, Space, Tag, Typography } from "antd";
import { GiftOutlined, SearchOutlined, CloseCircleOutlined, CheckCircleFilled, InfoCircleOutlined } from "@ant-design/icons";
import { PromotionApiItem } from "@/shared/types/PromotionApiItem";
import { formatDateVN } from "@/shared/utils/formatDate";
import { promoTypeLabel, promoValueLabel } from "@/shared/utils/order/promotion";

const { Text } = Typography;

export function PromotionDrawer({
  open,
  q,
  mode,
  setQ,
  setMode,
  usableCount,
  unusableCount,
  list,
  selectedId,
  onClose,
  onSelect,
}: {
  open: boolean;
  q: string;
  mode: "usable" | "unusable";
  setQ: (v: string) => void;
  setMode: (v: "usable" | "unusable") => void;
  usableCount: number;
  unusableCount: number;
  list: PromotionApiItem[];
  selectedId?: string;
  onClose: () => void;
  onSelect: (p: PromotionApiItem) => void;
}) {
    
  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      height="80vh"
      closeIcon={false}
      title={
        <div className="flex items-center justify-between">
          <Space>
            <GiftOutlined />
            <div className="flex flex-col gap-1" style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Chọn khuyến mãi</div>
              <div style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>
                {mode === "usable" ? "Các mã có thể áp dụng" : "Các mã bị chặn theo điều kiện"}
              </div>
            </div>
          </Space>
          <Button type="text" icon={<CloseCircleOutlined />} onClick={onClose} />
        </div>
      }
      styles={{ header: { paddingBottom: 10 }, body: { paddingTop: 10 } }}
    >
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Input
          allowClear
          value={q}
          onChange={(e) => setQ(e.target.value)}
          prefix={<SearchOutlined />}
          placeholder="Tìm theo mã hoặc tên..."
          style={{ borderRadius: 12, height: 40 }}
        />

        <Segmented
          value={mode}
          onChange={(v) => setMode(v as any)}
          options={[
            { label: `Dùng được (${usableCount})`, value: "usable" },
            { label: `Không dùng (${unusableCount})`, value: "unusable" },
          ]}
          style={{ width: "100%" }}
        />

        {list.length === 0 ? (
          <Empty description={mode === "usable" ? "Không có khuyến mãi dùng được" : "Không có khuyến mãi bị chặn"} />
        ) : (
          <List
            dataSource={list}
            renderItem={(p) => {
              const selected = selectedId === p.promoId;
              const disabledItem = !p.usable;

              return (
                <List.Item
                  key={p.promoId}
                  className="!p-0 !border-0"
                  style={{ marginBottom: 10 }}
                >
                  <div
                    className={[
                      "w-full border rounded-2xl p-3",
                      selected ? "bg-green-50" : "bg-white",
                      disabledItem ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                    ].join(" ")}
                    onClick={() => {
                      if (disabledItem) return;
                      onSelect(p);
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Text strong style={{ fontSize: 14 }}>{p.promoName}</Text>
                          {selected && (
                            <Tag color="green" icon={<CheckCircleFilled />}>Đang chọn</Tag>
                          )}
                        </div>

                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {p.promoCode}
                        </Text>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                            {promoTypeLabel(p.promoType)}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-600">
                            {promoValueLabel(p)}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs bg-gray-50 text-gray-500">
                            HSD {p.endDate ? formatDateVN(p.endDate) : "Không giới hạn"}
                          </span>
                        </div>

                        {!p.usable && p.reason && (
                          <div style={{ fontSize: 12, color: "#cf1322", marginTop: 6 }}>
                            <InfoCircleOutlined /> Lý do: {p.reason}
                          </div>
                        )}
                      </div>

                      <Button
                        type={disabledItem ? "default" : selected ? "default" : "primary"}
                        disabled={disabledItem}
                        style={{ borderRadius: 12, height: 36 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (disabledItem) return;
                          onSelect(p);
                        }}
                      >
                        {disabledItem ? "Không áp dụng" : selected ? "Đã chọn" : "Áp dụng"}
                      </Button>
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        )}

        <div className="text-center text-xs text-gray-500 pt-1">
          Chỉ hiển thị các khuyến mãi theo điều kiện của đơn hàng hiện tại.
        </div>
      </Space>
    </Drawer>
  );
}
