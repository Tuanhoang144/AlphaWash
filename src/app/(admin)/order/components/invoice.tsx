"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import QRCodeDisplay from "./qr-code-display";
import { OrderResponseDTO } from "@/types/OrderResponse";
import { tool } from "@/utils/tool";

const InvoiceTemplate = ({ order }: { order: OrderResponseDTO }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const { formatTime } = tool();

  const loadImageAsBase64 = (url: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } else {
          resolve("");
        }
      };
      img.onerror = () => resolve("");
      img.src = url;
    });
  };

  const handlePrint = async () => {
    if (!printRef.current) return;

    try {
      // Load logo và QR code as base64
      const logoBase64 = await loadImageAsBase64("/logo.png");
      const qrBase64 = await loadImageAsBase64(qrUrl);

      // Clone nội dung và thay thế images
      let content = printRef.current.innerHTML;

      // Replace logo
      if (logoBase64) {
        content = content.replace(
          /src="\/logo\.png[^"]*"/g,
          `src="${logoBase64}"`
        );
      }

      // Replace QR code
      if (qrBase64) {
        content = content.replace(
          new RegExp(qrUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
          qrBase64
        );
      }

      const printWindow = window.open("", "", "width=320,height=600");

      if (printWindow) {
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Hóa đơn</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              @page {
                size: 80mm auto;
                margin: 0;
              }
              
              body {
                width: 80mm;
                max-width: 80mm;
                margin: 0 auto;
                font-family: 'Arial', sans-serif;
                font-size: 12px;
                line-height: 1.3;
                color: #000;
                background: white;
              }
              
              .print-container {
                width: 100%;
                max-width: 80mm;
                padding: 1px 0.5cm;
                margin-top: 5mm;
              }
              
              .header {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                border-bottom: 1px solid #000;
                padding-bottom: 6px;
              }
              
              .logo {
                width: 60px;
                height: 60px;
                margin-right: 8px;
                flex-shrink: 0;
              }
              
              .company-info-container {
                flex: 1;
              }
              
              .company-name {
                font-size: 13px;
                font-weight: bold;
                margin-bottom: 2px;
              }
              
              .company-info {
                font-size: 9px;
                line-height: 1.2;
                margin-bottom: 1px;
              }
              
              .invoice-title {
                font-size: 16px;
                font-weight: bold;
                text-align: center;
                margin: 10px 0;
                text-transform: uppercase;
              }
              
              .order-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 10px;
              }
              
              .order-info-left {
                flex: 1;
                margin-right: 5px;
              }
              
              .order-info-right {
                flex: 1;
              }
              
              .info-row {
                margin-bottom: 2px;
              }
              
              .service-table {
                width: 100%;
                border-collapse: collapse;
                margin: 8px 0;
                font-size: 10px;
                border: 1px solid #000;
              }
              
              .service-table th,
              .service-table td {
                padding: 4px 3px;
                border-bottom: 1px solid #ccc;
                border-right: 1px solid #ccc;
              }
              
              .service-table th {
                font-weight: bold;
                text-align: left;
                background: transparent;
              }
              
              .service-table td:last-child,
              .service-table th:last-child {
                border-right: none;
              }
              
              .service-table .price {
                text-align: right;
                white-space: nowrap;
              }
              
              .total-section {
                margin: 10px 0;
                font-size: 11px;
              }
              
              .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 3px;
              }
              
              .total-divider {
                border-top: 1px dashed #000;
                margin: 8px 0 5px 0;
              }
              
              .final-total {
                font-weight: bold;
                font-size: 13px;
                border-top: 2px solid #000;
                padding-top: 5px;
              }
              
              .payment-method {
                font-weight: bold;
                margin-top: 5px;
              }
              
              .qr-section {
                text-align: center;
                margin-top: 15px;
                padding-top: 10px;
                border-top: 1px dashed #000;
              }
              
              .qr-title {
                font-size: 12px;
                font-weight: bold;
                margin-bottom: 8px;
              }
              
              .qr-code {
                width: 120px;
                height: 120px;
                margin: 0 auto 8px;
                display: block;
              }
              
              .bank-info {
                font-size: 10px;
                line-height: 1.3;
              }
              
              .bank-info div {
                margin-bottom: 2px;
              }
              
              .thank-you {
                text-align: center;
                margin-top: 15px;
                font-size: 11px;
                font-style: italic;
              }
              
              @media print {
                body { 
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                
                .print-container {
                  padding: 3px 0.5cm;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <div class="header">
                <img src="${
                  logoBase64 || "/logo.png"
                }" alt="Logo" class="logo" />
                <div class="company-info-container">
                  <div class="company-name">ALPHA WASH</div>
                  <div class="company-info">297G Đ.Liên Phường, Phường Phú Hữu</div>
                  <div class="company-info">TP Thủ Đức, TP Hồ Chí Minh</div>
                  <div class="company-info">SĐT: 0966291909</div>
                </div>
              </div>

              <div class="invoice-title">HÓA ĐƠN DỊCH VỤ</div>

              <div class="order-info">
                <div class="order-info-left">
                  <div class="info-row"><strong>Ngày:</strong> ${new Date(
                    order.orderDate
                  ).toLocaleDateString("vi-VN")}</div>
                  <div class="info-row"><strong>Giờ vào:</strong> ${formatTime(
                    order.checkIn
                  )}</div>
                  <div class="info-row"><strong>Giờ ra:</strong> ${formatTime(
                    order.checkOut
                  )}</div>
                </div>
                <div class="order-info-right">
                  ${
                    order.customer?.name
                      ? `
                  <div class="info-row"><strong>Khách hàng:</strong> ${order.customer.name}</div>
                  <div class="info-row"><strong>SĐT:</strong> ${order.customer.phone}</div>
                  `
                      : ""
                  }
                  <div class="info-row"><strong>Biến số:</strong> ${vehicle.licensePlate}</div>
                </div>
              </div>

              <table class="service-table">
                <thead>
                  <tr>
                    <th>Dịch vụ</th>
                    <th>Loại xe</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${service.serviceName}</td>
                    <td>${service.serviceCatalog.size}</td>
                    <td class="price">${service.serviceCatalog.price.toLocaleString()}đ</td>
                  </tr>
                </tbody>
              </table>

              <div class="total-section">
                <div class="total-row">
                  <span>Tạm tính:</span>
                  <span>${order.totalPrice.toLocaleString()}đ</span>
                </div>
                <div class="total-row">
                  <span>VAT (${order.vat}%):</span>
                  <span>${(
                    (order.vat / 100) *
                    order.totalPrice
                  ).toLocaleString()}đ</span>
                </div>
                <div class="total-row">
                  <span>Giảm giá (${order.discount}%):</span>
                  <span>-${(
                    (order.discount / 100) *
                    order.totalPrice
                  ).toLocaleString()}đ</span>
                </div>
                
                <div class="total-divider"></div>
                
                <div class="total-row final-total">
                  <span>TỔNG THANH TOÁN:</span>
                  <span>${calcTotal().toLocaleString()}đ</span>
                </div>
                
                <div class="total-row payment-method">
                  <span>Thanh toán:</span>
                  <span>${order.paymentType}</span>
                </div>
              </div>

              <div class="qr-section">
                <div class="qr-title">Quét mã QR để thanh toán</div>
                <img src="${qrBase64 || qrUrl}" alt="QR Code" class="qr-code" />
                <div class="bank-info">
                  <div><strong>NH:</strong> ${paymentConfig.bankName}</div>
                  <div><strong>STK:</strong> ${
                    paymentConfig.accountNumber
                  }</div>
                  <div><strong>Tên:</strong> ${paymentConfig.accountName}</div>
                </div>
              </div>

              <div class="thank-you">
                Cảm ơn quý khách!<br>
                Hẹn gặp lại!
              </div>
            </div>
          </body>
        </html>
        `);

        printWindow.document.close();

        // Wait for images to load before printing
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }, 1000);
      }
    } catch (error) {
      console.error("Error printing:", error);
    }
  };

  const service = order.orderDetails[0].service;
  const vehicle = order.orderDetails[0].vehicle;

  const calcTotal = () => {
    const base = order.totalPrice;
    const vat = (order.vat / 100) * base;
    const discount = (order.discount / 100) * base;
    return base + vat - discount;
  };

  const paymentConfig = {
    bankName: process.env.NEXT_PUBLIC_NAMEBANK || "TPBANK",
    accountNumber: process.env.NEXT_PUBLIC_ACCOUNTNUMBER || "0384605830",
    accountName: process.env.NEXT_PUBLIC_ACCOUNTNAME || "CONG TY RUA XE",
  };

  const qrUrl = `https://img.vietqr.io/image/${paymentConfig.bankName}-${
    paymentConfig.accountNumber
  }-compact2.jpg?amount=${Math.floor(calcTotal())}&addInfo=${encodeURIComponent(
    vehicle.licensePlate + " - " + service.serviceName
  )}&accountName=${encodeURIComponent(paymentConfig.accountName)}`;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div
        ref={printRef}
        className="print-area bg-white max-w-md mx-auto"
        style={{ padding: "1px 0.5cm" }}
      >
        <div className="flex items-start mb-6 pb-4 border-b border-gray-200">
          <img
            src="/logo.png?height=80&width=80"
            alt="Logo"
            className="w-16 h-16 object-contain mr-3 flex-shrink-0"
          />
          <div className="flex-1">
            <p className="text-lg font-bold text-gray-800">ALPHA WASH</p>
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

        <div className="mb-4 flex">
          <div className="flex-1 text-xs text-gray-700 mr-2">
            <p className="mb-1">
              <strong>Ngày:</strong>{" "}
              {new Date(order.orderDate).toLocaleDateString("vi-VN")}
            </p>
            <p className="mb-1">
              <strong>Giờ vào:</strong> {formatTime(order.checkIn)}
            </p>
            <p className="mb-1">
              <strong>Giờ ra:</strong> {formatTime(order.checkOut)}
            </p>
          </div>

          {order.customer?.name && (
            <div className="flex-1 text-xs text-gray-700">
              <p className="mb-1">
                <strong>KH:</strong> {order.customer.name}
              </p>
              <p className="mb-1">
                <strong>SĐT:</strong> {order.customer.phone}
              </p>
            </div>
          )}
        </div>

        <div className="mb-4 text-xs text-gray-700">
          <p className="mb-1">
            <strong>Xe:</strong> {vehicle.brandName} {vehicle.modelName}
          </p>
          <p className="mb-1">
            <strong>BKS:</strong> {vehicle.licensePlate}
          </p>
        </div>

        <table className="w-full text-xs border border-gray-300 mb-4">
          <thead>
            <tr className="bg-transparent">
              <th className="p-2 border-r border-gray-300 text-left font-semibold">
                Dịch vụ
              </th>
              <th className="p-2 border-r border-gray-300 text-left font-semibold">
                Loại xe
              </th>
              <th className="p-2 text-left font-semibold">Giá</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-r border-gray-300">
                {service.serviceName}
              </td>
              <td className="p-2 border-r border-gray-300">
                {service.serviceCatalog.size}
              </td>
              <td className="p-2 text-right">
                {service.serviceCatalog.price.toLocaleString()}đ
              </td>
            </tr>
          </tbody>
        </table>

        <div className="text-sm mt-4 space-y-2 text-gray-700">
          <div className="flex justify-between">
            <span>Tạm tính:</span>
            <span>{order.totalPrice.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between">
            <span>VAT ({order.vat}%):</span>
            <span>
              {((order.vat / 100) * order.totalPrice).toLocaleString()}đ
            </span>
          </div>
          <div className="flex justify-between">
            <span>Giảm giá ({order.discount}%):</span>
            <span>
              -{((order.discount / 100) * order.totalPrice).toLocaleString()}đ
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tiền tip:</span>
            <span>{order.tip.toLocaleString()}đ</span>
          </div>
          <hr className="my-4 border-t-2 border-dashed border-gray-300" />
          <div className="flex justify-between font-bold text-lg text-gray-900">
            <span>Tổng thanh toán:</span>
            <span>{calcTotal().toLocaleString()}đ</span>
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
            src={qrUrl}
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

      <div className="mt-6 text-center">
        <Button onClick={handlePrint} className="px-8 py-3 text-lg">
          In hóa đơn
        </Button>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
