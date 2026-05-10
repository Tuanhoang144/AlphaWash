import { OrderDetailDTO, OrderResponseDTO } from "@/types/OrderResponse";
import { OrderUpdateRequest } from "@/types/OrderUpdateRequest";

export function mapFullOrderToUpdateRequest(
  id: string,
  order: OrderResponseDTO
): OrderUpdateRequest {
  const detail = order.orderDetails[0]; // giả sử chỉ có 1 detail

  const orderUpdateRequest: OrderUpdateRequest = {
    orderId: id,
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
      orderDetailCode: detail.code || "",
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

  return orderUpdateRequest;
}
