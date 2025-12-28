import type {
  OrderResponseDTO,
  ServiceCatalogDTO,
  ServiceDTO,
} from "@/types/OrderResponse";

const calculateDiscountFromOrder = (order: OrderResponseDTO): number => {
  const serviceTotalBeforeTaxAndDiscount =
    order.orderDetails?.reduce(
      (sum, detail) =>
        sum +
        detail.service.reduce((serviceSum, service) => {
          const price =
            service.adjustedPriceFlag == true && service.adjustedPriceReason
              ? service.adjustedPrice
              : service.serviceCatalog?.listedPrice || 0;
          return serviceSum + price;
        }, 0),
      0
    ) || 0;

  // Tính số tiền giảm giá
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
        detail.service.reduce((serviceSum, service) => {
          const price =
            service.adjustedPriceFlag == true && service.adjustedPriceReason
              ? service.adjustedPrice
              : service.serviceCatalog?.listedPrice || 0;
          return serviceSum + price;
        }, 0),
      0
    ) || 0;

  // Tính số tiền giảm giá
  let discountAmount = order.discount || 0;
  if (order.discount && order.discount < 100) {
    discountAmount =
      (serviceTotalBeforeTaxAndDiscount * (order.discount || 0)) / 100;
  }

  // Số tiền sau khi trừ giảm giá
  const amountAfterDiscount = serviceTotalBeforeTaxAndDiscount - discountAmount;

  // Tính VAT trên số tiền đã trừ giảm giá
  return Math.round((amountAfterDiscount * (order.vat || 0)) / 100);
};

const calculateTotal = (order: OrderResponseDTO) => {
  if (order.orderDetails[0].orderType === "COMBO") {
    const serviceTotalBeforeTaxAndDiscount =
      order.orderDetails?.reduce(
        (sum, detail) =>
          sum +
          detail.service.reduce((serviceSum, service) => {
            const price = detail.service.reduce((serviceSum, service) => {
              const price = service.adjustedPrice;
              return serviceSum + price;
            }, 0);
            return serviceSum + price;
          }, 0),
        0
      ) || 0;

    // Tính số tiền giảm giá
    let discountAmount = order.discount || 0;
    if (order.discount && order.discount < 100) {
      discountAmount =
        (serviceTotalBeforeTaxAndDiscount * (order.discount || 0)) / 100;
    }

    // Số tiền sau khi trừ giảm giá
    const amountAfterDiscount =
      serviceTotalBeforeTaxAndDiscount - discountAmount;

    // Tính VAT trên số tiền đã trừ giảm giá
    const vatAmount = Math.round(
      (amountAfterDiscount * (order.vat || 0)) / 100
    );

    return Math.round(amountAfterDiscount + vatAmount);
  } else {
    const serviceTotalBeforeTaxAndDiscount =
      order.orderDetails?.reduce(
        (sum, detail) =>
          sum +
          detail.service.reduce((serviceSum, service) => {
            const price =
              service.adjustedPriceFlag == true && service.adjustedPriceReason
                ? service.adjustedPrice
                : service.serviceCatalog?.listedPrice || 0;
            return serviceSum + price;
          }, 0),
        0
      ) || 0;

    // Tính số tiền giảm giá
    let discountAmount = order.discount || 0;
    if (order.discount && order.discount < 100) {
      discountAmount =
        (serviceTotalBeforeTaxAndDiscount * (order.discount || 0)) / 100;
    }

    // Số tiền sau khi trừ giảm giá
    const amountAfterDiscount =
      serviceTotalBeforeTaxAndDiscount - discountAmount;

    // Tính VAT trên số tiền đã trừ giảm giá
    const vatAmount = Math.round(
      (amountAfterDiscount * (order.vat || 0)) / 100
    );

    return Math.round(amountAfterDiscount + vatAmount);
  }
};

const calculateBaseServicePrice = (order: OrderResponseDTO) => {
  if (!order?.orderDetails) return 0;
  if (order.orderDetails[0].orderType === "COMBO") {
    return order.orderDetails.reduce(
      (sum, detail) =>
        sum +
        detail.service.reduce((serviceSum, service) => {
          const price = service.adjustedPrice;
          return serviceSum + price;
        }, 0),
      0
    );
  } else {
    return order.orderDetails.reduce(
      (sum, detail) =>
        sum +
        detail.service.reduce((serviceSum, service) => {
          const price = service.adjustedPriceFlag //Chỉ cần check cờ
            ? service.adjustedPrice
            : service.serviceCatalog?.listedPrice || 0;
          return serviceSum + price;
        }, 0),
      0
    );
  }
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
};
