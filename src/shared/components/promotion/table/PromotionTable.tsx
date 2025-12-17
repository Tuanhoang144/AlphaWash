"use client";

import { useState, useEffect } from "react";
import { Table, Button, Input, Select, Badge, Dropdown } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { usePromotionServices } from "@/shared/services/usePromotionServices";

interface Service {
  serviceCode: string;
  serviceName: string;
  discountAmount: number | null;
  discountPercent: number | null;
}

interface Promotion {
  id: string;
  promoCode: string;
  promoName: string;
  promoType:
    | "SERVICE_AMOUNT"
    | "SERVICE_PERCENT"
    | "BILL_AMOUNT"
    | "BILL_PERCENT";
  value: number | null;
  usageLimit: number;
  startDate: string;
  endDate: string | null;
  description: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  promotionMethod: string;
  campaignLink: string;
  targetAudience: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  services: Service[];
}

const PROMO_TYPE_OPTIONS = [
  { label: "Tất cả loại", value: "ALL" },
  { label: "Giảm tiền / Dịch vụ", value: "SERVICE_AMOUNT" },
  { label: "Giảm % / Dịch vụ", value: "SERVICE_PERCENT" },
  { label: "Giảm tiền / Hóa đơn", value: "BILL_AMOUNT" },
  { label: "Giảm % / Hóa đơn", value: "BILL_PERCENT" },
];

const STATUS_COLORS: Record<
  string,
  "default" | "success" | "processing" | "error" | "warning"
> = {
  ACTIVE: "success",
  INACTIVE: "default",
  EXPIRED: "warning",
};

const PROMO_TYPE_LABELS: Record<string, string> = {
  SERVICE_AMOUNT: "Giảm tiền / Dịch vụ",
  SERVICE_PERCENT: "Giảm % / Dịch vụ",
  BILL_AMOUNT: "Giảm tiền / Hóa đơn",
  BILL_PERCENT: "Giảm % / Hóa đơn",
};

export function PromotionTable() {
  const [searchText, setSearchText] = useState("");
  const [selectedPromoType, setSelectedPromoType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<
    "ALL" | "ACTIVE" | "INACTIVE" | "EXPIRED"
  >("ALL");

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [page, setPage] = useState(1); // antd Table page là 1-based
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  const { loading, getAllPromotion } = usePromotionServices();

  const fetchPromotions = async (p = page, s = size) => {
    const res = await getAllPromotion({
      status: selectedStatus === "ALL" ? undefined : selectedStatus,
      promoType: selectedPromoType === "ALL" ? undefined : selectedPromoType,
      keyword: searchText || undefined,
      page: p - 1,
      size: s,
    });

    // tuỳ backend trả về kiểu page hay list:
    // nếu trả Page: { content, totalElements }
    setPromotions(res?.content ?? res ?? []);
    setTotal(res?.totalElements ?? res?.content?.length ?? res?.length ?? 0);
  };

  useEffect(() => {
    // mỗi lần đổi filter thì về trang 1
    setPage(1);
    fetchPromotions(1, size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, selectedPromoType, selectedStatus]);

  const columns: ColumnsType<Promotion> = [
    {
      title: "Tên Chương trình",
      dataIndex: "promoName",
      key: "promoName",
      width: 200,
      render: (text, record) => (
        <div>
          <div className="font-semibold text-blue-600">{text}</div>
          <div className="text-xs text-gray-500">{record.description}</div>
        </div>
      ),
    },
    {
      title: "Mã Code",
      dataIndex: "promoCode",
      key: "promoCode",
      width: 130,
      render: (text) => (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm">{text}</code>
      ),
    },
    {
      title: "Loại Khuyến mãi",
      dataIndex: "promoType",
      key: "promoType",
      width: 150,
      render: (type) => <span>{PROMO_TYPE_LABELS[type]}</span>,
      filters: PROMO_TYPE_OPTIONS.filter((opt) => opt.value !== "ALL").map(
        (opt) => ({
          text: opt.label,
          value: opt.value,
        })
      ),
      onFilter: (value, record) => record.promoType === value,
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      width: 100,
      render: (value, record) => {
        if (!value) return "-";
        if (record.promoType.includes("PERCENT")) {
          return <span className="font-semibold">{value}%</span>;
        }
        return (
          <span className="font-semibold">
            {value.toLocaleString("vi-VN")}đ
          </span>
        );
      },
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      width: 120,
      render: (date) => {
        if (!date) return <span className="text-gray-500">Không giới hạn</span>;
        return dayjs(date).format("DD/MM/YYYY");
      },
      sorter: (a, b) => {
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: "ACTIVE" | "INACTIVE" | "EXPIRED") => {
        const statusMap = {
          ACTIVE: "Hoạt động",
          INACTIVE: "Không hoạt động",
          EXPIRED: "Hết hạn",
        };
        return (
          <Badge status={STATUS_COLORS[status]} text={statusMap[status]} />
        );
      },
      filters: [
        { text: "Hoạt động", value: "ACTIVE" },
        { text: "Không hoạt động", value: "INACTIVE" },
        { text: "Hết hạn", value: "EXPIRED" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: "view", icon: <EyeOutlined />, label: "Xem chi tiết" },
              { key: "edit", icon: <EditOutlined />, label: "Chỉnh sửa" },
              {
                key: "delete",
                icon: <DeleteOutlined />,
                label: "Xóa",
                danger: true,
              },
            ],
            onClick: (e) => handleAction(e.key, record),
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const handleAction = (key: string, record: Promotion) => {
    console.log(`Action: ${key} on promotion:`, record.promoCode);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-4">
            <Input
              placeholder="Tìm kiếm theo tên hoặc mã km..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              allowClear
            />
          </div>
          <div className="md:col-span-4">
            <Select
              value={selectedPromoType}
              onChange={setSelectedPromoType}
              options={PROMO_TYPE_OPTIONS}
              size="large"
              style={{ width: "100%" }}
            />
          </div>
          <div className="md:col-span-2">
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={[
                { label: "Tất cả trạng thái", value: "ALL" },
                { label: "Hoạt động", value: "ACTIVE" },
                { label: "Không hoạt động", value: "INACTIVE" },
                { label: "Hết hạn", value: "EXPIRED" },
              ]}
              size="large"
              style={{ width: "100%" }}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              Thêm Khuyến mãi
            </Button>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={promotions}
        rowKey="id"
        size="large"
        scroll={{ x: 1200 }}
        loading={loading}
        pagination={{
          current: page,
          pageSize: size,
          total,
          showSizeChanger: true,
          showTotal: (t) => `Tổng cộng ${t} chương trình khuyến mãi`,
          locale: { items_per_page: "/ trang" },
          onChange: (nextPage, nextSize) => {
            setPage(nextPage);
            setSize(nextSize);
            fetchPromotions(nextPage, nextSize);
          },
        }}
        bordered
      />
    </div>
  );
}
