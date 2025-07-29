import type { OrderResponseDTO } from "@/types/OrderResponse";
import { tool } from "@/utils/tool";

export const generateInvoiceHTML = ({
  order,
  baseServicePrice,
  logoBase64,
  qrBase64,
  qrUrl,
}: {
  order: OrderResponseDTO;
  baseServicePrice: number;
  logoBase64?: string;
  qrBase64?: string;
  qrUrl: string;
}) => {
  const { formatTime } = tool();
  const vatRow =
    order.vat > 0
      ? `<div class="total-row"><span>VAT (${order.vat}%):</span><span>${(
          (order.vat / 100) *
          baseServicePrice
        ).toLocaleString()}đ</span></div>`
      : "";

  const discountRow =
    order.discount > 0
      ? `<div class="total-row"><span>Giảm giá (${
          order.discount
        }%):</span><span>-${(
          (order.discount / 100) *
          baseServicePrice
        ).toLocaleString()}đ</span></div>`
      : "";

  const vehicle = order.orderDetails[0].vehicle;
  const services = order.orderDetails.flatMap((detail) => detail.service);

  const serviceRows = services
    .map(
      (service) => `
        <tr>
          <td>${service.serviceName}</td>
          <td>${service.serviceCatalog.size}</td>
          <td class="price">${service.serviceCatalog.price.toLocaleString()}đ</td>
        </tr>`
    )
    .join("");

  const qrImage = qrBase64 || qrUrl;

  return `
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
                width: 100px;
                height: 100px;
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
                flex: 2;
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
                width: 200px;
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
              .top-meta {
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                margin-bottom: 4px;
              }
              .invoice-id {
                font-weight: bold;
              }
              .print-time {
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
      <div class="top-meta">
        <div class="invoice-id">Mã HĐ: ${order.code}</div>
        <div class="print-time">In lúc: ${new Date().toLocaleString(
          "vi-VN"
        )}</div>
      </div>

      <div class="header">
        <img src="${logoBase64}" alt="Logo" class="logo" />
        <div class="company-info-container">
          <div class="company-name">ALPHA WASH</div>
          <div class="company-info">297G Đ.Liên Phường, Phường Phú Hữu, TP Thủ Đức, TP Hồ Chí Minh</div>
          <div class="company-info">SĐT: 0966291909</div>
        </div>
      </div>

      <div class="invoice-title">HÓA ĐƠN DỊCH VỤ</div>

      <div class="order-info">
        <div class="order-info-left">
          ${
            order.customer?.name
              ? `
            <div class="info-row"><strong>Khách hàng:</strong> ${
              order.customer.name
            }</div>
            <div class="info-row"><strong>Kỹ thuật:</strong> ${
              order.orderDetails[0].employees[0]?.name || "Chưa có"
            }</div>
          `
              : ""
          }
          <div class="info-row"><strong>Biển số:</strong> ${
            vehicle.licensePlate
          }</div>
        </div>
       <div class="order-info-right">
                 <div class="info-row"><strong>Ngày:</strong> ${new Date(
                   order.date
                 ).toLocaleDateString("vi-VN")}</div>
                  <div class="info-row"><strong>Giờ vào:</strong> ${formatTime(
                    order.checkIn
                  )}</div>
                  <div class="info-row"><strong>Giờ ra:</strong> ${formatTime(
                    order.checkOut
                  )}</div>
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
          ${serviceRows}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-row">
          <span>Tạm tính:</span>
          <span>${baseServicePrice.toLocaleString()}đ</span>
        </div>
        ${vatRow}
        ${discountRow}
        <div class="total-divider"></div>
        <div class="total-row final-total">
          <span>TỔNG THANH TOÁN:</span>
          <span>${order.totalPrice.toLocaleString()}đ</span>
        </div>
        <div class="total-row payment-method">
          <span>Thanh toán:</span>
          <span>${order.paymentType}</span>
        </div>
      </div>

      <div class="qr-section">
        <div class="qr-title">Quét mã QR để thanh toán</div>
        <img src="${qrImage}" alt="QR Code" class="qr-code" />
      </div>

      <div class="thank-you">Cảm ơn quý khách!<br />Hẹn gặp lại!</div>
    </div>
  </body>
</html>
  `;
};
