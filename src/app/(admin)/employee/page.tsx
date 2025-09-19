"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { EmployeeDialog } from "./components/dialog";
import { EmployeeTable } from "./components/table";
import { EmployeeManagementHeader } from "./components/header";
import { useEmployeeManager } from "@/services/useEmployeeManager";
import { Employee } from "@/types/Employee";
import { add } from "date-fns";
import { addToast } from "@heroui/toast";

function ManageEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { getAllEmployees, insertEmployee, updateEmployee } =
    useEmployeeManager();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getAllEmployees();
        setEmployees(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách nhân viên:", error);
      }
    };
    fetchEmployees();
  }, [getAllEmployees]);

  const handleAddEmployee = () => {
    setCurrentEmployee(null);
    setIsDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleSaveEmployee = async (
    employeeData: Omit<Employee, "id"> & { id?: number }
  ) => {
    try {
      if (employeeData.id) {
        await updateEmployee(employeeData.id, employeeData);
        addToast({
          title: "Thành công",
          description: "Cập nhật nhân viên thành công.",
          color: "success",
        });
      } else {
        await insertEmployee(employeeData);
        addToast({
          title: "Thành công",
          description: "Tạo mới nhân viên thành công.",
          color: "success",
        });
      }
      const updated = await getAllEmployees();
      setEmployees(updated);
      setIsDialogOpen(false); // Đóng dialog sau khi save thành công
    } catch (error: any) {
      console.error("Lỗi khi lưu nhân viên:", error);
      
      // Hiển thị lỗi lên toast
      const errorMessage = error.message || "Có lỗi xảy ra khi lưu nhân viên";
      addToast({
        title: "Lỗi",
        description: errorMessage,
        color: "danger",
      });
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    const lowerSearch = searchTerm.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(lowerSearch) ||
        emp.phone.includes(lowerSearch) ||
        emp.identityNumber?.includes(lowerSearch) ||
        emp.workStatus?.toLowerCase().includes(lowerSearch)
    );
  }, [employees, searchTerm]);

  return (
    <SidebarInset>
      <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4 z-100">
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

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="container mx-auto py-8 px-4">
          <EmployeeManagementHeader
            onAddEmployee={handleAddEmployee}
            onSearch={setSearchTerm}
          />
          <EmployeeTable
            employees={filteredEmployees}
            onEditEmployee={handleEditEmployee}
          />
          <EmployeeDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            employee={currentEmployee}
            onSave={handleSaveEmployee}
          />
        </div>
      </div>
    </SidebarInset>
  );
}

export default ManageEmployees;
