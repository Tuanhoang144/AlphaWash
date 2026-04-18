import type { OrderResponseDTO } from "@/types/OrderResponse";
import { tool } from "@/utils/tool";
import {
  calculateVatFromOrder,
  calculateDiscountFromOrder,
} from "@/shared/utils/order/calculatePrice"; // dùng utils chuẩn

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

  // Tính VAT & discount theo utils chuẩn
  const vatAmount = calculateVatFromOrder(order);
  const discountAmount = calculateDiscountFromOrder(order);

  // Giảm giá (hiển thị trước VAT)
  const discountRow =
    (order.discount ?? 0) > 0
      ? (order.discount as number) < 100
        ? `<div class="total-row"><span>Giảm giá (${
            order.discount
          }%):</span><span>${discountAmount.toLocaleString(
            "vi-VN"
          )}đ</span></div>`
        : `<div class="total-row"><span>Giảm giá:</span><span>${discountAmount.toLocaleString(
            "vi-VN"
          )}đ</span></div>`
      : "";

  // Tổng sau giảm giá
  const afterDiscountRow =
    (order.discount ?? 0) > 0
      ? `<div class="total-row total-after-discount after-discount-border"><span>Tổng tiền sau giảm giá:</span><span>${(
          baseServicePrice - discountAmount
        ).toLocaleString("vi-VN")}đ</span></div>`
      : "";

  // VAT
  const vatRow =
    (order.vat ?? 0) > 0
      ? `<div class="total-row"><span>VAT (${
          order.vat
        }%):</span><span>${vatAmount.toLocaleString("vi-VN")}đ</span></div>`
      : "";

  const firstDetail = order.orderDetails?.[0];

  // Generate vehicle sections with their services
  const vehicleSections = (order.orderDetails ?? [])
    .map((detail, vehicleIndex) => {
      const vehicle = detail.vehicle;
      const services = detail.service ?? [];

      // Service rows for this vehicle
      const serviceRows = services
        .map((service) => {
          const applied =
            service.adjustedPriceFlag && service.adjustedPriceReason
              ? service.adjustedPrice ?? 0
              : service.serviceCatalog?.listedPrice ?? 0;

          const size = service.serviceCatalog?.size ?? "N/A";

          return `
            <tr>
              <td>${service.serviceName}</td>
              <td>${size}</td>
              <td class="price">${applied.toLocaleString("vi-VN")}đ</td>
            </tr>`;
        })
        .join("");

      // Empty state message
      const emptyRow = services.length === 0
        ? '<tr><td colspan="3" style="text-align: center; color: #666;">Chưa có dịch vụ nào</td></tr>'
        : "";

      return `
        <div class="vehicle-section">
          <div class="vehicle-header">
            🚗 Xe #${vehicleIndex + 1}: ${vehicle?.brandName ?? ""} ${vehicle?.modelName ?? ""} - ${vehicle?.licensePlate ?? ""} (Size: ${vehicle?.size ?? ""})
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
              ${serviceRows || emptyRow}
            </tbody>
          </table>
        </div>
      `;
    })
    .join("");

  // For backward compatibility - calculate all services for totals
  const allServices = (order.orderDetails ?? []).flatMap(
    (detail) => detail.service ?? []
  );

  const qrImage = qrBase64 || qrUrl || "";

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
      .company-info-container { flex: 1; }
      .company-name { font-size: 13px; font-weight: bold; margin-bottom: 2px; }
      .company-info { font-size: 9px; line-height: 1.2; margin-bottom: 1px; }
      .invoice-title {
        font-size: 16px; font-weight: bold; text-align: center;
        margin: 10px 0; text-transform: uppercase;
      }
      .order-info {
        display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 10px;
      }
      .order-info-left { flex: 2; margin-right: 5px; }
      .order-info-right { flex: 1; }
      .info-row { margin-bottom: 2px; }
      .vehicle-section { margin-bottom: 10px; }
      .vehicle-header {
        background: #f0f0f0;
        padding: 6px 8px;
        font-size: 11px;
        font-weight: bold;
        border: 1px solid #000;
        border-bottom: none;
        border-radius: 2px 2px 0 0;
      }
      .service-table {
        width: 100%; border-collapse: collapse; margin: 0 0 8px 0; font-size: 10px; border: 1px solid #000;
      }
      .service-table th, .service-table td {
        padding: 4px 3px; border-bottom: 1px solid #ccc; border-right: 1px solid #ccc;
      }
      .service-table th { font-weight: bold; text-align: left; background: transparent; }
      .service-table td:last-child, .service-table th:last-child { border-right: none; }
      .service-table .price { text-align: right; white-space: nowrap; }
      .total-section { margin: 10px 0; font-size: 11px; }
      .total-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
      .total-after-discount { font-weight: bold; }
      .after-discount-border { border-top: 1px solid #000; padding-top: 3px; }
      .total-divider { border-top: 1px dashed #000; margin: 8px 0 5px 0; }
      .final-total { font-weight: bold; font-size: 13px; border-top: 2px solid #000; padding-top: 5px; }
      .payment-method { font-weight: bold; margin-top: 5px; }
      .qr-section { text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #000; }
      .qr-title { font-size: 12px; font-weight: bold; margin-bottom: 8px; }
      .qr-code { width: 200px; margin: 0 auto 8px; display: block; }
      .bank-info { font-size: 10px; line-height: 1.3; }
      .bank-info div { margin-bottom: 2px; }
      .thank-you { text-align: center; margin-top: 15px; font-size: 11px; font-style: italic; }
      .top-meta { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px; }
      .invoice-id { font-weight: bold; }
      .print-time { font-style: italic; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .print-container { padding: 3px 0.5cm; }
      }
    </style>
  </head>
  <body>
    <div class="print-container">
      <div class="top-meta">
        <div class="invoice-id">Mã HĐ: ${order.code ?? ""}</div>
        <div class="print-time">In lúc: ${new Date().toLocaleString(
          "vi-VN"
        )}</div>
      </div>

      <div class="header">
        ${
          logoBase64
            ? `<img src="${logoBase64}" alt="Logo" class="logo" />`
            : ""
        }
        <div class="company-info-container">
          <div class="company-name">SHINE AUTOWERKZ</div>
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
              firstDetail?.employees?.[0]?.name ?? "Chưa có"
            }</div>
          `
              : ""
          }
          <div class="info-row"><strong>Số xe:</strong> ${order.orderDetails?.length ?? 0} xe</div>
        </div>
        <div class="order-info-right">
          <div class="info-row"><strong>Ngày:</strong> ${new Date(
            order.date ?? ""
          ).toLocaleDateString("vi-VN")}</div>
          <div class="info-row"><strong>Giờ vào:</strong> ${formatTime(
            order.checkIn ?? ""
          )}</div>
          <div class="info-row"><strong>Giờ ra:</strong> ${formatTime(
            order.checkOut ?? ""
          )}</div>
        </div>
      </div>

      ${vehicleSections}

      <div class="total-section">
        <div class="total-row">
          <span>Tạm tính:</span>
          <span>${baseServicePrice.toLocaleString("vi-VN")}đ</span>
        </div>
        ${discountRow}
        ${afterDiscountRow}
        ${vatRow}
        <div class="total-divider"></div>
        <div class="total-row final-total">
          <span>TỔNG THANH TOÁN:</span>
          <span>${(order.totalPrice ?? 0).toLocaleString("vi-VN")}đ</span>
        </div>
        <div class="total-row payment-method">
          <span>Thanh toán:</span>
          <span>${order.paymentType ?? ""}</span>
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
