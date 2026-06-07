"use client"

import { useState, useMemo, useEffect } from "react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { EmployeeDialog } from "./components/dialog"
import { EmployeeTable } from "./components/table"
import { EmployeeManagementHeader } from "./components/header"
import { useEmployeeManager } from "@/services/useEmployeeManager"
import type { Employee } from "@/types/Employee"
import { addToast } from "@heroui/toast"

function ManageEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const { getAllEmployees, insertEmployee, updateEmployee } = useEmployeeManager()

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getAllEmployees()
        setEmployees(data)
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhân viên:", error)
      }
    }
    fetchEmployees()
  }, [getAllEmployees])

  const handleAddEmployee = () => {
    setCurrentEmployee(null)
    setIsDialogOpen(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setCurrentEmployee(employee)
    setIsDialogOpen(true)
  }

  const handleSaveEmployee = async (employeeData: Omit<Employee, "id"> & { id?: number }) => {
    try {
      if (employeeData.id) {
        await updateEmployee(employeeData.id, employeeData)
        addToast({
          title: "Thành công",
          description: "Cập nhật nhân viên thành công.",
          color: "success",
        })
      } else {
        await insertEmployee(employeeData)
        addToast({
          title: "Thành công",
          description: "Tạo mới nhân viên thành công.",
          color: "success",
        })
      }
      const updated = await getAllEmployees()
      setEmployees(updated)
      setIsDialogOpen(false) // Đóng dialog sau khi save thành công
    } catch (error: any) {
      console.error("Lỗi khi lưu nhân viên:", error)

      // Hiển thị lỗi lên toast
      const errorMessage = error.message || "Có lỗi xảy ra khi lưu nhân viên"
      addToast({
        title: "Lỗi",
        description: errorMessage,
        color: "danger",
      })
    }
  }

  const filteredEmployees = useMemo(() => {
    // Filter first by search term
    let list = employees
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      list = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(lowerSearch) ||
          emp.phone.includes(lowerSearch) ||
          emp.identityNumber?.includes(lowerSearch) ||
          emp.workStatus?.toLowerCase().includes(lowerSearch),
      )
    }

    // Then sort: workStatus 'đang làm việc' first, then by joinDate (most recent first)
    const statusPriority = (s?: string) => {
      const st = s?.toLowerCase().trim()
      if (!st) return 1
      if (st === "working") return 0
      if (st === "resigned") return 2
      return 1
    }

    return [...list].sort((a, b) => {
      const pa = statusPriority(a.workStatus)
      const pb = statusPriority(b.workStatus)
      if (pa !== pb) return pa - pb

      // parse joinDate; if missing, treat as very old
      const da = a.joinDate ? Date.parse(a.joinDate) : 0
      const db = b.joinDate ? Date.parse(b.joinDate) : 0
      return db - da // most recent first
    })
  }, [employees, searchTerm])

  return (
    <SidebarInset className="relative w-full">
      <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4 z-10">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Quản lý nhân viên</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="container absolute top-16 .center-conditional left-1/2 -translate-x-1/2">
        <div className="p-6">
          <EmployeeManagementHeader onAddEmployee={handleAddEmployee} onSearch={setSearchTerm} />
        </div>
        <div className="px-6">
          <EmployeeTable employees={filteredEmployees} onEditEmployee={handleEditEmployee} />
        </div>
        <EmployeeDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          employee={currentEmployee}
          onSave={handleSaveEmployee}
        />
      </div>
    </SidebarInset>
  )
}

export default ManageEmployees
