"use client"

import { useState, useMemo, useEffect } from "react"
import { Table } from "antd"
import { EditOutlined } from "@ant-design/icons"
import { Button } from "@/components/ui/button"
import type { Employee } from "@/types/Employee"
import type { ColumnsType } from "antd/es/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react"

interface EmployeeTableProps {
  employees: Employee[]
  onEditEmployee: (employee: Employee) => void
}

export function EmployeeTable({ employees, onEditEmployee }: EmployeeTableProps) {
  const workStatusOptions = [
    { value: "Working", label: "Đang làm việc" },
    { value: "OnLeave", label: "Nghỉ phép" },
    { value: "Resigned", label: "Đã nghỉ việc" },
  ]

  const getWorkStatusLabel = (value?: string) => {
    if (!value) return "-"
    const found = workStatusOptions.find((o) => o.value === value)
    return found ? found.label : value
  }

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [screenSize, setScreenSize] = useState<"xs" | "sm" | "md" | "lg" | "xl">("lg")

  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees

    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || employee.phone.includes(searchTerm),
    )
  }, [employees, searchTerm])

  const totalItems = filteredEmployees.length
  const safeItemsPerPage = itemsPerPage ?? 5
  const totalPages = Math.ceil(totalItems / safeItemsPerPage)
  const startIndex = (currentPage - 1) * safeItemsPerPage
  const endIndex = startIndex + safeItemsPerPage
  const currentData = filteredEmployees.slice(startIndex, endIndex)

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
        setScrollY("70vh")
      } else if (innerHeight >= 900) {
        setScrollY("65vh")
      } else if (innerHeight >= 700) {
        setScrollY("55vh")
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

  const columns: ColumnsType<Employee> = useMemo(() => {
    const baseColumns: ColumnsType<Employee> = [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: screenSize === "xs" ? 50 : 60,
        fixed: screenSize === "xs" ? false : "left",
        align: "center",
      },
      {
        title: "Tên",
        dataIndex: "name",
        key: "name",
        width: screenSize === "xs" ? 120 : screenSize === "sm" ? 130 : 150,
        fixed: screenSize === "xs" ? false : "left",
        render: (text: string) => <span className="font-medium">{text}</span>,
      },
      {
        title: "Điện thoại",
        dataIndex: "phone",
        key: "phone",
        width: screenSize === "xs" ? 110 : 120,
      },
    ]

    if (screenSize !== "xs") {
      baseColumns.push({
        title: "Ngân hàng",
        dataIndex: "bankName",
        key: "bankName",
        width: screenSize === "sm" ? 120 : 150,
      })
    }

    if (screenSize !== "xs" && screenSize !== "sm") {
      baseColumns.push({
        title: "Số tài khoản",
        dataIndex: "bankAccount",
        key: "bankAccount",
        width: 150,
      })
    }

    if (screenSize === "lg" || screenSize === "xl") {
      baseColumns.push({
        title: "Ngày sinh",
        dataIndex: "dateOfBirth",
        key: "dateOfBirth",
        width: 120,
        render: (date: string) => (date ? new Date(date).toLocaleDateString() : "-"),
      })
    }

    if (screenSize !== "xs") {
      baseColumns.push({
        title: "CMND/CCCD",
        dataIndex: "identityNumber",
        key: "identityNumber",
        width: screenSize === "sm" ? 110 : 120,
      })
    }

    if (screenSize === "md" || screenSize === "lg" || screenSize === "xl") {
      baseColumns.push({
        title: "Ngày vào làm",
        dataIndex: "joinDate",
        key: "joinDate",
        width: 120,
        render: (date: string) => (date ? new Date(date).toLocaleDateString() : "-"),
      })
    }

    baseColumns.push({
      title: "Trạng thái",
      dataIndex: "workStatus",
      key: "workStatus",
      width: screenSize === "xs" ? 100 : 120,
      render: (status: string) => getWorkStatusLabel(status),
    })

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
      render: (_, record: Employee) => (
        <Button variant="ghost" size={screenSize === "xs" ? "sm" : "icon"} onClick={() => onEditEmployee(record)}>
          <EditOutlined className={screenSize === "xs" ? "h-3 w-3" : "h-4 w-4"} />
        </Button>
      ),
    })

    return baseColumns
  }, [screenSize, onEditEmployee])

  if (employees.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">Không có nhân viên nào để hiển thị.</div>
  }

  return (
    <div className="container">
      <Table
        columns={columns}
        dataSource={currentData}
        rowKey="id"
        scroll={{
          x: screenSize === "xs" ? 600 : "max-content",
          y: scrollY,
          scrollToFirstRowOnChange: true,
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
      />

      {(filteredEmployees.length > 0 || totalPages > 0) && (
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
              <span className="text-sm text-gray-500 ml-4">Tổng: {filteredEmployees.length} kết quả</span>
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
