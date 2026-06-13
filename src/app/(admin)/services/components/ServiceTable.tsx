"use client"

import { useState, useMemo, useEffect } from "react"
import { Table, Tag } from "antd"
import { EditOutlined } from "@ant-design/icons"
import { Button } from "@/components/ui/button"
import type { ServiceAll } from "@/types/ServiceAll"
import type { ColumnsType } from "antd/es/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react"

interface ServiceTableProps {
  services: ServiceAll[]
  onEditService: (services: ServiceAll[]) => void // Changed to accept array of services
  startIndex?: number
}

interface GroupedService {
  key: string
  serviceTypeName: string
  serviceTypeCode: string
  serviceName: string
  serviceCode: string
  sizeS?: { price: number }
  sizeM?: { price: number }
  sizeL?: { price: number }
  duration?: string
  note?: string
  originalServices: ServiceAll[] // Keep reference to original services for editing
}

export function ServiceTable({ services, onEditService, startIndex = 0 }: ServiceTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [screenSize, setScreenSize] = useState<"xs" | "sm" | "md" | "lg" | "xl">("lg")

  const groupedServices = useMemo((): GroupedService[] => {
    const grouped: { [key: string]: GroupedService } = {}

    services.forEach((service) => {
      const key = `${service.serviceTypeCode}-${service.serviceCode}`

      if (!grouped[key]) {
        grouped[key] = {
          key,
          serviceTypeName: service.serviceTypeName,
          serviceTypeCode: service.serviceTypeCode,
          serviceName: service.serviceName,
          serviceCode: service.serviceCode,
          originalServices: [],
          note: service.note ?? undefined,
          duration: service.duration ?? undefined,
        }
      }

      if (service.size === "S") {
        grouped[key].sizeS = {
          price: service.price,
        }
      } else if (service.size === "M") {
        grouped[key].sizeM = {
          price: service.price,
        }
      } else if (service.size === "L") {
        grouped[key].sizeL = {
          price: service.price,
        }
      }

      grouped[key].originalServices.push(service)
    })

    return Object.values(grouped)
  }, [services])

  const totalItems = groupedServices.length
  const safeItemsPerPage = itemsPerPage ?? 5
  const totalPages = Math.ceil(totalItems / safeItemsPerPage)
  const startIndexCalc = (currentPage - 1) * safeItemsPerPage
  const endIndex = startIndexCalc + safeItemsPerPage
  const currentData = groupedServices.slice(startIndexCalc, endIndex)

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const goToFirstPage = () => setCurrentPage(1)
  const goToLastPage = () => setCurrentPage(totalPages)
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1))
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1))
  const goToPage = (page: number) => setCurrentPage(page)

  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(1, currentPage - 2)
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  const [scrollY, setScrollY] = useState("55vh")

  useEffect(() => {
    const updateScrollHeight = () => {
      const { innerHeight, innerWidth } = window

      if (innerWidth >= 1280) {
        setScreenSize("xl")
      } else if (innerWidth >= 1024) {
        setScreenSize("lg")
      } else if (innerWidth >= 768) {
        setScreenSize("md")
      } else if (innerWidth >= 640) {
        setScreenSize("sm")
      } else {
        setScreenSize("xs")
      }

      if (innerHeight >= 1200) {
        setScrollY("65vh")
      } else if (innerHeight >= 900) {
        setScrollY("60vh")
      } else if (innerHeight >= 700) {
        setScrollY("50vh")
      } else {
        setScrollY("40vh")
      }
    }

    updateScrollHeight()

    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateScrollHeight, 200)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [services.length])

  const columns: ColumnsType<GroupedService> = useMemo(() => {
    const baseColumns: ColumnsType<GroupedService> = [
      {
        title: "STT",
        key: "stt",
        width: screenSize === "xs" ? 50 : 60,
        fixed: screenSize === "xs" ? false : "left",
        align: "center",
        render: (_, __, index) => startIndexCalc + index + 1,
      },
      {
        title: "Mã loại Dịch Vụ",
        dataIndex: "serviceTypeCode",
        key: "serviceTypeCode",
        width: 120,
        onCell: (record, index) => {
          let rowSpan = 1
          if (index !== undefined) {
            const currentType = record.serviceTypeName
            const prevRecord = index > 0 ? currentData[index - 1] : null

            if (prevRecord && prevRecord.serviceTypeName === currentType) {
              rowSpan = 0
            } else {
              for (let i = index + 1; i < currentData.length; i++) {
                if (currentData[i].serviceTypeName === currentType) {
                  rowSpan++
                } else {
                  break
                }
              }
            }
          }
          return { rowSpan }
        },
      },
      {
        title: "Loại Dịch Vụ",
        dataIndex: "serviceTypeName",
        key: "serviceTypeName",
        width: screenSize === "xs" ? 100 : 120,
        fixed: screenSize === "xs" ? false : "left",
        render: (text: string) => (
          <Tag color={text === "WASHING" ? "blue" : text === "DETAILING" ? "green" : "orange"}>{text}</Tag>
        ),
        onCell: (record, index) => {
          let rowSpan = 1
          if (index !== undefined) {
            const currentType = record.serviceTypeName
            const prevRecord = index > 0 ? currentData[index - 1] : null

            if (prevRecord && prevRecord.serviceTypeName === currentType) {
              rowSpan = 0
            } else {
              for (let i = index + 1; i < currentData.length; i++) {
                if (currentData[i].serviceTypeName === currentType) {
                  rowSpan++
                } else {
                  break
                }
              }
            }
          }
          return { rowSpan }
        },
      },
      {
        title: "Mã Dịch Vụ",
        dataIndex: "serviceCode",
        key: "serviceCode",
        width: screenSize === "xs" ? 80 : 100,
      },
      {
        title: "Tên Dịch Vụ",
        dataIndex: "serviceName",
        key: "serviceName",
        width: screenSize === "xs" ? 150 : 200,
        render: (text: string) => <span className="font-medium">{text}</span>,
      },
    ]

    baseColumns.push({
      title: "Giá theo Size",
      key: "pricing",
      children: [
        {
          title: "Size S",
          key: "sizeS",
          width: screenSize === "xs" ? 100 : 120,
          align: "right" as const,
          render: (record: GroupedService) =>
            record.sizeS ? (
              <div>
                <div className="font-semibold text-green-600">{record.sizeS.price.toLocaleString()} đ</div>
              </div>
            ) : (
              <span className="text-gray-400">-</span>
            ),
        },
        {
          title: "Size M",
          key: "sizeM",
          width: screenSize === "xs" ? 100 : 120,
          align: "right" as const,
          render: (record: GroupedService) =>
            record.sizeM ? (
              <div>
                <div className="font-semibold text-blue-600">{record.sizeM.price.toLocaleString()} đ</div>
              </div>
            ) : (
              <span className="text-gray-400">-</span>
            ),
        },
        {
          title: "Size L",
          key: "sizeL",
          width: screenSize === "xs" ? 100 : 120,
          align: "right" as const,
          render: (record: GroupedService) =>
            record.sizeL ? (
              <div>
                <div className="font-semibold text-orange-600">{record.sizeL.price.toLocaleString()} đ</div>
              </div>
            ) : (
              <span className="text-gray-400">-</span>
            ),
        },
      ],
    })

    if (screenSize !== "xs") {
      baseColumns.push({
        title: "Thời lượng",
        dataIndex: "duration",
        key: "duration",
        width: screenSize === "sm" ? 100 : 120,
        align: "center",
        render: (text: string | undefined) => text || "-",
      })
    }

    if (screenSize === "lg" || screenSize === "xl") {
      baseColumns.push({
        title: "Ghi chú",
        dataIndex: "note",
        key: "note",
        width: 150,
        render: (text: string) => text || "-",
      })
    }

    baseColumns.push({
      title: "Thao tác",
      key: "action",
      width: screenSize === "xs" ? 80 : 100,
      fixed: screenSize === "xs" ? false : "right",
      align: "center",
      render: (_, record: GroupedService) => (
        <Button
          variant="ghost"
          size={screenSize === "xs" ? "sm" : "icon"}
          onClick={() => {
            onEditService(record.originalServices)
          }}
        >
          <EditOutlined className={screenSize === "xs" ? "h-3 w-3" : "h-4 w-4"} />
        </Button>
      ),
    })

    return baseColumns
  }, [screenSize, onEditService, startIndexCalc, currentData])

  if (services.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">Không có dịch vụ nào để hiển thị.</div>
  }

  return (
    <div className="container">
      <Table
        columns={columns}
        dataSource={currentData}
        rowKey="key"
        scroll={{
          x: screenSize === "xs" ? 800 : "max-content",
          y: scrollY,
        }}
        locale={{
          emptyText: (
            <div className="flex flex-col items-center gap-4 py-12">
              <Search className="h-12 w-12 text-gray-400" />
              <p className="text-lg text-gray-600">Không tìm thấy kết quả nào</p>
            </div>
          ),
        }}
        sticky={{ offsetHeader: 64 }}
        pagination={false}
        size={screenSize === "xs" ? "small" : "small"}
        className="w-full rounded-lg border bg-white shadow-sm mb-6"
        bordered
      />

      {(groupedServices.length > 0 || totalPages > 0) && (
        <div className="bg-white border rounded-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-2 py-4 px-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Hiển thị</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-[80px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">bản ghi</span>
              <span className="text-sm text-gray-500 ml-4">Tổng: {groupedServices.length} nhóm dịch vụ</span>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="hidden sm:flex h-9 px-3 bg-transparent"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="h-9 px-3 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Trước</span>
              </Button>

              <div className="flex space-x-1">
                {getPageNumbers().map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className="h-9 w-9 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="h-9 px-3 bg-transparent"
              >
                <span className="hidden sm:inline mr-1">Sau</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="hidden sm:flex h-9 px-3 bg-transparent"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
