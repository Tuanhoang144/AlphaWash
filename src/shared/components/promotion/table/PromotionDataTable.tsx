"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Table, Button, Tooltip, Dropdown, Badge } from "antd"
import type { ColumnsType } from "antd/es/table"
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react"
import dayjs from "dayjs"
import { Promotion } from "@/shared/types/Promotion"

interface PromotionDataTableProps {
  data: Promotion[]
  loading?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "success",
  INACTIVE: "default",
  EXPIRED: "warning",
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Không hoạt động",
  EXPIRED: "Hết hạn",
}

const PROMO_TYPE_LABELS: Record<string, string> = {
  SERVICE_AMOUNT: "Giảm tiền / Dịch vụ",
  SERVICE_PERCENT: "Giảm % / Dịch vụ",
  BILL_AMOUNT: "Giảm tiền / Hóa đơn",
  BILL_PERCENT: "Giảm % / Hóa đơn",
}

const PromotionDataTable: React.FC<PromotionDataTableProps> = ({ data, loading = false }) => {
  const [scrollY, setScrollY] = useState("55vh")

  useEffect(() => {
    const updateScrollHeight = () => {
      const { innerHeight } = window

      if (innerHeight >= 1200) {
        setScrollY("70vh")
      } else if (innerHeight >= 900) {
        setScrollY("65vh")
      } else if (innerHeight >= 700) {
        setScrollY("55vh")
      } else {
        setScrollY("50vh")
      }
    }

    updateScrollHeight()

    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateScrollHeight, 200)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  const columns: ColumnsType<Promotion> = [
    {
      title: "Tên Chương trình",
      dataIndex: "promoName",
      key: "promoName",
      width: 200,
      fixed: "left",
      render: (text, record) => (
        <div>
          <div className="font-semibold text-blue-600 line-clamp-1">{text}</div>
          <div className="text-xs text-gray-500 line-clamp-1 mt-1">{record.description}</div>
        </div>
      ),
    },
    {
      title: "Mã Code",
      dataIndex: "promoCode",
      key: "promoCode",
      width: 130,
      render: (text) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{text}</code>,
    },
    {
      title: "Loại Khuyến mãi",
      dataIndex: "promoType",
      key: "promoType",
      width: 150,
      render: (type) => <span>{PROMO_TYPE_LABELS[type] || type}</span>,
      filters: [
        { text: "Giảm tiền / Dịch vụ", value: "SERVICE_AMOUNT" },
        { text: "Giảm % / Dịch vụ", value: "SERVICE_PERCENT" },
        { text: "Giảm tiền / Hóa đơn", value: "BILL_AMOUNT" },
        { text: "Giảm % / Hóa đơn", value: "BILL_PERCENT" },
      ],
      onFilter: (value, record) => record.promoType === value,
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      width: 110,
      align: "right",
      render: (value, record) => {
        if (!value) return <span className="text-gray-400">-</span>
        if (record.promoType.includes("PERCENT")) {
          return <span className="font-semibold text-green-600">{value}%</span>
        }
        return <span className="font-semibold text-green-600">{value.toLocaleString("vi-VN")}đ</span>
      },
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      width: 120,
      render: (date) => <div className="text-sm font-medium">{dayjs(date).format("DD/MM/YYYY")}</div>,
      sorter: (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      width: 120,
      render: (date) => {
        if (!date) return <span className="text-gray-500 text-sm">Không giới hạn</span>
        return <div className="text-sm font-medium">{dayjs(date).format("DD/MM/YYYY")}</div>
      },
      sorter: (a, b) => {
        if (!a.endDate) return 1
        if (!b.endDate) return -1
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      align: "center",
      render: (status) => <Badge status={STATUS_COLORS[status] as any} text={STATUS_LABELS[status]} />,
      filters: [
        { text: "Hoạt động", value: "ACTIVE" },
        { text: "Không hoạt động", value: "INACTIVE" },
        { text: "Hết hạn", value: "EXPIRED" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Dịch vụ áp dụng",
      key: "services",
      width: 150,
      responsive: ["lg"],
      render: (_, record) => {
        if (!record.services || record.services.length === 0) {
          return <span className="text-gray-500 text-sm">Tất cả dịch vụ</span>
        }
        return (
          <Tooltip
            title={
              <div className="max-h-60 overflow-y-auto">
                {record.services.map((service, idx) => (
                  <div key={idx} className="text-xs mb-1">
                    • {service.serviceName}
                  </div>
                ))}
              </div>
            }
          >
            <span className="text-blue-600 font-medium cursor-help">{record.services.length} dịch vụ</span>
          </Tooltip>
        )
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 80,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "view",
                icon: <Eye className="h-4 w-4" />,
                label: "Xem chi tiết",
              },
              {
                key: "edit",
                icon: <Edit className="h-4 w-4" />,
                label: "Chỉnh sửa",
              },
              {
                key: "delete",
                icon: <Trash2 className="h-4 w-4" />,
                label: "Xóa",
                danger: true,
              },
            ],
            onClick: (e) => handleAction(e.key, record),
          }}
          trigger={["click"]}
        >
          <Button type="text" size="small" icon={<MoreHorizontal className="h-4 w-4" />} />
        </Dropdown>
      ),
    },
  ]

  const handleAction = (key: string, record: Promotion) => {
    console.log(`Action: ${key} on promotion:`, record.promoCode)
  }

  return (
    <div className="w-full pt-5 px-6">
      <div className="rounded-lg border bg-white shadow-sm">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: "max-content", y: scrollY, scrollToFirstRowOnChange: true }}
          pagination={{
            pageSize: 10,
            total: data.length,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} chương trình khuyến mãi`,
            locale: { items_per_page: "/ trang" },
          }}
          size="middle"
          locale={{
            emptyText: (
              <div className="flex flex-col items-center gap-4 py-12">
                <div className="text-gray-400 text-5xl">📋</div>
                <p className="text-lg text-gray-600">Không tìm thấy chương trình khuyến mãi nào</p>
              </div>
            ),
          }}
        />
      </div>
    </div>
  )
}

export default PromotionDataTable
