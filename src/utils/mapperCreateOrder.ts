import { OrderDetailDTO, OrderResponseDTO } from "@/types/OrderResponse";

import type {
  BasicInformationRequest,
  BasicVehicleRequest,
  BasicServiceRequest,
  BasicCustomerRequest,
  OrderRequestDTO,
} from "@/types/OrderRequest";

export function mapFullOrderToRequest(order: OrderResponseDTO): OrderRequestDTO {
  const detail: OrderDetailDTO = order.orderDetails[0]; // giả sử chỉ có 1 detail

  const basicInformation: BasicInformationRequest = {
    date:
      order.orderDate && order.orderDate.length === 10
        ? `${order.orderDate}T00:00:00`
        : order.orderDate,
    checkinTime: order.checkIn,
    checkoutTime: order.checkOut,
    paymentType: order.paymentType,
    status: detail.status,
    paymentStatus: order.paymentStatus,
    tip: order.tip,
    discount: order.discount,
    vat: order.vat,
    totalPrice: order.totalPrice,
    note: order.note || null,
    employeeId: detail.employees.map((e) => e.id).join(","), // nhiều ID cách nhau bằng dấu phẩy
  };

  const basicVehicle: BasicVehicleRequest = {
    licensePlate: detail.vehicle.licensePlate,
    brandCode: detail.vehicle.brandCode,
    modelCode: detail.vehicle.modelCode,
    note: detail.note,
  };

  const basicService: BasicServiceRequest = {
    serviceTypeCode: detail.service.serviceTypeCode,
    serviceCode: detail.service.code,
    serviceCatalogCode: detail.serviceCatalog?.code,
  };

  const basicCustomer: BasicCustomerRequest | null = !order.customer?.id
    ? null
    : {
        id: order.customer.id,
        name: order.customer.name ?? "",
        phone: order.customer.phone ?? "",
      };

  return {
    information: basicInformation,
    vehicle: basicVehicle,
    service: basicService,
    customer: basicCustomer,
  };
}
