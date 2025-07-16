import { Employee } from './Employee';
import { Service } from './Service';

export type EmployeeSkill = {
  id: number;
  employee?: Employee;
  service?: Service;
}
