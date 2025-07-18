"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Check } from "lucide-react";
import type { Employee } from "../types/invoice";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEmployeeManager } from "@/services/useEmployeeManager";

interface EmployeeSelectorProps {
  selectedEmployees: Employee[];
  onEmployeesChange: (employees: Employee[]) => void;
}

export default function EmployeeSelector({
  selectedEmployees,
  onEmployeesChange,
}: EmployeeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { getAllEmployees } = useEmployeeManager();
  const [employees, setEmployees] = useState<Employee[]>([]);

  const toggleEmployee = (employee: Employee) => {
    const isSelected = selectedEmployees.some((emp) => emp.id === employee.id);
    if (isSelected) {
      onEmployeesChange(
        selectedEmployees.filter((emp) => emp.id !== employee.id)
      );
    } else {
      onEmployeesChange([...selectedEmployees, employee]);
    }
  };

  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const all = await getAllEmployees();
        setEmployees(all);
      } catch (err) {
        console.error("Lỗi khi tải danh sách nhân viên:", err);
      }
    };
    fetchAvailable();
  }, [getAllEmployees]);

  return (
    <div className="space-y-2">
      <Label>Nhân viên thực hiện</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start bg-transparent"
          >
            <Users className="h-4 w-4 mr-2" />
            {selectedEmployees.length > 0
              ? `Đã chọn ${selectedEmployees.length} nhân viên`
              : "Chọn nhân viên thực hiện"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium">Chọn nhân viên</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {employees.map((employee) => {
                const isSelected = selectedEmployees.some(
                  (emp) => emp.id === employee.id
                );
                return (
                  <div
                    key={employee.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                      isSelected
                        ? "bg-blue-50 border border-blue-200"
                        : "border border-gray-200"
                    }`}
                    onClick={() => toggleEmployee(employee)}
                  >
                    <div>
                      <div className="font-medium text-sm">{employee.name}</div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {selectedEmployees.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedEmployees.map((employee) => (
            <Badge key={employee.id} variant="secondary" className="text-xs">
              {employee.name}
              <button
                onClick={() => toggleEmployee(employee)}
                className="ml-1 hover:bg-gray-300 rounded-full w-3 h-3 flex items-center justify-center"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
