"use client";

import React from "react";
import type { QuoteItem } from "@/types/Quote";

interface QuotePDFPreviewProps {
  customerName: string;
  customerPhone?: string;
  quoteDate: string;
  licensePlate?: string;
  carModel?: string;
  carSize?: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  extraCharge: number;
  total: number;
  quoteCode?: string;
}

function vnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n);
}

export const QuotePDFPreview = React.forwardRef<HTMLDivElement, QuotePDFPreviewProps>(
  function QuotePDFPreview(
    { customerName, customerPhone, quoteDate, licensePlate, carModel, carSize, items, subtotal, discount, extraCharge, total, quoteCode },
    ref
  ) {
    const mainItems = items.filter((i) => !i.isBonus);
    const bonusItems = items.filter((i) => i.isBonus);

    const formattedDate = quoteDate
      ? new Date(quoteDate).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";

    return (
      <>
        {/* Print styles — injected once per render, scoped to #quote-pdf-preview */}
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 15mm;
            }

            /* Ẩn toàn bộ trang, chỉ hiện quote */
            body * {
              visibility: hidden !important;
            }

            #quote-pdf-preview,
            #quote-pdf-preview * {
              visibility: visible !important;
            }

            /* Đặt quote chiếm toàn trang, bỏ padding (đã có @page margin) */
            #quote-pdf-preview {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              min-height: auto !important;
            }

            /* In màu nền và màu chữ đúng */
            #quote-pdf-preview * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>

      <div
        ref={ref}
        id="quote-pdf-preview"
        className="bg-white text-black font-sans"
        style={{ width: "210mm", minHeight: "297mm", padding: "16mm 14mm", boxSizing: "border-box", fontSize: "11pt", lineHeight: 1.4 }}
      >
        {/* ── HEADER: 2 cột — trái (tiêu đề) | phải (logo + công ty) ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6mm" }}>

          {/* Trái ~60%: chỉ tiêu đề */}
          <div style={{ flex: "0 0 60%" }}>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#000", textTransform: "uppercase", lineHeight: 1.15, whiteSpace: "nowrap" }}>
              BẢNG BÁO GIÁ DỊCH VỤ
            </div>
          </div>

          {/* Phải ~40%: logo + tên thương hiệu + thông tin công ty */}
          <div style={{ flex: "0 0 40%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <img
              src="/logo.png"
              alt="Shine Autowerkz"
              style={{ height: "80px", marginBottom: "8px" }}
            />
            <div style={{ fontWeight: "bold", fontSize: "13px", textAlign: "center" }}>
              CÔNG TY CỔ PHẦN SHINE AUTOWERKZ
            </div>
            <div style={{ fontSize: "11px", textAlign: "center" }}>297G Liên Phường, P. Long Trường, TP. HCM</div>
            <div style={{ fontSize: "11px", textAlign: "center" }}>Mã số thuế: 0319062716</div>
            <div style={{ fontSize: "11px", fontWeight: "bold", textAlign: "center" }}>Hotline: 0966.291.909</div>
          </div>
        </div>

        {/* Đường kẻ phân cách header */}
        <hr style={{ borderTop: "2px solid #1a1a1a", marginBottom: "5mm" }} />

        {/* Thông tin khách hàng + xe (2 cột ngang nhau) */}
        <div style={{ display: "flex", gap: "10mm", marginBottom: "5mm" }}>
          {/* Cột trái: thông tin khách hàng */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3.5mm" }}>
            <HeaderInfoRow label="KHÁCH HÀNG" value={customerName || "—"} />
            <HeaderInfoRow label="SỐ ĐIỆN THOẠI" value={customerPhone || "—"} />
            <HeaderInfoRow label="NGÀY" value={formattedDate} />
          </div>
          {/* Cột phải: thông tin xe */}
          {(licensePlate || carModel || carSize || quoteCode) && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3.5mm" }}>
              {licensePlate && <HeaderInfoRow label="BIỂN SỐ XE" value={licensePlate} />}
              {carModel && <HeaderInfoRow label="DÒNG XE" value={carModel} />}
              {carSize && <HeaderInfoRow label="KÍCH CỠ" value={carSize} />}
              {quoteCode && <HeaderInfoRow label="MÃ BÁO GIÁ" value={quoteCode} />}
            </div>
          )}
        </div>

        {/* Bảng dịch vụ chính */}
        {mainItems.length > 0 && (
          <div style={{ marginBottom: "6mm" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
              <thead>
                <tr style={{ background: "#1a1a1a", color: "#fff" }}>
                  <th style={th}>STT</th>
                  <th style={{ ...th, textAlign: "left" }}>DỊCH VỤ</th>
                  <th style={{ ...th, textAlign: "left" }}>THƯƠNG HIỆU</th>
                  <th style={{ ...th, textAlign: "left" }}>LOẠI</th>
                  <th style={{ ...th, textAlign: "left" }}>BẢO HÀNH</th>
                  <th style={{ ...th, textAlign: "right" }}>GIÁ</th>
                </tr>
              </thead>
              <tbody>
                {mainItems.map((item, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f8f8" }}>
                    <td style={{ ...td, textAlign: "center" }}>{i + 1}</td>
                    <td style={td}>{item.serviceName}</td>
                    <td style={td}>{item.brand || "—"}</td>
                    <td style={td}>{item.type || "—"}</td>
                    <td style={td}>{item.warranty || "—"}</td>
                    <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>
                      {vnd(item.price)}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bảng dịch vụ tặng */}
        {bonusItems.length > 0 && (
          <div style={{ marginBottom: "6mm" }}>
            <div style={{ fontWeight: 700, fontSize: "10pt", marginBottom: "2mm", color: "#c47a00" }}>
              DỊCH VỤ TẶNG KÈM
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
              <thead>
                <tr style={{ background: "#c47a00", color: "#fff" }}>
                  <th style={th}>STT</th>
                  <th style={{ ...th, textAlign: "left" }}>DỊCH VỤ</th>
                  <th style={{ ...th, textAlign: "left" }}>BẢO HÀNH</th>
                  <th style={{ ...th, textAlign: "right" }}>GIÁ THAM KHẢO</th>
                </tr>
              </thead>
              <tbody>
                {bonusItems.map((item, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fffbf0" : "#fff8e6" }}>
                    <td style={{ ...td, textAlign: "center" }}>{i + 1}</td>
                    <td style={td}>{item.serviceName}</td>
                    <td style={td}>{item.warranty || "—"}</td>
                    <td style={{ ...td, textAlign: "right", color: "#c47a00" }}>
                      {item.price ? vnd(item.price) + "đ" : "Tặng"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tóm tắt */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8mm" }}>
          <table style={{ fontSize: "10pt", minWidth: "200pt" }}>
            <tbody>
              <tr>
                <td style={{ padding: "2mm 4mm", color: "#555" }}>Tổng dịch vụ:</td>
                <td style={{ padding: "2mm 4mm", textAlign: "right" }}>{vnd(subtotal)}đ</td>
              </tr>
              {discount > 0 && (
                <tr>
                  <td style={{ padding: "2mm 4mm", color: "#c00" }}>Giảm giá:</td>
                  <td style={{ padding: "2mm 4mm", textAlign: "right", color: "#c00" }}>
                    -{vnd(discount)}đ
                  </td>
                </tr>
              )}
              {extraCharge > 0 && (
                <tr>
                  <td style={{ padding: "2mm 4mm", color: "#555" }}>Phí phát sinh:</td>
                  <td style={{ padding: "2mm 4mm", textAlign: "right" }}>{vnd(extraCharge)}đ</td>
                </tr>
              )}
              <tr style={{ borderTop: "1.5px solid #1a1a1a" }}>
                <td style={{ padding: "3mm 4mm", fontWeight: 700, fontSize: "12pt" }}>
                  TỔNG CỘNG:
                </td>
                <td style={{ padding: "3mm 4mm", textAlign: "right", fontWeight: 700, fontSize: "13pt", color: "#1a6800" }}>
                  {vnd(total)}đ
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Chính sách bảo hành */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 4,
            padding: "4mm 6mm",
            fontSize: "9pt",
            color: "#444",
            marginBottom: "8mm",
            background: "#fafafa",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: "2mm" }}>CHÍNH SÁCH BẢO HÀNH</div>
          <ul style={{ margin: 0, paddingLeft: "14pt", lineHeight: 1.8 }}>
            <li>Bảo hành áp dụng theo từng dịch vụ được ghi trong bảng giá.</li>
            <li>Bảo hành không áp dụng cho hư hỏng do tác động bên ngoài (tai nạn, trầy xước mới).</li>
            <li>Vui lòng mang theo hoá đơn khi yêu cầu bảo hành.</li>
          </ul>
        </div>

        {/* Footer */}
        <hr style={{ borderTop: "1px solid #ccc", marginBottom: "4mm" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9pt", color: "#666" }}>
          <div style={{ fontStyle: "italic", fontWeight: 600, color: "#1a1a1a" }}>
            Build Your Shine
          </div>
          <div style={{ textAlign: "right" }}>
            <div>Hotline: 0966.291.909</div>
            <div>297G Liên Phường, P. Long Trường, TP. HCM</div>
          </div>
        </div>
      </div>
      </>
    );
  }
);

/** InfoRow dùng trong phần xe (sau HR) */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: "3mm", alignItems: "baseline" }}>
      <span style={{ fontWeight: 700, fontSize: "9pt", color: "#555", minWidth: "72pt", flexShrink: 0 }}>
        {label}:
      </span>
      <span style={{ fontWeight: 500, fontSize: "9.5pt" }}>{value}</span>
    </div>
  );
}

/** HeaderInfoRow dùng trong header (bên trái, dưới tiêu đề lớn) */
function HeaderInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
      <span style={{ fontWeight: 700, fontSize: "10pt", color: "#1a1a1a", minWidth: "105pt", flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: "10pt", color: "#1a1a1a", marginRight: "3mm" }}>:</span>
      <span style={{ fontSize: "10pt", fontWeight: 500, color: "#1a1a1a" }}>{value}</span>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "3mm 3mm",
  fontWeight: 600,
  textAlign: "center",
  border: "1px solid #333",
};

const td: React.CSSProperties = {
  padding: "2.5mm 3mm",
  border: "1px solid #ddd",
};
