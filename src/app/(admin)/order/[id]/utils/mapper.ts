import {
  Customer,
  Vehicle,
  Employee,
  Service,
  ServiceCatalog,
  OrderDetail,
  OrderDTO
} from "../types/invoice";

export function mapRawApiToOrderDTO(data: any): OrderDTO {
  const rawDetail = data.orderDetails[0];

  const customer: Customer = {
    customerId: data.customer?.id || "",
    customerName: data.customer?.customerName || "Khách lẻ",
    phone: data.customer?.phone || "",
    vehicles: [], // optional
  };

  const vehicle: Vehicle = {
    id: rawDetail.vehicle.id,
    licensePlate: rawDetail.vehicle.licensePlate,
    brandId: rawDetail.vehicle.brandId,
    brandCode: rawDetail.vehicle.brandCode || "",
    brandName: rawDetail.vehicle.brandName,
    modelId: rawDetail.vehicle.modelId,
    modelCode: rawDetail.vehicle.modelCode || "",
    modelName: rawDetail.vehicle.modelName,
    size: rawDetail.vehicle.size,
    imageUrl: rawDetail.vehicle.imageUrl ?? "",
    customerId: customer.customerId || undefined,
  };

  const employees: Employee[] = (rawDetail.employees || []).map((e: any) => ({
    id: e.id.toString(),
    name: e.employeeName,
    position: "", // không có trong payload gốc
    isAvailable: true, // giả định luôn sẵn sàng
  }));

  const serviceCatalog: ServiceCatalog = {
    id: rawDetail.service.serviceCatalog.id,
    code: rawDetail.service.serviceCatalog.serviceCatalogCode,
    size: rawDetail.service.serviceCatalog.size,
    price: rawDetail.service.serviceCatalog.price,
  };

  const service: Service = {
    id: rawDetail.service.id,
    code: rawDetail.service.serviceCode,
    serviceName: rawDetail.service.serviceName,
    duration: "",
    note: "",
    serviceTypeCode: rawDetail.service.serviceTypeCode || "",
  };

  const orderDetail: OrderDetail = {
    employees,
    vehicle,
    service,
    serviceCatalog,
    status: rawDetail.status,
    note: rawDetail.note !== "null" ? rawDetail.note : null,
  };

  const order: OrderDTO = {
    orderDate: data.orderDate,
    checkIn: data.checkIn,
    checkOut: data.checkOut ?? "",
    tip: data.tip,
    paymentType: data.paymentType,
    paymentStatus: data.paymentStatus,
    vat: data.vat,
    discount: data.discount,
    totalPrice: data.totalPrice,
    note: data.note !== "null" ? data.note : null,
    customer,
    orderDetails: [orderDetail],
  };

  return order;
}
