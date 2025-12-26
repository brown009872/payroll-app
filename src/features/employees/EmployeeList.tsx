import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { EmployeeForm } from './EmployeeForm';
import type { Employee } from '../../types';
import { Edit2, Trash2, UserPlus } from 'lucide-react';


import { getTodayStr, isDateBetween } from '../../utils/date';

export const EmployeeList: React.FC = () => {
    const { employees, addEmployee, updateEmployee } = useAppStore();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    // Split employees by status
    const resignedEmployees = employees.filter(e => e.status === 'resigned');

    const today = getTodayStr();

    // Check for Active employees that are currently on leave => show in Inactive list or separate?
    // Requirement 2b: "If Status = Inactive OR valid leave dates -> Inactive list".
    // So 'inactiveEmployees' includes explicit 'inactive' status.
    // What about 'active' status but valid leave dates?
    // "The employee should appear in the Inactive Employees section... excluded from Active list".

    // Let's refine the lists:
    const onLeaveOrInactiveEmployees = employees.filter(e => {
        if (e.status === 'resigned') return false;
        if (e.status === 'inactive') return true;
        if (e.status === 'active' && e.leaveStartDate && e.leaveEndDate) {
            return isDateBetween(today, e.leaveStartDate, e.leaveEndDate);
        }
        return false;
    });

    const trulyActiveEmployees = employees.filter(e => {
        if (e.status === 'resigned') return false;
        // Exclude if in the On Leave list
        const isOnLeave = e.status === 'inactive' || (e.status === 'active' && e.leaveStartDate && e.leaveEndDate && isDateBetween(today, e.leaveStartDate, e.leaveEndDate));
        return !isOnLeave && e.status === 'active'; // Ensure only active status employees not on leave are truly active
    });

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        setIsFormOpen(true);
    };

    const handleFormSubmit = (data: Omit<Employee, 'id'>) => {
        if (editingEmployee) {
            updateEmployee(editingEmployee.id, data);
        } else {
            addEmployee(data);
        }
        setIsFormOpen(false);
        setEditingEmployee(null);
    }

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to mark this employee as Resigned?')) {
            updateEmployee(id, {
                status: 'resigned',
                resignedDate: getTodayStr()
            });
        }
    };

    const openAddModal = () => {
        setEditingEmployee(null);
        setIsFormOpen(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
                    <p className="text-gray-500 text-sm">Manage your team members</p>
                </div>
                <Button onClick={openAddModal}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Employee
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Active Employees</h3>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {trulyActiveEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                            No active employees found.
                                        </td>
                                    </tr>
                                ) : (
                                    trulyActiveEmployees.map((employee) => (
                                        <tr key={employee.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.fullName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.joinedDate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEdit(employee)} className="text-blue-600 hover:text-blue-900 mr-4">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Mark as Resigned"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Inactive / On Leave Section */}
            {onLeaveOrInactiveEmployees.length > 0 && (
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-medium leading-6 text-orange-700">Inactive Employees (On Leave)</h3>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-orange-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status / Period</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Days</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {onLeaveOrInactiveEmployees.map((employee) => (
                                        <tr key={employee.id} className="hover:bg-gray-50 bg-orange-50/10">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.fullName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {employee.status === 'inactive' ? (
                                                    <span className="px-2 py-1 bg-gray-200 rounded text-xs">Inactive</span>
                                                ) : (
                                                    `${employee.leaveStartDate} to ${employee.leaveEndDate}`
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700">
                                                {employee.leaveTotalDays || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEdit(employee)} className="text-blue-600 hover:text-blue-900">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee.id)}
                                                    className="text-red-600 hover:text-red-900 ml-4"
                                                    title="Mark as Resigned"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {resignedEmployees.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-500 mb-2 px-1">Resigned History</h3>
                    <div className="bg-gray-50 rounded-md p-4 opacity-75">
                        <ul className="space-y-2">
                            {resignedEmployees.map(emp => (
                                <li key={emp.id} className="flex justify-between items-center text-sm text-gray-500">
                                    <span>{emp.fullName} ({emp.position})</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs">Resigned: {emp.resignedDate || 'N/A'}</span>
                                        <button onClick={() => handleEdit(emp)} className="text-blue-600 hover:text-blue-800 p-1">
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <EmployeeForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingEmployee}
            />
        </div>
    );
};
