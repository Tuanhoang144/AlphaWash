"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useQuickInvoiceManager } from "@/services/useQuickInvoiceManager";
import { useCustomerManager } from "@/services/useCustomerManager";
import useApiService from "@/config/useApi";
import {
  QuickServiceGroup,
  RecentVehicle,
  QuickServiceItem,
} from "@/types/QuickInvoice";
import { CustomerDTO, VehicleDTO } from "@/types/OrderResponse";
import { OrderCreateRequest } from "@/types/OrderCreateRequest";

type Step = "vehicle" | "services";
type PaymentMethod = "Cash" | "Transfer" | "Card" | "Unpaid";

export interface PrintBillData {
  orderCode: string;
  date: Date;
  customer: { name: string; phone: string } | null;
  vehicle: { licensePlate: string; brandName: string; modelName: string; size: string } | null;
  services: { name: string; quantity: number; price: number }[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
}

const FAVORITES_KEY = "quick-invoice-favorites";
const ANALYTICS_KEY = "quick-invoice-analytics";

function loadFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveFavorites(codes: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(codes));
}

function formatLocalTime(date: Date): string {
  return date.toTimeString().slice(0, 8); // "HH:MM:SS"
}

function formatLocalDateTime(date: Date): string {
  return date.toISOString().slice(0, 19); // "YYYY-MM-DDTHH:MM:SS"
}

export function useQuickInvoice() {
  const { getGroupedServices, getRecentVehicles } = useQuickInvoiceManager();
  const { getCustomersByPhoneOrPlate, createCustomer } = useCustomerManager();
  const { callApi } = useApiService();

  const [step, setStep] = useState<Step>("vehicle");
  const [customer, setCustomer] = useState<CustomerDTO | null>(null);
  const [vehicle, setVehicle] = useState<VehicleDTO | null>(null);
  const [vehicleSize, setVehicleSize] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<QuickServiceItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Unpaid");
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const [recentVehicles, setRecentVehicles] = useState<RecentVehicle[]>([]);
  const [serviceGroups, setServiceGroups] = useState<QuickServiceGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerDTO[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [printBillData, setPrintBillData] = useState<PrintBillData | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load initial data
  useEffect(() => {
    async function load() {
      const [services, vehicles] = await Promise.all([
        getGroupedServices(),
        getRecentVehicles(),
      ]);
      setServiceGroups(services);
      setRecentVehicles(vehicles);
      setDataLoaded(true);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced vehicle search
  const searchVehicle = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      searchTimeoutRef.current = setTimeout(async () => {
        setSearching(true);
        try {
          const raw = await getCustomersByPhoneOrPlate(query);
          // callApi already unwraps response.data, so `raw` here is the
          // ApiResponse's `data` field, which getCustomersByPhoneOrPlate
          // wraps again into a single-element array — unwrap that extra level.
          const results = Array.isArray(raw?.[0]) ? raw[0] : raw;
          setSearchResults(results);
          if (results.length === 0 && query.trim().length >= 3) {
            setShowCustomerModal(true);
          }
        } catch {
          setSearchResults([]);
        } finally {
          setSearching(false);
        }
      }, 300);
    },
    [getCustomersByPhoneOrPlate]
  );

  const selectVehicle = useCallback(
    (v: VehicleDTO, c: CustomerDTO) => {
      setVehicle(v);
      setCustomer(c);
      if (!v.size) {
        console.warn(
          `Vehicle ${v.licensePlate} has no size from API, defaulting to "M"`
        );
      }
      setVehicleSize(v.size || "M");
      setStep("services");
      setSearchResults([]);
      setSearchQuery(v.licensePlate);
    },
    []
  );

  const selectRecentVehicle = useCallback(
    (rv: RecentVehicle) => {
      const v: VehicleDTO = {
        id: rv.vehicleId,
        licensePlate: rv.licensePlate,
        brandId: 0,
        brandCode: rv.brandCode,
        brandName: rv.brandName,
        modelId: 0,
        modelCode: rv.modelCode,
        modelName: rv.modelName,
        size: rv.vehicleSize || "M",
        imageUrl: rv.imageUrl || "",
        customerId: rv.customerId,
      };
      const c: CustomerDTO = {
        id: rv.customerId,
        name: rv.customerName,
        phone: rv.customerPhone,
      };
      selectVehicle(v, c);
    },
    [selectVehicle]
  );

  const toggleService = useCallback(
    (serviceCode: string, serviceName: string, catalogs: { catalogCode: string; size: string; price: number }[]) => {
      setSelectedServices((prev) => {
        const existing = prev.find((s) => s.serviceCode === serviceCode);
        if (existing) {
          return prev.filter((s) => s.serviceCode !== serviceCode);
        }
        const match =
          catalogs.find((c) => c.size === vehicleSize) ||
          catalogs.find((c) => c.size === "M") ||
          catalogs[0];
        if (!match) return prev;
        return [
          ...prev,
          {
            catalogCode: match.catalogCode,
            serviceCode,
            serviceName,
            price: match.price,
            quantity: 1,
            size: match.size,
          },
        ];
      });
    },
    [vehicleSize]
  );

  const toggleFavorite = useCallback((serviceCode: string) => {
    setFavorites((prev) => {
      const next = prev.includes(serviceCode)
        ? prev.filter((c) => c !== serviceCode)
        : [...prev, serviceCode];
      saveFavorites(next);
      return next;
    });
  }, []);

  const subtotal = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0),
    [selectedServices]
  );

  const discountAmount = useMemo(() => Math.round(subtotal * discount / 100), [subtotal, discount]);
  const total = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);

  const buildOrderRequest = useCallback((): OrderCreateRequest | null => {
    if (!vehicle || selectedServices.length === 0) return null;
    const now = new Date();
    return {
      customerId: customer?.id,
      licensePlate: vehicle.licensePlate,
      brandCode: vehicle.brandCode,
      modelCode: vehicle.modelCode,
      imageUrl: vehicle.imageUrl || "",
      vehicleNote: "",
      date: formatLocalDateTime(now),
      checkInTime: formatLocalTime(now),
      checkOutTime: null,
      paymentType: paymentMethod === "Unpaid" ? "" : paymentMethod,
      paymentStatus: paymentMethod === "Unpaid" ? "Pending" : "Paid",
      tip: 0,
      vat: 0,
      discount,
      totalPrice: total,
      note: "",
      orderDetails: [
        {
          employeeIds: [],
          services: selectedServices.map((s) => ({
            serviceCatalogCode: s.catalogCode,
            adjustedPrice: 0,
            adjustedPriceFlag: false,
            adjustedPriceReason: "",
            quantity: s.quantity,
          })),
          status: "PENDING",
          note: "",
          licensePlate: vehicle.licensePlate,
          brandCode: vehicle.brandCode,
          modelCode: vehicle.modelCode,
          imageUrl: vehicle.imageUrl || "",
          vehicleNote: "",
        },
      ],
    };
  }, [vehicle, customer, selectedServices, paymentMethod, discount, total]);

  const createInvoice = useCallback(async () => {
    const request = buildOrderRequest();
    if (!request) return null;
    setCreating(true);
    try {
      const createRes = await callApi("post", "orders/create-order", request);
      const orderId: string = createRes?.data;
      if (!orderId) return null;

      // Analytics (best-effort)
      const elapsed = Date.now() - startTimeRef.current;
      try {
        const analytics = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || "{}");
        analytics.invoicesCreated = (analytics.invoicesCreated || 0) + 1;
        const prevTotal = (analytics.avgCreationTimeMs || 0) * ((analytics.invoicesCreated || 1) - 1);
        analytics.avgCreationTimeMs = Math.round((prevTotal + elapsed) / analytics.invoicesCreated);
        localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
      } catch { /* analytics is best-effort */ }

      // Fetch full order to get order code
      let orderCode = orderId.slice(0, 8).toUpperCase();
      try {
        const orderRes = await callApi("get", `orders/${orderId}`);
        if (orderRes?.data?.code) orderCode = orderRes.data.code;
      } catch { /* fall back to abbreviated uuid */ }

      setPrintBillData({
        orderCode,
        date: new Date(),
        customer: customer ? { name: customer.name, phone: customer.phone } : null,
        vehicle: vehicle
          ? {
              licensePlate: vehicle.licensePlate,
              brandName: vehicle.brandName,
              modelName: vehicle.modelName,
              size: vehicleSize,
            }
          : null,
        services: selectedServices.map((s) => ({
          name: s.serviceName,
          quantity: s.quantity,
          price: s.price,
        })),
        subtotal,
        discountPercent: discount,
        discountAmount,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === "Unpaid" ? "Chưa thanh toán" : "Đã thanh toán",
      });

      return orderId;
    } finally {
      setCreating(false);
    }
  }, [buildOrderRequest, callApi, customer, vehicle, vehicleSize, selectedServices, subtotal, discount, discountAmount, total, paymentMethod]);

  const closePrintBill = useCallback(() => setPrintBillData(null), []);

  const resetForm = useCallback(() => {
    setStep("vehicle");
    setCustomer(null);
    setVehicle(null);
    setVehicleSize("");
    setSelectedServices([]);
    setDiscount(0);
    setPaymentMethod("Unpaid");
    setSearchQuery("");
    setSearchResults([]);
    startTimeRef.current = Date.now();
  }, []);

  const goBackToVehicle = useCallback(() => {
    setStep("vehicle");
    setCustomer(null);
    setVehicle(null);
    setVehicleSize("");
    setSelectedServices([]);
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  return {
    step,
    customer,
    vehicle,
    vehicleSize,
    selectedServices,
    discount,
    paymentMethod,
    favorites,
    recentVehicles,
    serviceGroups,
    searchQuery,
    searchResults,
    searching,
    creating,
    showCustomerModal,
    dataLoaded,
    subtotal,
    discountAmount,
    total,

    searchVehicle,
    selectVehicle,
    selectRecentVehicle,
    toggleService,
    setDiscount,
    setPaymentMethod: setPaymentMethod as (m: string) => void,
    toggleFavorite,
    createInvoice,
    resetForm,
    goBackToVehicle,
    setShowCustomerModal,
    setSearchQuery,
    printBillData,
    closePrintBill,
  };
}
