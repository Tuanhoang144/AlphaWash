import { OrderCreateRequest } from "@/types/OrderCreateRequest";
import { OrderResponseDTO } from "@/types/OrderResponse";

export function mapFullOrderToRequest(
  order: OrderResponseDTO
): OrderCreateRequest {
  const orderCreateRequest: OrderCreateRequest = {
    customerId: order.customer?.id || undefined,
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
        .filter((service) => service.id && service.id !== 0) // Only include valid services
        .map((service) => ({
          serviceCatalogCode: service.serviceCatalog?.code || "",
          adjustedPrice: service.adjustedPrice || 0,
          adjustedPriceFlag: service.adjustedPriceFlag || false,
          adjustedPriceReason: service.adjustedPriceReason || "",
          quantity: service.quantity >= 1 ? service.quantity : 1,
        })),
      note: detail.note || "",
      status: detail.status || "",
      // Vehicle info per detail (multi-vehicle support)
      licensePlate: detail.vehicle?.licensePlate || "",
      brandCode: detail.vehicle?.brandCode || "",
      modelCode: detail.vehicle?.modelCode || "",
      imageUrl: detail.vehicle?.imageUrl || "",
      vehicleNote: "",
    })),
  };

  return orderCreateRequest;
}
