"use client";

import React, { useEffect, useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { Badge, Dropdown, Space, Table } from "antd";
import { OrderDTO, OrderDetailDTO } from "@/types/OrderResponse";
import { useOrderManager } from "@/services/useOrderManager";

interface ExpandedDataType {
  employeeName: string[];
  licensePlate: string;
  brandName: string;
  modelName: string;
  size: string;
  imageUrl: string;
  serviceName: string;
  price: number;
  status: string;
  noteDetail: string | null;
}

const items = [
  { key: "1", label: "Action 1" },
  { key: "2", label: "Action 2" },
];

const columns: TableColumnsType<OrderDTO> = [
  { title: "Ngày", dataIndex: "orderDate", key: "orderDate" },
  { title: "Thời gian vào", dataIndex: "checkIn", key: "checkIn" },
  { title: "Thời gian ra", dataIndex: "checkOut", key: "checkOut" },
  { title: "Trạng thái thanh toán", dataIndex: "paymentStatus", key: "paymentStatus" },
  { title: "Tổng giá", dataIndex: "totalPrice", key: "totalPrice" },
  { title: "Ghi chú", dataIndex: "note", key: "note" },
  {
    title: "Tên khách hàng",
    dataIndex: ["customer", "customerName"],
    key: "customerName",
  },
  {
    title: "Điện thoại",
    dataIndex: ["customer", "phone"],
    key: "phone",
  },
  {
    title: "Action",
    key: "operation",
    render: () => <a>Publish</a>,
  },
];

const expandColumns: TableColumnsType<ExpandedDataType> = [
  {
    title: "Nhân viên thi công",
    dataIndex: "employeeName",
    key: "employeeName",
    render: (names: string[]) => names.join(", "),
  },
  { title: "Biển số", dataIndex: "licensePlate", key: "licensePlate" },
  { title: "Brand Name", dataIndex: "brandName", key: "brandName" },
  { title: "Model Name", dataIndex: "modelName", key: "modelName" },
  { title: "Size", dataIndex: "size", key: "size" },
  {
    title: "Image",
    dataIndex: "imageUrl",
    key: "imageUrl",
    render: (text) => (
      <img src={text} alt="Vehicle" style={{ width: 50, height: 50 }} />
    ),
  },
  { title: "Service Name", dataIndex: "serviceName", key: "serviceName" },
  { title: "Price", dataIndex: "price", key: "price" },
  { title: "Status", dataIndex: "status", key: "status" },
  {
    title: "Note",
    dataIndex: "noteDetail",
    key: "noteDetail",
  },
  {
    title: "Action",
    key: "operation",
    render: () => (
      <Space size="middle">
        <a>Pause</a>
        <a>Stop</a>
        <Dropdown menu={{ items }}>
          <a>
            More <DownOutlined />
          </a>
        </Dropdown>
      </Space>
    ),
  },
];

// 👇 Hàm chuyển từng OrderDetailDTO[] → ExpandedDataType[]
const convertDetailToExpandedData = (
  details: OrderDetailDTO[]
): ExpandedDataType[] => {
  return details.map((detail) => ({
    employeeName: detail.employee.map((emp) => emp.employeeName), // mảng trong 1 dòng
    licensePlate: detail.vehicle.licensePlate,
    brandName: detail.vehicle.brandName,
    modelName: detail.vehicle.modelName,
    size: detail.vehicle.size,
    imageUrl: detail.vehicle.imageUrl,
    serviceName: detail.service.serviceName,
    price: detail.service.serviceCatalog.price,
    status: detail.status,
    noteDetail: detail.note,
  }));
};

export default function MyTable() {
  const { getAllOrders } = useOrderManager();
  const [data, setData] = useState<OrderDTO[]>([]);

  const fetchData = async () => {
    try {
      const result: OrderDTO[] = await getAllOrders();
      setData(result);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Table<OrderDTO>
      columns={columns}
      expandable={{
        expandedRowRender: (record) => (
          <Table<ExpandedDataType>
            columns={expandColumns}
            dataSource={convertDetailToExpandedData(record.orderDetails)}
            pagination={false}
          />
        ),
      }}
      rowKey={(record) => record.id}
      dataSource={data}
      size="middle"
    />
  );
}
