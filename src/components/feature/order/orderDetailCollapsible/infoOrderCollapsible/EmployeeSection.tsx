"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Check, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEmployeeManager } from "@/services/useEmployeeManager";
import { EmployeeDTO } from "@/types/employee/EmployeeDTO";

type Props = {
  selectedEmployees: EmployeeDTO[];
  onEmployeesChange(employees: EmployeeDTO[]): void;
};

export default function EmployeeSection({
  selectedEmployees,
  onEmployeesChange,
}: Props) {
  // =========================================================================
  // STATE - Employee Management
  // =========================================================================

  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const { getAllEmployees } = useEmployeeManager();

  // =========================================================================
  // EFFECT - Load employees on mount
  // =========================================================================

  useEffect(() => {
    (async () => {
      try {
        setEmployees(await getAllEmployees());
      } catch (e) {
        console.error("[EmployeeSelector] Error loading employees:", e);
      }
    })();
  }, [getAllEmployees]);

  // =========================================================================
  // DERIVED - Selected employee IDs for quick lookup
  // =========================================================================

  const selectedIds = useMemo(
    () => new Set(selectedEmployees.map((e) => e.id)),
    [selectedEmployees]
  );

  // =========================================================================
  // HANDLERS - Toggle employee selection
  // =========================================================================

  const toggle = (emp: EmployeeDTO) => {
    onEmployeesChange(
      selectedIds.has(emp.id)
        ? selectedEmployees.filter((e) => e.id !== emp.id)
        : [...selectedEmployees, emp]
    );
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="space-y-2">
      <Label>Nhân viên thực hiện</Label>
      <Popover open={open} onOpenChange={setOpen}>
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
              {employees.map((emp) => {
                const active = selectedIds.has(emp.id);
                return (
                  <button
                    key={emp.id}
                    onClick={() => toggle(emp)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border text-left hover:bg-gray-50 ${
                      active ? "bg-blue-50 border-blue-200" : "border-gray-200"
                    }`}
                  >
                    <span className="font-medium text-sm">{emp.name}</span>
                    {active && <Check className="h-4 w-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {selectedEmployees.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedEmployees.map((emp) => (
            <Badge key={emp.id} variant="secondary" className="text-xs">
              {emp.name}
              <button
                onClick={() => toggle(emp)}
                className="ml-1 rounded-full w-3 h-3 flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
