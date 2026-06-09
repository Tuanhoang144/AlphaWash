"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import type { OrderResponseDTO } from "@/types/OrderResponse";
import { tool } from "@/utils/tool";
import { calculateDiscountFromOrder, calculateVatFromOrder } from "@/shared/utils/order/calculatePrice";

type InvoiceTemplateProps = {
  order: OrderResponseDTO;
  baseServicePrice: number;
};

const InvoiceTemplate = ({ order, baseServicePrice }: InvoiceTemplateProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { formatTime } = tool();

  // Get all vehicles from order details
  const vehicles = order.orderDetails.map((detail) => detail.vehicle);
  const allServices = order.orderDetails.flatMap((detail) => detail.service);

  // Tính toán VAT và discount theo logic mới
  const vatAmount = calculateVatFromOrder(order);
  const discountAmount = calculateDiscountFromOrder(order);

  const paymentConfig = {
    bankName: process.env.NEXT_PUBLIC_NAMEBANK || "TPBANK",
    accountNumber: process.env.NEXT_PUBLIC_ACCOUNTNUMBER || "0384605830",
    accountName: process.env.NEXT_PUBLIC_ACCOUNTNAME || "CONG TY RUA XE",
  };

  // Build QR description with all vehicles and services
  const vehicleDescriptions = order.orderDetails.map((detail) => {
    const services = detail.service.map((s) => s.serviceName).join(", ");
    return `${detail.vehicle.licensePlate} (${services})`;
  }).join(" | ");

  const qrUrl = `https://img.vietqr.io/image/${paymentConfig.bankName}-${
    paymentConfig.accountNumber
  }-compact2.jpg?amount=${Math.floor(
    order.totalPrice
  )}&addInfo=${encodeURIComponent(
    vehicleDescriptions
  )}&accountName=${encodeURIComponent(paymentConfig.accountName)}`;

  return (
    <div className="space-y-6">
      <div
        ref={printRef}
        className="print-area bg-white max-w-md mx-auto border rounded-lg shadow-sm"
        style={{ padding: "1px 0.5cm" }}
      >
        <div className="flex justify-between mt-4  w-full">
          <div>
            <p className="font-bold text-sm">Mã HĐ: {order.code}</p>
          </div>
          <div className="font-italic text-sm">
            In lúc: {new Date().toLocaleString("vi-VN")}
          </div>
        </div>
        <div className="flex items-start mb-6 pb-4 border-b border-gray-200">
          <img
            src="/logo.png?height=80&width=80"
            alt="Shine Autowerkz Logo"
            className="w-40 h-40 object-contain mr-3 flex-shrink-0"
          />
          <div className="flex-1 text-start justify-center my-auto">
            <p className="text-lg font-bold text-gray-800">SHINE AUTOWERKZ</p>
            <p className="text-xs text-gray-600 mt-1">
              297G Đ.Liên Phường, Phường Phú Hữu, TP Thủ Đức, TP Hồ Chí Minh
            </p>
            <p className="text-xs text-gray-600">SĐT: 0966291909</p>
          </div>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-xl font-extrabold text-gray-900">
            HÓA ĐƠN DỊCH VỤ
          </h2>
        </div>

        <div className="mb-4 flex justify-between gap-2">
          {order.customer?.name && (
            <div className="flex-2 text-xs text-gray-700">
              <p className="mb-1">
                <strong>Khách hàng:</strong> {order.customer.name}
              </p>
              <p className="mb-1">
                <strong>Kỹ Thuật:</strong>{" "}
                {order.orderDetails[0].employees[0]?.name || "Chưa có"}
              </p>
            </div>
          )}
          <div className="flex-1 text-xs text-gray-700 mr-2">
            <p className="mb-1">
              <strong>Ngày:</strong>{" "}
              {new Date(order.date).toLocaleDateString("vi-VN")}
            </p>
            <p className="mb-1">
              <strong>Giờ vào:</strong> {formatTime(order.checkIn)}
            </p>
            <p className="mb-1">
              <strong>Giờ ra:</strong> {formatTime(order.checkOut)}
            </p>
          </div>
        </div>

        {/* Danh sách xe và dịch vụ */}
        {order.orderDetails.map((detail, vehicleIndex) => (
          <div key={vehicleIndex} className="mb-4">
            <div className="bg-gray-100 p-2 rounded-t-md border border-gray-300 border-b-0">
              <p className="text-xs font-bold text-gray-800">
                🚗 Xe #{vehicleIndex + 1}: {detail.vehicle.brandName} {detail.vehicle.modelName} - {detail.vehicle.licensePlate} (Size: {detail.vehicle.size})
              </p>
            </div>
            <table className="w-full text-xs border border-gray-300 mb-4">
              <thead>
                <tr className="bg-transparent">
                  <th className="p-2 border-r border-gray-300 text-left font-semibold w-1/2">
                    Dịch vụ
                  </th>
                  <th className="p-2 border-r border-gray-300 text-left font-semibold w-1/4">
                    Loại xe
                  </th>
                  <th className="p-2 text-left font-semibold w-1/4">
                    Giá
                  </th>
                </tr>
              </thead>
              <tbody>
                {detail.service.map((service, serviceIndex) => {
                  const unitPrice = service.adjustedPriceFlag && service.adjustedPriceReason
                    ? service.adjustedPrice
                    : service.serviceCatalog?.listedPrice || 0;
                  const qty = service.quantity >= 1 ? service.quantity : 1;
                  const lineTotal = unitPrice * qty;
                  return (
                    <tr key={serviceIndex}>
                      <td className="p-2 border-r border-gray-300">
                        {service.serviceName}
                        {qty > 1 && <span className="text-gray-500"> (x{qty})</span>}
                      </td>
                      <td className="p-2 border-r border-gray-300">
                        {service.serviceCatalog?.size || "N/A"}
                      </td>
                      <td className="p-2 text-right">
                        {lineTotal.toLocaleString()}đ
                      </td>
                    </tr>
                  );
                })}
                {detail.service.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-2 text-center text-gray-500">
                      Chưa có dịch vụ nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}

        <div className="text-sm mt-4 space-y-2 text-gray-700">
          <div className="flex justify-between">
            <span>Tạm tính:</span>
            <span>{baseServicePrice.toLocaleString()}đ</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              {order.discount < 100 ? (
                <>
                  <span>Giảm giá ({order.discount}%):</span>
                  <span>{discountAmount.toLocaleString()}đ</span>
                </>
              ) : (
                <>
                  <span>Giảm giá:</span>
                  <span>{discountAmount.toLocaleString()}đ</span>
                </>
              )}
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between font-medium border-t pt-2">
              <span>Tổng tiền sau giảm giá:</span>
              <span>
                {(baseServicePrice - discountAmount).toLocaleString()}đ
              </span>
            </div>
          )}
          {order.vat > 0 && (
            <div className="flex justify-between">
              <span>VAT ({order.vat}%):</span>
              <span>{vatAmount.toLocaleString()}đ</span>
            </div>
          )}
          <hr className="my-4 border-t-2 border-dashed border-gray-300" />
          <div className="flex justify-between font-bold text-lg text-gray-900">
            <span>Tổng thanh toán:</span>
            <span>{order.totalPrice.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Thanh toán bằng:</span>
            <span className="font-semibold">{order.paymentType}</span>
          </div>
        </div>

        <div className="mt-8 text-center p-4 bg-gray-50 rounded-md border border-gray-100">
          <p className="font-bold text-lg mb-3 text-gray-800">
            Quét mã QR để thanh toán
          </p>
          <img
            src={qrUrl || "/placeholder.svg"}
            alt="Mã QR Thanh Toán"
            width={250}
            height={250}
            className="w-full max-w-[200px] h-auto rounded-lg border shadow-sm mx-auto"
          />
          <div className="mt-4 text-sm text-gray-700">
            <p>
              <strong>Ngân hàng:</strong> {paymentConfig.bankName}
            </p>
            <p>
              <strong>Số tài khoản:</strong> {paymentConfig.accountNumber}
            </p>
            <p>
              <strong>Tên tài khoản:</strong> {paymentConfig.accountName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
