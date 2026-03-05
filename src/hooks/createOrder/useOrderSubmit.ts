"use client";

import { useCreateOrder } from "@/services/order/useCreateOrder";
import { CustomerDTO } from "@/types/customer/CustomerDTO";
import {
  CreateOrderDetailRequest,
  CreateOrderRequest,
} from "@/types/order/CreateOrderRequest";
import { OrderDetailDTO } from "@/types/order/OrderDetailDTO";
import { PromotionDTO } from "@/types/promotion/PromotionDTO";
import { addToast } from "@heroui/toast";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useOrderSubmit() {
  const now = dayjs();
  const router = useRouter();
  const [formSubmitting, setFormSubmitting] = useState<CreateOrderRequest>({
    customerId: "",
    date: now.format("YYYY-MM-DD"),
    checkIn: now.format("HH:mm"),
    checkOut: now.add(1, "hour").format("HH:mm"),
    paymentType: "",
    paymentStatus: "PENDING",
    vat: 0,
    tip: 0,
    discount: 0,
    noteOrder: "",
    totalPrice: 0,
    orderDetails: [],
  });
  const { createOrder, loading: creatingOrder } = useCreateOrder();

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDTO | null>(
    null,
  );
  const [date, setDate] = useState<string | null>(formSubmitting.date);
  const [checkInTime, setCheckInTime] = useState<string | null>(
    formSubmitting.checkIn,
  );
  const [checkOutTime, setCheckOutTime] = useState<string | null>(
    formSubmitting.checkOut,
  );
  const [selectedPromotion, setSelectedPromotion] =
    useState<PromotionDTO | null>(null);
  const [paymentType, setPaymentType] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("PENDING");
  const [vat, setVat] = useState<number>(0);
  const [tip, setTip] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [noteOrder, setNoteOrder] = useState<string>("");
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [orderDetails, setOrderDetails] = useState<OrderDetailDTO[] | null>([
    {
      employees: [],
      statusProcess: "PENDING",
      vehicle: {
        id: "",
        licensePlate: "",
        brandId: 0,
        brandCode: "",
        brandName: "",
        modelId: 0,
        modelCode: "",
        modelName: "",
        imageUrl: "",
        size: "",
      },
      noteDetail: "",
      services: [
        {
          orderType: "SERVICE",
          name: "",
          serviceCatalog: undefined,
          serviceComboCatalog: undefined,
          adjustedPriceReason: "",
          adjustedPrice: 0,
          note: "",
        },
      ],
    },
  ]);

  const handleCustomerChange = (customer: CustomerDTO | null) => {
    setSelectedCustomer(customer);
    setFormSubmitting((prev) => ({
      ...prev,
      customerId: customer ? customer.id : "",
    }));
  };

  const handleDateChange = (date: string) => {
    setDate(date);
    setFormSubmitting((prev) => ({
      ...prev,
      date,
    }));
  };

  const handleCheckInChange = (checkIn: string) => {
    setCheckInTime(checkIn);
    setFormSubmitting((prev) => ({
      ...prev,
      checkIn,
    }));
  };

  const handleCheckOutChange = (checkOut: string) => {
    setCheckOutTime(checkOut);
    setFormSubmitting((prev) => ({
      ...prev,
      checkOut,
    }));
  };

  const handleOrderDetailsChange = (details: OrderDetailDTO[]) => {
    setOrderDetails(details);

    const requestDetails: CreateOrderDetailRequest[] = details.map(
      (detail) => ({
        employees: detail.employees.map((emp) => String(emp.id)),
        statusProcess: detail.statusProcess || "PENDING",
        licensePlate: detail.vehicle?.licensePlate || "",
        brandCode: detail.vehicle?.brandCode || "",
        modelCode: detail.vehicle?.modelCode || "",
        imageUrl: detail.vehicle?.imageUrl || "",
        noteDetail: detail.noteDetail || "",
        services: detail.services.map((svc) => ({
          orderType: svc.orderType || "SERVICE",
          serviceCatalogCode: svc.serviceCatalog ? svc.serviceCatalog.code : "",
          serviceComboCatalogCode: svc.serviceComboCatalog
            ? svc.serviceComboCatalog.catalogCode
            : "",
          adjustedPriceReason: svc.adjustedPriceReason || "",
          adjustedPrice: svc.adjustedPrice ?? 0,
          noteService: svc.note || "",
        })),
      }),
    );

    setFormSubmitting((prev) => ({
      ...prev,
      orderDetails: requestDetails,
    }));
  };

  const handlePromotionChange = (promotion: PromotionDTO | null) => {
    setSelectedPromotion(promotion);
    setDiscount(promotion ? promotion.value || 0 : 0);
    setFormSubmitting((prev) => ({
      ...prev,
      discount: promotion ? promotion.value || 0 : 0,
      promotionId: promotion ? promotion.promoId : undefined,
    }));
  };

  const handlePaymentTypeChange = (type: string) => {
    setPaymentType(type);
    setFormSubmitting((prev) => ({
      ...prev,
      paymentType: type,
    }));
  };

  const handlePaymentStatusChange = (status: string) => {
    setPaymentStatus(status);
    setFormSubmitting((prev) => ({
      ...prev,
      paymentStatus: status,
    }));
  };

  const handleVatChange = (vatValue: number) => {
    setVat(vatValue);
    setFormSubmitting((prev) => ({
      ...prev,
      vat: vatValue,
    }));
  };

  const handleTipChange = (tipValue: number) => {
    setTip(tipValue);
    setFormSubmitting((prev) => ({
      ...prev,
      tip: tipValue,
    }));
  };

  const handleDiscountChange = (discountValue: number) => {
    setDiscount(discountValue);
    setFormSubmitting((prev) => ({
      ...prev,
      discount: discountValue,
    }));
  };

  const handleNoteOrderChange = (note: string) => {
    setNoteOrder(note);
    setFormSubmitting((prev) => ({
      ...prev,
      noteOrder: note,
    }));
  };

  const [subTotal, setSubTotal] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [priceAfterDiscount, setPriceAfterDiscount] = useState<number>(0);
  const [vatAmount, setVatAmount] = useState<number>(0);

  const calculateSubTotal = () => {
    let total = 0;
    (orderDetails ?? []).forEach((detail) => {
      detail.services.forEach((service) => {
        total += service.adjustedPrice || 0;
      });
    });
    return total;
  };

  const calculateDiscountAmount = (subTotal: number) => {
    if (subTotal <= 0) return 0;

    if (discount < 100) {
      // % chiết khấu
      return Math.round((subTotal * discount) / 100);
    } else {
      // Số tiền cố định
      return Math.min(discount, subTotal); // tránh chiết khấu âm
    }
  };

  const calculatePriceAfterDiscount = (
    subTotal: number,
    discountAmount: number,
  ) => {
    return Math.max(0, subTotal - discountAmount);
  };

  const calculateVatAmount = (priceAfterDiscount: number) => {
    if (priceAfterDiscount <= 0) return 0;
    return Math.round((priceAfterDiscount * vat) / 100);
  };

  useEffect(() => {
    // Tính toán lại các giá trị liên quan đến tổng tiền khi có sự thay đổi
    const subTotal = calculateSubTotal();
    setSubTotal(subTotal);
    // Tính toán các giá trị phụ thuộc
    const discountAmount = calculateDiscountAmount(subTotal);
    setDiscountAmount(discountAmount);
    const priceAfterDiscount = calculatePriceAfterDiscount(
      subTotal,
      discountAmount,
    );
    setPriceAfterDiscount(priceAfterDiscount);
    const vatAmount = calculateVatAmount(priceAfterDiscount);
    setVatAmount(vatAmount);
    // Cập nhật tổng tiền cuối cùng
    setTotalPrice(priceAfterDiscount + vatAmount);
    setFormSubmitting((prev) => ({
      ...prev,
      totalPrice: priceAfterDiscount + vatAmount,
    }));
  }, [formSubmitting.orderDetails, vat, discount]);

  const handleSubmit = async () => {
    try {
      await createOrder(formSubmitting);
      addToast({
        title: "Thành công",
        description: "Hóa đơn đã được tạo!",
        color: "success",
      });
      router.push("/order/table");
    } catch (error: any) {
      console.error(error);
      addToast({
        title: "Lỗi",
        description: error?.message || "Không thể tạo hóa đơn",
        color: "danger",
      });
    }
  };

  const handleNavigateToPayment = async () => {
    try {
      const orderId = await createOrder(formSubmitting);
      addToast({
        title: "Thành công",
        description: "Hóa đơn đã được tạo!",
        color: "success",
      });
      router.push(`/order/${orderId}/payment`);
    } catch (error: any) {
      console.error(error);
      addToast({
        title: "Lỗi",
        description: error?.message || "Không thể tạo hóa đơn",
        color: "danger",
      });
    }
  };

  console.log("Form Submitting", formSubmitting);

  return {
    selectedCustomer,
    handleCustomerChange,
    date,
    handleDateChange,
    checkInTime,
    handleCheckInChange,
    checkOutTime,
    handleCheckOutChange,
    orderDetails,
    handleOrderDetailsChange,
    selectedPromotion,
    handlePromotionChange,
    paymentType,
    handlePaymentTypeChange,
    paymentStatus,
    handlePaymentStatusChange,
    vat,
    handleVatChange,
    tip,
    handleTipChange,
    discount,
    handleDiscountChange,
    noteOrder,
    handleNoteOrderChange,
    totalPrice,
    subTotal,
    discountAmount,
    priceAfterDiscount,
    vatAmount,
    handleSubmit,
    handleNavigateToPayment,
  };
}
