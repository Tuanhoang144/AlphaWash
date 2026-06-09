import type {
  OrderResponseDTO,
  ServiceCatalogDTO,
  ServiceDTO,
} from "@/types/OrderResponse";

const getServiceLineTotal = (service: ServiceDTO): number => {
  const unitPrice =
    service.adjustedPriceFlag == true && service.adjustedPriceReason
      ? service.adjustedPrice
      : service.serviceCatalog?.listedPrice || 0;
  const qty = service.quantity >= 1 ? service.quantity : 1;
  return unitPrice * qty;
};

const calculateDiscountFromOrder = (order: OrderResponseDTO): number => {
  const serviceTotalBeforeTaxAndDiscount =
    order.orderDetails?.reduce(
      (sum, detail) =>
        sum +
        detail.service.reduce(
          (serviceSum, service) => serviceSum + getServiceLineTotal(service),
          0
        ),
      0
    ) || 0;

  let discountAmount = order.discount || 0;
  if (discountAmount < 100) {
    discountAmount = Math.round(
      (serviceTotalBeforeTaxAndDiscount * discountAmount) / 100
    );
  }

  return discountAmount;
};

const calculateVatFromOrder = (order: OrderResponseDTO): number => {
  const serviceTotalBeforeTaxAndDiscount =
    order.orderDetails?.reduce(
      (sum, detail) =>
        sum +
        detail.service.reduce(
          (serviceSum, service) => serviceSum + getServiceLineTotal(service),
          0
        ),
      0
    ) || 0;

  let discountAmount = order.discount || 0;
  if (order.discount && order.discount < 100) {
    discountAmount =
      (serviceTotalBeforeTaxAndDiscount * (order.discount || 0)) / 100;
  }

  const amountAfterDiscount = serviceTotalBeforeTaxAndDiscount - discountAmount;

  return Math.round((amountAfterDiscount * (order.vat || 0)) / 100);
};

const calculateTotal = (order: OrderResponseDTO) => {
  const serviceTotalBeforeTaxAndDiscount =
    order.orderDetails?.reduce(
      (sum, detail) =>
        sum +
        detail.service.reduce(
          (serviceSum, service) => serviceSum + getServiceLineTotal(service),
          0
        ),
      0
    ) || 0;

  let discountAmount = order.discount || 0;
  if (order.discount && order.discount < 100) {
    discountAmount =
      (serviceTotalBeforeTaxAndDiscount * (order.discount || 0)) / 100;
  }

  const amountAfterDiscount = serviceTotalBeforeTaxAndDiscount - discountAmount;

  const vatAmount = Math.round((amountAfterDiscount * (order.vat || 0)) / 100);

  return Math.round(amountAfterDiscount + vatAmount);
};

const calculateBaseServicePrice = (order: OrderResponseDTO) => {
  if (!order?.orderDetails) return 0;
  return order.orderDetails.reduce(
    (sum, detail) =>
      sum +
      detail.service.reduce((serviceSum, service) => {
        const unitPrice = service.adjustedPriceFlag
          ? service.adjustedPrice
          : service.serviceCatalog?.listedPrice || 0;
        const qty = service.quantity >= 1 ? service.quantity : 1;
        return serviceSum + unitPrice * qty;
      }, 0),
    0
  );
};

const calculatePriceDifference = (
  service: ServiceDTO,
  catalog: ServiceCatalogDTO | undefined
): number => {
  if (!service.adjustedPriceFlag || !service.adjustedPriceReason) {
    return 0;
  }
  return (service.adjustedPrice ?? 0) - (catalog?.listedPrice ?? 0);
};

const getAppliedPrice = (
  service: ServiceDTO,
  catalog: ServiceCatalogDTO | undefined
): number => {
  const unitPrice =
    service.adjustedPriceFlag && service.adjustedPriceReason
      ? service.adjustedPrice ?? 0
      : catalog?.listedPrice ?? 0;
  const qty = service.quantity >= 1 ? service.quantity : 1;
  return unitPrice * qty;
};

const getUnitPrice = (
  service: ServiceDTO,
  catalog: ServiceCatalogDTO | undefined
): number => {
  if (service.adjustedPriceFlag && service.adjustedPriceReason) {
    return service.adjustedPrice ?? 0;
  }
  return catalog?.listedPrice ?? 0;
};

export {
  calculateTotal,
  calculateBaseServicePrice,
  calculateVatFromOrder,
  calculateDiscountFromOrder,
  calculatePriceDifference,
  getAppliedPrice,
  getUnitPrice,
  getServiceLineTotal,
};
