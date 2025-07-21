"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { EmployeeDialog } from "./components/dialog";
import { EmployeeTable } from "./components/table";
import { EmployeeManagementHeader } from "./components/header";
import { useEmployeeManager } from "@/services/useEmployeeManager";
import { Employee } from "@/types/Employee";

function ManageEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    getAllEmployees,
    insertEmployee,
    updateEmployee,
  } = useEmployeeManager();

  // ✅ Load danh sách nhân viên khi mở trang
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
    setCurrentEmployee(employee); // Sửa
    setIsDialogOpen(true);
  };

  const handleSaveEmployee = async (
    employeeData: Omit<Employee, "id"> & { id?: number }
  ) => {
    try {
      if (employeeData.id) {
        // ✅ Cập nhật
        await updateEmployee(
          employeeData.id!,
          { ...employeeData, id: employeeData.id!.toString() }
        );
      } else {
        // ✅ Thêm mới
        await insertEmployee({
          name: employeeData.name,
          phone: employeeData.phone,
          note: employeeData.note,
        });
      }

      // Sau khi thêm/sửa thì load lại danh sách
      const updated = await getAllEmployees();
      setEmployees(updated);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Lỗi khi lưu nhân viên:", error);
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    const lowerSearch = searchTerm.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(lowerSearch) ||
        emp.phone.includes(lowerSearch)
    );
  }, [employees, searchTerm]);

  return (
    <SidebarInset>
      <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
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
