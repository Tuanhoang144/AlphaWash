// app/invoice/[id]/print/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useOrderManager } from "@/services/useOrderManager";
import { mapRawApiToOrderDTO } from "../utils/mapper";

export default function InvoicePrintPage({ params }: { params: { id: string } }) {
  const { getOrderById } = useOrderManager();
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      const data = await getOrderById(params.id);
      setOrderData(mapRawApiToOrderDTO(data));
    };
    fetchOrderData();
  }, [params.id]);

  useEffect(() => {
    if (orderData) {
      setTimeout(() => {
        window.print();
      }, 1000); // Chờ render xong mới in
    }
  }, [orderData]);

  if (!orderData) return <div>Đang tải hóa đơn...</div>;

  return (
    <div className="p-6 text-black bg-white print:bg-white max-w-[800px] mx-auto text-sm leading-relaxed">
      <h1 className="text-center text-xl font-bold mb-4">HÓA ĐƠN DỊCH VỤ</h1>

      <p><strong>Khách hàng:</strong> {orderData.customer?.name || "N/A"}</p>
      <p><strong>SĐT:</strong> {orderData.customer?.phone}</p>
      <p><strong>Biển số xe:</strong> {orderData.orderDetails?.[0]?.vehicle.licensePlate}</p>
      <p><strong>Thời gian:</strong> {orderData.orderDate}</p>

      <hr className="my-4" />

      <table className="w-full border text-left border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-1">Dịch vụ</th>
            <th className="border px-2 py-1">Giá</th>
          </tr>
        </thead>
        <tbody>
          {orderData.orderDetails?.map((detail: any, i: number) => (
            <tr key={i}>
              <td className="border px-2 py-1">{detail.serviceCatalog?.name}</td>
              <td className="border px-2 py-1">{detail.serviceCatalog?.price?.toLocaleString("vi-VN")}đ</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right mt-4">
        <p><strong>Tổng cộng:</strong> {orderData.totalPrice.toLocaleString("vi-VN")} VNĐ</p>
        <p><strong>VAT:</strong> {orderData.vat || 0}%</p>
        <p><strong>Giảm giá:</strong> {orderData.discount?.toLocaleString("vi-VN") || 0}đ</p>
        <p><strong>Tiền tip:</strong> {orderData.tip?.toLocaleString("vi-VN") || 0}đ</p>
      </div>

      <p className="mt-8 text-center italic">Cảm ơn quý khách đã sử dụng dịch vụ!</p>
    </div>
  );
}
