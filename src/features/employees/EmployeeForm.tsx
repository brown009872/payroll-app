import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import type { Employee } from '../../types';
import { getTodayStr } from '../../utils/date';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface EmployeeFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (employee: Omit<Employee, 'id'>) => void;
    initialData?: Employee | null;
}

interface FormData {
    fullName: string;
    code?: string;
    position: string;
    department?: string;
    basicSalary: number;
    hourlyRate?: number;
    status: 'active' | 'inactive' | 'resigned';
    joinedDate: string;
    resignedDate?: string;
    leaveStartDate?: string;
    leaveEndDate?: string;
    leaveTotalDays?: number;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData
}) => {
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        position: 'Nhân viên',
        basicSalary: 0,
        status: 'active',
        joinedDate: getTodayStr()
    });

    const [isCustomPosition, setIsCustomPosition] = useState(false);
    const [customPosition, setCustomPosition] = useState('');
    const [showResignHistory, setShowResignHistory] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                fullName: initialData.fullName,
                code: initialData.code,
                position: initialData.position,
                department: initialData.department,
                basicSalary: initialData.basicSalary,
                hourlyRate: initialData.hourlyRate,
                status: initialData.status as 'active' | 'inactive' | 'resigned',
                joinedDate: initialData.joinedDate || getTodayStr(),
                resignedDate: initialData.resignedDate,
                leaveStartDate: initialData.leaveStartDate,
                leaveEndDate: initialData.leaveEndDate,
                leaveTotalDays: initialData.leaveTotalDays
            });

            const standards = ['Quản lý', 'Nhân viên'];
            if (initialData.position && !standards.includes(initialData.position)) {
                // If it's a custom position, keep 'position' as is in state, but UI might need logic
                // Actually simpler to just let user type if we prefer
                // mimicking previous logic:
                setIsCustomPosition(true);
                setCustomPosition(initialData.position);
            } else {
                setIsCustomPosition(false);
                setCustomPosition('');
            }

            if (initialData.resignedDate) {
                setShowResignHistory(true);
            }
        } else {
            // Reset
            setFormData({
                fullName: '',
                position: 'Nhân viên',
                basicSalary: 0,
                status: 'active',
                joinedDate: getTodayStr()
            });
            setIsCustomPosition(false);
            setCustomPosition('');
            setShowResignHistory(false);
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let finalPosition = formData.position;
        if (isCustomPosition && customPosition) {
            finalPosition = customPosition;
        }

        onSubmit({
            ...formData,
            position: finalPosition,
            // Ensure types
            basicSalary: Number(formData.basicSalary),
            hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
            leaveTotalDays: formData.leaveTotalDays ? Number(formData.leaveTotalDays) : undefined
        });
        onClose();
    };

    const isAdding = !initialData;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Employee' : 'Add Employee'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code/ID (Optional)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            value={formData.code || ''}
                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Position</label>
                        <div className="mt-1 flex gap-2">
                            {!isCustomPosition ? (
                                <select
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    value={formData.position}
                                    onChange={e => {
                                        if (e.target.value === 'Other') {
                                            setIsCustomPosition(true);
                                            setFormData({ ...formData, position: '' });
                                        } else {
                                            setFormData({ ...formData, position: e.target.value });
                                        }
                                    }}
                                >
                                    <option value="Nhân viên">Nhân viên</option>
                                    <option value="Quản lý">Quản lý</option>
                                    <option value="Other">Khác...</option>
                                </select>
                            ) : (
                                <div className="flex gap-2 w-full">
                                    <input
                                        type="text"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        placeholder="Enter position"
                                        value={customPosition}
                                        onChange={e => setCustomPosition(e.target.value)}
                                    />
                                    <Button type="button" variant="secondary" size="sm" onClick={() => setIsCustomPosition(false)}>Cancel</Button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            value={formData.department || ''}
                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Basic Salary</label>
                        <input
                            type="number"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            value={formData.basicSalary.toString()}
                            onChange={e => {
                                // Parse value to integer to remove leading zeros automatically
                                // e.g. "012" -> 12
                                const val = e.target.value;
                                if (val === '') {
                                    setFormData({ ...formData, basicSalary: 0 });
                                    return;
                                }
                                const num = parseInt(val, 10);
                                setFormData({ ...formData, basicSalary: isNaN(num) ? 0 : num });
                            }}
                            onBlur={() => {
                                // Double check formatting on blur
                                setFormData(prev => ({ ...prev, basicSalary: Number(prev.basicSalary) }));
                            }}
                        />
                    </div>
                    {!isAdding && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'resigned' })}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="resigned">Resigned</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Payroll Settings */}
                <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Payroll Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md">
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Hourly Rate</label>
                            <input
                                type="number"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                value={formData.hourlyRate || ''}
                                onChange={e => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                                placeholder="Default rate"
                            />
                        </div>
                    </div>
                </div>

                {/* Inactive / On Leave Section */}
                <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Inactive / On Leave (Nghỉ phép)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-3 rounded-md">
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Leave Start Date</label>
                            <input
                                type="date"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                value={formData.leaveStartDate || ''}
                                onChange={e => {
                                    const start = e.target.value;
                                    const end = formData.leaveEndDate;
                                    let total = 0;
                                    if (start && end) {
                                        const s = new Date(start);
                                        const E = new Date(end);
                                        if (E >= s) {
                                            const diffTime = Math.abs(E.getTime() - s.getTime());
                                            total = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                        }
                                    }
                                    setFormData({
                                        ...formData,
                                        leaveStartDate: start,
                                        leaveTotalDays: total > 0 ? total : undefined
                                    });
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Leave End Date</label>
                            <input
                                type="date"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                value={formData.leaveEndDate || ''}
                                onChange={e => {
                                    const end = e.target.value;
                                    const start = formData.leaveStartDate;
                                    let total = 0;
                                    if (start && end) {
                                        const s = new Date(start);
                                        const E = new Date(end);
                                        if (E >= s) {
                                            const diffTime = Math.abs(E.getTime() - s.getTime());
                                            total = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                        }
                                    }
                                    setFormData({
                                        ...formData,
                                        leaveEndDate: end,
                                        leaveTotalDays: total > 0 ? total : undefined
                                    });
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Total Days</label>
                            <div className="mt-1 p-2 text-sm text-gray-700 font-medium">
                                {formData.leaveTotalDays ? `${formData.leaveTotalDays} days` : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dropdown for Resign History - Only show when editing */}
                {!isAdding && (
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between cursor-pointer bg-gray-50 p-2 rounded-md" onClick={() => setShowResignHistory(!showResignHistory)}>
                            <span className="text-sm font-medium text-gray-700">Resign history / Joined Date</span>
                            {showResignHistory ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>

                        {showResignHistory && (
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md border">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Joined Date</label>
                                    <input
                                        type="date"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        value={formData.joinedDate || ''}
                                        onChange={e => setFormData({ ...formData, joinedDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Resigned Date</label>
                                    <input
                                        type="date"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        value={formData.resignedDate || ''}
                                        onChange={e => setFormData({ ...formData, resignedDate: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500">
                                        Total service: <span className="font-medium text-gray-900">
                                            {(() => {
                                                if (!formData.joinedDate) return 'N/A';
                                                const start = new Date(formData.joinedDate);
                                                const end = formData.resignedDate ? new Date(formData.resignedDate) : new Date();
                                                if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'N/A';
                                                const diff = end.getTime() - start.getTime();
                                                const days = Math.floor(diff / (1000 * 3600 * 24));
                                                return days > 0 ? `${days} days` : '0 days';
                                            })()}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} className="mr-2">
                        Cancel
                    </Button>
                    <Button type="submit">
                        {initialData ? 'Update' : 'Add'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
