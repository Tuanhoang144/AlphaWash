"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import QRCodeDisplay from "./qr-code-display";

const InvoiceTemplate = ({ order }: { order: any }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Hóa đơn</title></head><body>${content}</body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const service = order.orderDetails[0].service;
  const vehicle = order.orderDetails[0].vehicle;

  const calcTotal = () => {
    let base = order.totalPrice;
    let vat = (order.vat / 100) * base;
    let discount = (order.discount / 100) * base;
    return base + vat - discount + order.tip;
  };

  const paymentInfo = {
    amount: Math.floor(calcTotal()),
    accountNumber: "123456789",
    accountName: "CTY TNHH ABC",
    bankName: "vcb",
    transferInfo: `Thanh toan hoa don cho xe ${vehicle.modelName} - ${vehicle.licensePlate}`,
  };

  return (
    <div className="p-6">
      <div ref={printRef} className="bg-white p-6 shadow-md rounded max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <img src="/logo.png" alt="Logo" className="w-24" />
            <p className="text-sm mt-1">
              <strong>CỬA HÀNG RỬA XE ABC</strong><br />
              Địa chỉ: 123 Lê Văn Việt, Thủ Đức, TP.HCM<br />
              SĐT: 0909 999 888
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">HÓA ĐƠN DỊCH VỤ</h2>
            <p className="text-sm">Ngày: {new Date(order.orderDate).toLocaleDateString("vi-VN")}</p>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Customer Info */}
        <div className="mb-4 text-sm">
          <p><strong>Khách hàng:</strong> {order.customer.customerName}</p>
          <p><strong>SĐT:</strong> {order.customer.phone}</p>
          <p><strong>Xe:</strong> {vehicle.brandName} {vehicle.modelName} - {vehicle.licensePlate}</p>
        </div>

        {/* Service Info */}
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Dịch vụ</th>
              <th className="p-2 text-right">Giá</th>
              <th className="p-2 text-left">Kích cỡ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">{service.serviceName}</td>
              <td className="p-2 text-right">{order.orderDetails[0].serviceCatalog.price.toLocaleString()}đ</td>
              <td className="p-2">{order.orderDetails[0].serviceCatalog.size}</td>
            </tr>
          </tbody>
        </table>

        {/* Tổng hợp */}
        <div className="text-sm mt-4 space-y-1">
          <p><strong>Tạm tính:</strong> {order.totalPrice.toLocaleString()}đ</p>
          <p><strong>VAT ({order.vat}%):</strong> {(order.vat / 100 * order.totalPrice).toLocaleString()}đ</p>
          <p><strong>Giảm giá ({order.discount}%):</strong> {((order.discount / 100) * order.totalPrice).toLocaleString()}đ</p>
          <p><strong>Tiền tip:</strong> {order.tip.toLocaleString()}đ</p>
          <Separator />
          <p className="font-bold text-lg"><strong>Tổng thanh toán:</strong> {calcTotal().toLocaleString()}đ</p>
          <p><strong>Thanh toán bằng:</strong> {order.paymentType}</p>
        </div>

        {/* Mã QR thanh toán */}
        <div className="mt-4">
          <QRCodeDisplay paymentInfo={paymentInfo} />
        </div>
      </div>

      <div className="mt-4 text-right">
        <Button onClick={handlePrint}>In hóa đơn</Button>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
