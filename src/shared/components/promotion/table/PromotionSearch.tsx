"use client"

import type React from "react"
import { Button, Input, Select } from "antd"
import { SearchOutlined, FilterOutlined, PlusOutlined } from "@ant-design/icons"

interface PromotionSearchProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedPromoType: string
  onPromoTypeChange: (value: string) => void
  onAddNew: () => void
}

const PROMO_TYPE_OPTIONS = [
  { label: "Tất cả loại", value: "ALL" },
  { label: "Giảm tiền / Dịch vụ", value: "SERVICE_AMOUNT" },
  { label: "Giảm % / Dịch vụ", value: "SERVICE_PERCENT" },
  { label: "Giảm tiền / Hóa đơn", value: "BILL_AMOUNT" },
  { label: "Giảm % / Hóa đơn", value: "BILL_PERCENT" },
]

const PromotionSearch: React.FC<PromotionSearchProps> = ({
  searchTerm,
  onSearchChange,
  selectedPromoType,
  onPromoTypeChange,
  onAddNew,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-5 px-6">
      {/* Search Box */}
      <div className="relative flex-1 min-w-[220px] sm:max-w-md">
        <Input
          placeholder="Tìm kiếm tên hoặc mã km..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          size="large"
          allowClear
          className="h-10"
        />
      </div>

      {/* Filter and Action Buttons */}
      <div className="flex items-center gap-2">
        <Select
          value={selectedPromoType}
          onChange={onPromoTypeChange}
          options={PROMO_TYPE_OPTIONS}
          style={{ width: 200 }}
          size="large"
          prefix={<FilterOutlined />}
        />
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={onAddNew}>
          <span className="hidden sm:inline">Thêm mới</span>
        </Button>
      </div>
    </div>
  )
}

export default PromotionSearch
