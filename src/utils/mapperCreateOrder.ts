import { OrderCreateRequest } from "@/types/OrderCreateRequest";
import { OrderResponseDTO } from "@/types/OrderResponse";

export function mapFullOrderToRequest(
  order: OrderResponseDTO
): OrderCreateRequest {
  const detail = order.orderDetails[0]; // giả sử chỉ có 1 detail

  const orderCreateRequest: OrderCreateRequest = {
    customerId: order.customer?.id || "",
    licensePlate: detail.vehicle.licensePlate || "",
    brandCode: detail.vehicle.brandCode || "",
    modelCode: detail.vehicle.modelCode || "",
    imageUrl: detail.vehicle.imageUrl || "",
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
    vehicleNote: "",
    orderDetails: order.orderDetails?.map((detail) => ({
      employeeIds: (detail.employees || []).map((employee) => employee.id),
      services: (detail.service || []).map((service) => ({
        serviceCatalogCode: service.serviceCatalog?.code || "",
        adjustedPrice: service.adjustedPrice || 0,
        adjustedPriceFlag: service.adjustedPriceFlag || false,
        adjustedPriceReason: service.adjustedPriceReason || "",
      })),
      note: detail.note || "",
      status: detail.status || "",
    })),
  };

  return orderCreateRequest;
}
