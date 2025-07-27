"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { CreditCard, Printer, Save, ArrowLeft } from "lucide-react"
import { useOrderManager } from "@/services/useOrderManager"
import type { OrderResponseDTO } from "@/types/OrderResponse"
import { addToast } from "@heroui/react"
import PaymentFormContent from "./components/payment-form-content"
import InvoiceTemplate from "./components/invoice-template"

export default function PaymentAndInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { getOrderById, updateOrder, loading } = useOrderManager()

  const [order, setOrder] = useState<OrderResponseDTO | null>(null)
  const [activeTab, setActiveTab] = useState<"payment" | "invoice">("payment")

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await getOrderById(id)
        if (orderData) {
          setOrder(orderData)
        } else {
          addToast({
            title: "Lỗi",
            description: "Không tìm thấy đơn hàng",
            color: "danger",
          })
          router.push("/order/table")
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        addToast({
          title: "Lỗi",
          description: "Không thể tải thông tin đơn hàng",
          color: "danger",
        })
      }
    }

    if (id) {
      fetchOrder()
    }
  }, [id, getOrderById, router])

  const handlePaymentChange = (field: string, value: string | number) => {
    if (!order) return
    setOrder((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const handleSavePayment = async () => {
    if (!order) return

    try {
      const updatedOrder = await updateOrder(order, id)
      setOrder(updatedOrder)
      addToast({
        title: "Thành công",
        description: "Thông tin thanh toán đã được cập nhật!",
        color: "success",
      })
    } catch (error) {
      console.error("Error updating payment:", error)
      addToast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin thanh toán",
        color: "danger",
      })
    }
  }

  const calculateBaseServicePrice = () => {
    if (!order?.orderDetails) return 0
    return order.orderDetails.reduce(
      (sum, detail) =>
        sum + detail.service.reduce((serviceSum, service) => serviceSum + (service.serviceCatalog?.price || 0), 0),
      0,
    )
  }

  const calculateTotal = () => {
    if (!order) return 0
    const basePrice = calculateBaseServicePrice()
    const vatAmount = (basePrice * (order.vat || 0)) / 100
    const discountAmount = (basePrice * (order.discount || 0)) / 100
    return Math.round(basePrice + vatAmount - discountAmount)
  }

  if (loading || !order) {
    return (
      <SidebarInset>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-blue-600 mb-4">Đang tải thông tin thanh toán...</h1>
            <p className="text-gray-700">Vui lòng chờ trong giây lát.</p>
          </div>
        </div>
      </SidebarInset>
    )
  }

  const baseServicePrice = calculateBaseServicePrice()
  const totalPrice = calculateTotal()
  const firstVehicleLicensePlate = order.orderDetails?.[0]?.vehicle.licensePlate || null

  return (
    <SidebarInset>
      <header className="sticky z-10 top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/order/table">Theo dõi xe ra vào xưởng</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/order/${id}`}>Chi tiết phiếu rửa xe</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbPage>Thanh toán & In hóa đơn</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Thanh Toán & In Hóa Đơn</h1>
              <p className="text-gray-600 mt-2">Quản lý thanh toán và in hóa đơn cho đơn hàng #{id}</p>
            </div>
            <Button variant="outline" onClick={() => router.back()} className="bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6">
            <Button
              variant={activeTab === "payment" ? "default" : "outline"}
              onClick={() => setActiveTab("payment")}
              className={activeTab === "payment" ? "" : "bg-transparent"}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Thanh Toán
            </Button>
            <Button
              variant={activeTab === "invoice" ? "default" : "outline"}
              onClick={() => setActiveTab("invoice")}
              className={activeTab === "invoice" ? "" : "bg-transparent"}
            >
              <Printer className="h-4 w-4 mr-2" />
              In Hóa Đơn
            </Button>
          </div>

          {/* Content */}
          {activeTab === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Thông Tin Thanh Toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentFormContent
                  paymentType={order.paymentType || ""}
                  paymentStatus={order.paymentStatus || ""}
                  vat={order.vat || 0}
                  discount={order.discount || 0}
                  tip={order.tip || 0}
                  note={order.note ?? null}
                  totalPrice={totalPrice}
                  baseServicePrice={baseServicePrice}
                  onPaymentChange={handlePaymentChange}
                  customer={order.customer}
                  licensePlate={firstVehicleLicensePlate}
                />
                <div className="flex justify-end mt-6 space-x-4">
                  <Button onClick={handleSavePayment} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Lưu Thông Tin Thanh Toán
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("invoice")} className="bg-transparent">
                    <Printer className="h-4 w-4 mr-2" />
                    Chuyển đến In Hóa Đơn
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "invoice" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Xem Trước & In Hóa Đơn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InvoiceTemplate order={order} baseServicePrice={baseServicePrice} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SidebarInset>
  )
}
