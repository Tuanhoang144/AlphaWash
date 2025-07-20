import type {
  OrderDTO as FullOrderDTO,
  OrderDetail,
  Vehicle,
  Customer,
  Employee,
  Service,
  ServiceCatalog,
} from "../app/(admin)/order/create/types/invoice";

export interface OrderUpdateRequest {
  id: string;
  request: {
    information: BasicInformationRequest;
    vehicle: BasicVehicleRequest;
    service: BasicServiceRequest;
    customer: BasicCustomerRequest | null;
  };
}
export interface BasicInformationRequest {
  date: string;
  checkinTime: string;
  checkoutTime: string;
  paymentType: string;
  paymentStatus: string;
  tip: number;
  status: string; // Thêm status
  discount: number;
  vat: number;
  totalPrice: number;
  note: string;
  employeeId: string; // có thể là "id1,id2"
}

export interface BasicVehicleRequest {
  licensePlate: string;
  brandCode: string;
  modelCode: string;
  note?: string;
}

export interface BasicServiceRequest {
  serviceTypeCode: string;
  serviceCode: string;
  serviceCatalogCode?: string;
}

export interface BasicCustomerRequest {
  id: string;
  name: string;
  phone: string;
}

export function mapFullOrderToUpdateRequest(
  id: string,
  order: FullOrderDTO
): OrderUpdateRequest {
  const detail: OrderDetail = order.orderDetails[0]; // chỉ lấy 1 chi tiết
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
    customer: !order.customer?.customerId
      ? null
      : {
          id: order.customer.customerId,
          name: order.customer.customerName ?? "",
          phone: order.customer.phone ?? "",
        },
  };

  return {
    id, // chính là ID đơn hàng
    request,
  };
}
