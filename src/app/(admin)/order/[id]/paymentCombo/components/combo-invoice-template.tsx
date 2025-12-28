"use client";

import { useMemo, useRef } from "react";
import { Package } from "lucide-react";
import type { OrderResponseDTO, ServiceDTO } from "@/types/OrderResponse";
import { tool } from "@/utils/tool";
import {
  calculateDiscountFromOrder,
  calculateVatFromOrder,
} from "@/shared/utils/order/calculatePrice";
import { Service } from "@/types/Service";

type ComboInvoiceTemplateProps = {
  order: OrderResponseDTO;
  baseServicePrice: number;
  service?: ServiceDTO[];
};

const ComboInvoiceTemplate = ({
  order,
  baseServicePrice,
  service,
}: ComboInvoiceTemplateProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const serviceNameMap = useMemo(() => {
    const map = new Map<string, string>();
    service?.forEach((s) => {
      map.set(s.serviceCode, s.serviceName);
    });
    return map;
  }, [service]);

  const vehicle = order.orderDetails[0].vehicle;
  const services = order.orderDetails.flatMap((detail) => detail.service);

  // Tính toán VAT và discount theo logic mới
  const vatAmount = calculateVatFromOrder(order);
  const discountAmount = calculateDiscountFromOrder(order);

  const paymentConfig = {
    bankName: process.env.NEXT_PUBLIC_NAMEBANK || "TPBANK",
    accountNumber: process.env.NEXT_PUBLIC_ACCOUNTNUMBER || "0384605830",
    accountName: process.env.NEXT_PUBLIC_ACCOUNTNAME || "CONG TY RUA XE",
  };

  const comboNames =
    order.orderDetails[0].service[0].serviceComboCatalog?.comboName || "";
  const qrUrl = `https://img.vietqr.io/image/${paymentConfig.bankName}-${
    paymentConfig.accountNumber
  }-compact2.jpg?amount=${Math.floor(
    order.totalPrice
  )}&addInfo=${encodeURIComponent(
    vehicle.licensePlate + " - COMBO: " + comboNames
  )}&accountName=${encodeURIComponent(paymentConfig.accountName)}`;
  const expiredDate = new Date(order.date);
  expiredDate.setMonth(expiredDate.getMonth() + 3);
  return (
    <div className="space-y-6">
      <div
        ref={printRef}
        className="print-area bg-white max-w-md mx-auto border rounded-lg shadow-sm"
        style={{ padding: "1px 0.5cm" }}
      >
        <div className="flex justify-between mt-4 w-full">
          <div className="flex items-center gap-2">
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
            HÓA ĐƠN GÓI COMBO
          </h2>
        </div>

        <div className="mb-4 flex justify-between gap-2">
          {order.customer?.name && (
            <div className="flex-3 text-xs text-gray-700">
              <p className="mb-1">
                <strong>Khách hàng:</strong> {order.customer.name}
              </p>
              <p className="mb-1">
                <strong>Số điện thoại:</strong>{" "}
                {order.customer?.phone || "Chưa có"}
              </p>
              <p className="mb-1">
                <strong>Kích cỡ:</strong> {vehicle.size}
              </p>
            </div>
          )}
          <div className="flex-2 text-xs text-gray-700 mr-2">
            <p className="mb-1">
              <strong>Hạn sử dụng: </strong>3 tháng
            </p>
            <p className="mb-1">
              <strong>Ngày bắt đầu: </strong>
              {new Date(order.date).toLocaleDateString("vi-VN")}
            </p>
            <p className="mb-1">
              <strong>Ngày hết hạn: </strong>{" "}
              {expiredDate.toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>

        <table className="w-full text-xs border border-gray-300 mb-4">
          <thead className="border border-gray-300">
            <tr className="bg-transparent">
              <th className="p-2 border-r border-gray-300 text-left font-semibold">
                Gói combo
              </th>
              <th className="p-2 text-left font-semibold">Giá</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => {
              if (!service.serviceComboCatalog) return null;

              const combo = service.serviceComboCatalog;
              const comboPrice =
                service.adjustedPriceFlag && service.adjustedPriceReason
                  ? service.adjustedPrice ?? 0
                  : combo.price;

              return (
                <tr key={index}>
                  <td className="p-2 border-r text-[14px] border-gray-300 align-top">
                    <strong>{combo.comboName}</strong>

                    <div className="text-[12px] text-gray-600 italic mt-1 pl-3">
                      {combo.services.map((s, idx) => {
                        return (
                          <div key={idx} className="leading-tight">
                            • {s.serviceName}: {s.quantity} lần
                          </div>
                        );
                      })}
                    </div>

                    {/* Quà tặng */}
                    <div className="text-[12px] text-green-700 italic mt-1 pl-3">
                      Quà tặng: Khăn lau xe &amp; Nước rửa kính
                    </div>
                  </td>
                  <td className="p-2 text-right">
                    {comboPrice.toLocaleString()}đ
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="text-sm mt-4 space-y-2 text-gray-700">
          <div className="flex justify-between">
            <span>Tạm tính:</span>
            <span>{Math.round(baseServicePrice).toLocaleString("vi-VN")}đ</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-red-600">
              {order.discount < 100 ? (
                <>
                  <span>Giảm giá ({order.discount}%):</span>
                  <span>{discountAmount.toLocaleString("vi-VN")}đ</span>
                </>
              ) : (
                <>
                  <span>Giảm giá:</span>
                  <span>{discountAmount.toLocaleString("vi-VN")}đ</span>
                </>
              )}
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between font-medium border-t pt-2">
              <span>Tổng tiền sau giảm giá:</span>
              <span>
                {(Math.round(baseServicePrice) - discountAmount).toLocaleString(
                  "vi-VN"
                )}
                đ
              </span>
            </div>
          )}
          {order.vat > 0 && (
            <div className="flex justify-between">
              <span>VAT ({order.vat}%):</span>
              <span>{vatAmount.toLocaleString("vi-VN")}đ</span>
            </div>
          )}
          <hr className="my-4 border-t-2 border-dashed border-gray-300" />
          <div className="flex justify-between font-bold text-lg text-gray-900">
            <span>Tổng thanh toán:</span>
            <span className="text-green-600">
              {order.totalPrice.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Thanh toán bằng:</span>
            <span className="font-semibold">{order.paymentType}</span>
          </div>
        </div>

        <div className="mt-8 text-center p-4 bg-orange-50 rounded-md border border-orange-200">
          <p className="font-bold text-lg mb-3 text-gray-800 flex items-center justify-center gap-2">
            <Package className="h-5 w-5 text-orange-500" />
            Quét mã QR để thanh toán gói combo
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

        <div className="mt-4 text-center text-sm text-gray-600 italic">
          Cảm ơn quý khách đã chọn gói combo!
          <br />
          Hẹn gặp lại!
        </div>
      </div>
    </div>
  );
};

export default ComboInvoiceTemplate;
