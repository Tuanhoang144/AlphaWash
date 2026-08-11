import { OrderResponseDTO } from "@/types/OrderResponse";
import { OrderUpdateRequest } from "@/types/OrderUpdateRequest";

export function mapFullOrderToUpdateRequest(
  id: string,
  order: OrderResponseDTO
): OrderUpdateRequest {
  const firstDetail = order.orderDetails[0];

  const orderUpdateRequest: OrderUpdateRequest = {
    orderId: id,
    customerId: order.customer?.id || null,
    // Top-level vehicle = xe của detail đầu tiên (backward compat với BE)
    licensePlate: firstDetail?.vehicle?.licensePlate || "",
    brandCode: firstDetail?.vehicle?.brandCode || "",
    modelCode: firstDetail?.vehicle?.modelCode || "",
    imageUrl: firstDetail?.vehicle?.imageUrl || "",
    vehicleNote: "",
    date: order.date || "",
    checkInTime: order.checkIn || "",
    checkOutTime: order.checkOut || null,  // null khi chưa điền — BE LocalTime accept null
    paymentType: order.paymentType || "",
    paymentStatus: order.paymentStatus || "",
    tip: order.tip || 0,
    vat: order.vat || 0,
    discount: order.discount || 0,
    totalPrice: order.totalPrice || 0,
    note: order.note || "",
    orderDetails: order.orderDetails?.map((detail) => ({
      orderDetailCode: detail.code || "", // rỗng = detail mới → BE sẽ tạo mới
      // Per-detail vehicle — BE dùng trường này để biết xe của từng detail
      licensePlate: detail.vehicle?.licensePlate || "",
      brandCode: detail.vehicle?.brandCode || "",
      modelCode: detail.vehicle?.modelCode || "",
      imageUrl: detail.vehicle?.imageUrl || "",
      vehicleNote: "",
      employeeIds: (detail.employees || []).map((employee) => employee.id),
      services: (detail.service || [])
        .filter((service) => service.serviceCatalog?.code) // bỏ service rỗng chưa chọn
        .map((service) => {
          const isSynthetic = service.serviceCatalog?.code?.startsWith("SYNTHETIC_")
                         || service.serviceCatalog?.code?.startsWith("SI_");
          if (isSynthetic) {
            return {
              serviceCatalogCode: null,
              serviceItemId: service.serviceCode?.startsWith?.("SI_")
                ? service.serviceCode.substring(3)
                : service.serviceCode,
              adjustedPrice: service.serviceCatalog?.listedPrice ?? service.adjustedPrice ?? 0,
              adjustedPriceFlag: true,
              adjustedPriceReason: service.adjustedPriceReason || "",
              quantity: service.quantity >= 1 ? service.quantity : 1,
            };
          }
          return {
            serviceCatalogCode: service.serviceCatalog?.code || "",
            adjustedPrice: service.adjustedPrice ?? 0,
            adjustedPriceFlag: service.adjustedPriceFlag || false,
            adjustedPriceReason: service.adjustedPriceReason || "",
            quantity: service.quantity >= 1 ? service.quantity : 1,
          };
        }),
      products: (detail.products || [])
        .filter((p) => p.productCode)
        .map((p) => ({
          productCode: p.productCode,
          quantity: p.quantity >= 1 ? p.quantity : 1,
          unitPrice: p.unitPrice || 0,
          adjustedPrice: p.adjustedPrice || undefined,
          adjustedPriceFlag: p.adjustedPriceFlag || false,
          adjustedPriceReason: p.adjustedPriceReason || undefined,
          discount: p.discount || undefined,
          note: p.note || undefined,
        })),
      note: detail.note || "",
      status: detail.status || "",
    })),
  };

  return orderUpdateRequest;
}
