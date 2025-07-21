import { BasicCustomerRequest, BasicInformationRequest, BasicServiceRequest, BasicVehicleRequest } from "@/types/OrderRequest";
import { OrderDetailDTO, OrderResponseDTO } from "@/types/OrderResponse";

export interface OrderUpdateRequest {
  id: string;
  request: {
    information: BasicInformationRequest;
    vehicle: BasicVehicleRequest;
    service: BasicServiceRequest;
    customer: BasicCustomerRequest | null;
  };
}


export function mapFullOrderToUpdateRequest(
  id: string,
  order: OrderResponseDTO
): OrderUpdateRequest {
  const detail: OrderDetailDTO = order.orderDetails[0]; // chỉ lấy 1 chi tiết
  function formatDateToLocalDateTime(input: string): string {
    if (!input) return "";
    const date = new Date(input);
    // Cắt bỏ phần timezone: yyyy-MM-ddTHH:mm:ss
    return date.toISOString().slice(0, 19);
  }

  const request = {
    information: {
      date: formatDateToLocalDateTime(order.orderDate),
      checkinTime: order.checkIn,
      checkoutTime: order.checkOut,
      paymentType: order.paymentType,
      status: detail.status,
      paymentStatus: order.paymentStatus,
      tip: order.tip || 0,
      discount: order.discount || 0,
      vat: order.vat || 0,
      totalPrice: order.totalPrice,
      note: order.note || "",
      employeeId: detail.employees.map((e) => e.id).join(","),
    },
    vehicle: {
      licensePlate: detail.vehicle.licensePlate,
      brandCode: detail.vehicle.brandCode,
      modelCode: detail.vehicle.modelCode,
      note: detail.note || "",
    },
    service: {
      serviceTypeCode: detail.service?.serviceTypeCode || "",
      serviceCode: detail.service?.code || "",
      serviceCatalogCode: detail.serviceCatalog?.code || "",
    },
    customer: !order.customer?.id
      ? null
      : {
          id: order.customer.id,
          name: order.customer.name ?? "",
          phone: order.customer.phone ?? "",
        },
  };

  return {
    id, // chính là ID đơn hàng
    request,
  };
}
