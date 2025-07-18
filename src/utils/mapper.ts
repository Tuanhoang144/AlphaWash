import type {
  OrderDTO as FullOrderDTO,
  OrderDetail,
  Vehicle,
  Customer,
  Employee,
  Service,
  ServiceCatalog,
} from "../app/(admin)/order/create/types/invoice";

import type {
  OrderDTO as OrderRequestDTO,
  BasicInformationRequest,
  BasicVehicleRequest,
  BasicServiceRequest,
  BasicCustomerRequest,
} from "@/types/OrderRequest";

export function mapFullOrderToRequest(order: FullOrderDTO): OrderRequestDTO {
  const detail: OrderDetail = order.orderDetails[0]; // giả sử chỉ có 1 detail

  const basicInformation: BasicInformationRequest = {
    date:
      order.orderDate && order.orderDate.length === 10
        ? `${order.orderDate}T00:00:00`
        : order.orderDate,
    checkInTime: order.checkIn,
    checkOutTime: order.checkOut,
    paymentType: order.paymentType,
    paymentStatus: order.paymentStatus,
    tip: order.tip,
    discount: order.discount,
    vat: order.vat,
    totalPrice: order.totalPrice,
    note: order.note || "null",
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

  const basicCustomer: BasicCustomerRequest = {
    id: order.customer?.customerId ?? "",
    name: order.customer?.customerName ?? "Khách lẻ",
    phone: order.customer?.phone ?? "",
  };
  return {
    information: basicInformation,
    vehicle: basicVehicle,
    service: basicService,
    customer: basicCustomer,
  };
}
