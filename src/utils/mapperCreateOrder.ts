import { OrderCreateRequest } from "@/types/OrderCreateRequest";
import { OrderResponseDTO } from "@/types/OrderResponse";

export function mapFullOrderToRequest(
  order: OrderResponseDTO
): OrderCreateRequest {
  const firstDetail = order.orderDetails?.[0];
  const orderCreateRequest: OrderCreateRequest = {
    customerId: order.customer?.id || undefined,
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
      employeeIds: (detail.employees || []).map((employee) => employee.id),
      services: (detail.service || [])
        .filter((service) => service.id && service.id !== 0)
        .map((service) => {
          // SYNTHETIC_ = new-system service chưa submit (FE-only catalog)
          // SI_ = new-system service đã lưu vào DB và load lại từ BE
          const isSynthetic = service.serviceCatalog?.code?.startsWith("SYNTHETIC_")
                           || service.serviceCatalog?.code?.startsWith("SI_");
          if (isSynthetic) {
            // New-system service: không có catalog entry trong old system.
            // BE nhận serviceItemId và tạo stable key "SI_" + serviceItemId.
            return {
              serviceCatalogCode: null,
              // serviceCode = UUID của service_item (cả khi mới chọn lẫn khi load lại từ BE)
              // Với SI_ codes: serviceCode đã là UUID; với SYNTHETIC_: serviceCode là UUID từ adaptServiceItem
              serviceItemId: service.serviceCode?.startsWith?.("SI_")
                ? service.serviceCode.substring(3)   // strip "SI_" prefix nếu serviceCode bị set sai
                : service.serviceCode,               // thường là UUID string
              adjustedPrice: service.serviceCatalog?.listedPrice ?? service.adjustedPrice ?? 0,
              adjustedPriceFlag: true,
              adjustedPriceReason: service.adjustedPriceReason || "",
              quantity: service.quantity >= 1 ? service.quantity : 1,
            };
          }
          // Old-system service: dùng catalog code thật
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
      licensePlate: detail.vehicle?.licensePlate || "",
      brandCode: detail.vehicle?.brandCode || "",
      modelCode: detail.vehicle?.modelCode || "",
      imageUrl: detail.vehicle?.imageUrl || "",
      vehicleNote: "",
    })),
  };

  return orderCreateRequest;
}
