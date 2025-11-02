export function tool() {
  const getStatusVehicleColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
      case "PROCESSING":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
    }
  };

  const getStatusVehicleLabel = (status: string) => {
    switch (status) {
      case "DONE":
        return "Thi công xong";
      case "PROCESSING":
        return "Đang thi công";
      case "PENDING":
        return "Chờ thi công";
      default:
        return "Chờ thi công";
    }
  };

  const getStatusPaymentLabel = (status: string) => {
    switch (status) {
      case "DONE":
        return "Đã thanh toán";
      case "PENDING":
        return "Chờ thanh toán";
      default:
        return "Chờ thanh toán";
    }
  };

  const getStatusPaymentColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getCarSizeInfo = (size: "S" | "M" | "L") => {
    switch (size) {
      case "S":
        return {
          color:
            "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
          label: "Nhỏ",
          description: "Xe máy, xe nhỏ",
        };
      case "M":
        return {
          color:
            "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
          label: "Vừa",
          description: "Sedan, Hatchback",
        };
      case "L":
        return {
          color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
          label: "Lớn",
          description: "SUV, Pickup",
        };
      default:
        return {
          color: "bg-gray-50 text-gray-700 border-gray-200",
          label: size,
          description: "",
        };
    }
  };

  function formatDate(dateStr: any): string {
    if (!dateStr) return "";

    // Xử lý ISO string với timezone để tránh chuyển đổi múi giờ
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      // Lấy phần date từ ISO string: 2025-09-09T17:00:00.000+00:00 -> 2025-09-09
      const datePart = dateStr.split('T')[0];
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    }

    // Fallback cho các format khác
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return "Không hợp lệ";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const formatDateToDDMMYYYY = (isoDate: string) => {
    if (!isoDate) return "";
    
    // Xử lý ISO string với timezone để tránh chuyển đổi múi giờ
    if (isoDate.includes('T')) {
      // Lấy phần date từ ISO string: 2025-09-09T17:00:00.000+00:00 -> 2025-09-09
      const datePart = isoDate.split('T')[0];
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Fallback cho các format khác
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const convertToISO = (ddmmyyyy: string) => {
    if (!ddmmyyyy || ddmmyyyy.length !== 10) return "";
    const [day, month, year] = ddmmyyyy.split("/");
    if (!day || !month || !year) return "";
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  function formatTime(timeStr?: string): string {
    if (!timeStr || typeof timeStr !== "string") return ":";
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return ":";
    const hour = String(h).padStart(2, "0");
    const minute = String(m).padStart(2, "0");
    return `${hour}:${minute}`;
  }

  return {
    getStatusVehicleColor,
    getStatusVehicleLabel,
    getStatusPaymentColor,
    getStatusPaymentLabel,
    getCarSizeInfo,
    formatDateToDDMMYYYY,
    convertToISO,
    formatDate,
    formatTime,
  };
}
