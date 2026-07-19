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
    checkOutTime: order.checkOut || "",
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
        .map((service) => ({
          serviceCatalogCode: service.serviceCatalog?.code || "",
          adjustedPrice: service.adjustedPrice || 0,
          adjustedPriceFlag: service.adjustedPriceFlag || false,
          adjustedPriceReason: service.adjustedPriceReason || "",
          quantity: service.quantity >= 1 ? service.quantity : 1,
        })),
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
