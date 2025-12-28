import type { OrderResponseDTO, ServiceDTO } from "@/types/OrderResponse";
import { loadImageAsBase64 } from "./print-combo";
import { generateComboInvoiceHTML } from "./invoice-html-combo";
export const handleComboInvoicePrint = async ({
  order,
  baseServicePrice,
  qrUrl,
  logoUrl = "/logo_black.png",
}: {
  order: OrderResponseDTO;
  baseServicePrice: number;
  qrUrl: string;
  logoUrl?: string;
}) => {
  const logoBase64 = await loadImageAsBase64(logoUrl);
  const qrBase64 = await loadImageAsBase64(qrUrl);
  const html = await generateComboInvoiceHTML({
    order,
    baseServicePrice,
    logoBase64,
    qrBase64,
    qrUrl,
  });
  const printWindow = window.open("", "", "width=1024,height=768");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, 1000);
};
