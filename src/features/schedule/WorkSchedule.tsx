import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store';
import { getTodayStr, getWeekDays, formatDate, isDateBetween, addDays } from '../../utils/date';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import type { WorkScheduleEntry } from '../../types';
import { SmartTimeInput } from '../../components/SmartTimeInput';

export const WorkSchedule: React.FC = () => {
    const { employees, workSchedules, upsertSchedule, deleteScheduleForWeek, weeklyDelays } = useAppStore();
    const [anchorDate, setAnchorDate] = useState(getTodayStr());
    const [selectedEmployeeToAdd, setSelectedEmployeeToAdd] = useState('');

    const weekDays = useMemo(() => getWeekDays(anchorDate), [anchorDate]);
    const startOfWeek = weekDays[0];
    const endOfWeek = weekDays[6];

    // Find all employees that have ANY schedule entry in this week
    const scheduledEmployeeIds = useMemo(() => {
        const ids = new Set<string>();
        weekDays.forEach(day => {
            const dateStr = formatDate(day);
            // Scan all schedules to find matches for this date? 
            // Since workSchedules is key-value, we can't easily query by date without iteration.
            // But we can iterate all employees and check if they have entries?
            // Or since we want to persist "rows", we check if keys exist.
            Object.values(workSchedules).forEach(entry => {
                if (entry.date === dateStr) {
                    ids.add(entry.employeeId);
                }
            });
        });
        return Array.from(ids);
    }, [workSchedules, weekDays]);

    // We also want to allow adding employees who don't have schedules yet.
    // So we maintain a local list of "visible" employees for this session/view?
    // Requirement says: "Add row... removes row"
    // To make "Add row" persist across refreshes without data, we need to create empty entries?
    // Plan: When "Adding row", we don't necessarily need to create data immediately commit, 
    // but the requirement "remove row" implies we stop showing them.
    // If we only show employees with data, then "Adding row" must likely create a dummy entry or 
    // we use a separate persistence for "Who is in the schedule view".
    // Simpler approach: 
    // The view shows employees who are in `scheduledEmployeeIds`.
    // When user clicks "Add", we verify they aren't already there.
    // Then we force them into the list. If they have no data, we might need to store a "blank" entry for at least one day
    // so they show up next time?
    // Actually, "Days with no assignments should appear empty".
    // Let's create an empty entry for the Start of Week when adding an employee, 
    // just to make them "exist" in the store for this week?
    // A WorkScheduleEntry with all false is effectively empty.

    // Combining explicit adds with existing data:
    const [manuallyAddedIds, setManuallyAddedIds] = useState<string[]>([]);

    const visibleEmployeeIds = useMemo(() => {
        const combined = new Set([...scheduledEmployeeIds, ...manuallyAddedIds]);
        return Array.from(combined);
    }, [scheduledEmployeeIds, manuallyAddedIds]);

    const visibleEmployees = useMemo(() => {
        return visibleEmployeeIds
            .map(id => {
                const emp = employees.find(e => e.id === id);
                if (emp) return emp;
                // Fallback for deleted employees
                return {
                    id,
                    fullName: '(Deleted Employee)',
                    position: 'N/A',
                    status: 'inactive',
                    joinedDate: '',
                    basicSalary: 0,
                } as typeof employees[0];
            });
    }, [visibleEmployeeIds, employees]);

    const today = getTodayStr();

    const availableEmployees = useMemo(() => {
        return employees.filter(e => {
            if (visibleEmployeeIds.includes(e.id)) return false;
            if (e.status !== 'active') return false;

            // Filter out if currently on leave
            if (e.leaveStartDate && e.leaveEndDate) {
                if (isDateBetween(today, e.leaveStartDate, e.leaveEndDate)) {
                    return false;
                }
            }
            return true;
        });
    }, [employees, visibleEmployeeIds, today]);

    const handleWeekChange = (direction: number) => {
        const d = new Date(anchorDate);
        d.setDate(d.getDate() + direction * 7);
        setAnchorDate(formatDate(d));
        // Clear manual adds on week change? Usually yes, reload from data
        setManuallyAddedIds([]);
    };

    const handleAddEmployee = () => {
        if (!selectedEmployeeToAdd) return;
        setManuallyAddedIds(prev => [...prev, selectedEmployeeToAdd]);
        // Ideally we should ensure at least one entry exists so they persist if the user refreshes?
        // Let's create an empty entry for the first day of the week to "anchor" them.
        const dateStr = formatDate(weekDays[0]);
        const entry: WorkScheduleEntry = {
            id: crypto.randomUUID(),
            employeeId: selectedEmployeeToAdd,
            date: dateStr,
            morning: false,
            evening: false,
            morningNew: false,
            eveningNew: false
        };
        upsertSchedule(entry);
        setSelectedEmployeeToAdd('');
    };

    const handleRemoveRow = (empId: string, empName: string) => {
        if (confirm(`Remove ${empName} from this week's schedule? This will delete all shift assignments for this week.`)) {
            const dates = weekDays.map(d => formatDate(d));
            deleteScheduleForWeek(empId, dates);
            setManuallyAddedIds(prev => prev.filter(id => id !== empId));
        }
    };

    const toggleShift = (
        empId: string,
        dateStr: string,
        field: keyof Pick<WorkScheduleEntry, 'morning' | 'evening' | 'morningNew' | 'eveningNew'>
    ) => {
        const key = `${dateStr}_${empId}`;
        const existing = workSchedules[key] || {
            id: crypto.randomUUID(),
            employeeId: empId,
            date: dateStr,
            morning: false,
            evening: false,
            morningNew: false,
            eveningNew: false
        };

        const updated = {
            ...existing,
            [field]: !existing[field]
        };
        upsertSchedule(updated);
    };

    const getEntry = (empId: string, dateStr: string) => {
        return workSchedules[`${dateStr}_${empId}`] || {
            morning: false,
            evening: false,
            morningNew: false,
            eveningNew: false
        };
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Work Schedule (Lịch làm việc)</h2>
                    <p className="text-gray-500 text-sm">
                        {formatDate(startOfWeek)} - {formatDate(endOfWeek)}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => handleWeekChange(-1)}>
                        <ChevronLeft className="w-4 h-4" /> Prev Week
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleWeekChange(1)}>
                        Next Week <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <select
                            className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            value={selectedEmployeeToAdd}
                            onChange={e => setSelectedEmployeeToAdd(e.target.value)}
                        >
                            <option value="">Select Employee...</option>
                            {availableEmployees.map(e => (
                                <option key={e.id} value={e.id}>{e.fullName}</option>
                            ))}
                        </select>
                        <Button onClick={handleAddEmployee} disabled={!selectedEmployeeToAdd}>
                            <Plus className="w-4 h-4 mr-2" /> Add row
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm border-collapse border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border border-gray-200">Employee</th>
                                    {weekDays.map(day => (
                                        <th key={day.toISOString()} className="px-2 py-3 text-center font-medium text-gray-500 uppercase tracking-wider border border-gray-200 min-w-[140px]">
                                            {day.toLocaleDateString('en-US', { weekday: 'short' })} <span className="text-xs font-normal">{day.getDate()}/{day.getMonth() + 1}</span>
                                        </th>
                                    ))}
                                    <th className="px-2 py-3 text-center font-medium text-gray-500 uppercase tracking-wider w-10 border border-gray-200"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {visibleEmployees.length === 0 ? (
                                    <tr><td colSpan={9} className="px-6 py-4 text-center text-gray-500">No employees in schedule. Add one above.</td></tr>
                                ) : (
                                    visibleEmployees.map(emp => {
                                        const isOnLeave = emp.leaveStartDate && emp.leaveEndDate && isDateBetween(today, emp.leaveStartDate, emp.leaveEndDate);

                                        // Calculate Pay Day for this week
                                        const delayKey = `${formatDate(endOfWeek)}_${emp.id}`;
                                        const delay = weeklyDelays[delayKey] || 0;
                                        const payDateObj = addDays(endOfWeek, delay);
                                        const payDateStr = formatDate(payDateObj);

                                        return (
                                            <tr key={emp.id} className={isOnLeave ? "bg-gray-50 opacity-75" : "hover:bg-gray-50"}>
                                                <td className="px-3 py-2 font-medium text-gray-900 sticky left-0 bg-white z-10 border border-gray-200 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span>{emp.fullName}</span>
                                                        {isOnLeave && (
                                                            <span className="text-[10px] text-red-600 font-normal px-1.5 py-0.5 bg-red-50 rounded border border-red-100 w-fit mt-1">
                                                                On Leave
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                {weekDays.map(day => {
                                                    const dateStr = formatDate(day);
                                                    const entry = getEntry(emp.id, dateStr);
                                                    const isPayDay = dateStr === payDateStr;
                                                    return (
                                                        <td key={dateStr} className={`p-2 border border-gray-200 align-top ${isPayDay ? 'bg-yellow-50' : ''}`}>
                                                            <div className="flex flex-col gap-1">
                                                                {isPayDay && (
                                                                    <div className="mb-1 flex justify-center" title="Pay Day">
                                                                        <span className="text-lg">💰</span>
                                                                    </div>
                                                                )}
                                                                <label className={`flex items-center space-x-2 text-xs ${isOnLeave ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={entry.morning}
                                                                        onChange={() => !isOnLeave && toggleShift(emp.id, dateStr, 'morning')}
                                                                        disabled={!!isOnLeave}
                                                                        className="rounded text-blue-600 focus:ring-blue-500 disabled:text-gray-400"
                                                                    />
                                                                    <span>Sáng</span>
                                                                </label>
                                                                <label className={`flex items-center space-x-2 text-xs ${isOnLeave ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={entry.evening}
                                                                        onChange={() => !isOnLeave && toggleShift(emp.id, dateStr, 'evening')}
                                                                        disabled={!!isOnLeave}
                                                                        className="rounded text-blue-600 focus:ring-blue-500 disabled:text-gray-400"
                                                                    />
                                                                    <span>Tối</span>
                                                                </label>
                                                                <div className="border-t border-gray-100 my-1"></div>
                                                                <label className={`flex items-center space-x-2 text-xs ${isOnLeave ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} text-orange-600`}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={entry.morningNew}
                                                                        onChange={() => !isOnLeave && toggleShift(emp.id, dateStr, 'morningNew')}
                                                                        disabled={!!isOnLeave}
                                                                        className="rounded text-orange-600 focus:ring-orange-500 disabled:text-gray-400"
                                                                    />
                                                                    <span>Sáng (Mới)</span>
                                                                </label>
                                                                <label className={`flex items-center space-x-2 text-xs ${isOnLeave ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} text-orange-600`}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={entry.eveningNew}
                                                                        onChange={() => !isOnLeave && toggleShift(emp.id, dateStr, 'eveningNew')}
                                                                        disabled={!!isOnLeave}
                                                                        className="rounded text-orange-600 focus:ring-orange-500 disabled:text-gray-400"
                                                                    />
                                                                    <span>Tối (Mới)</span>
                                                                </label>

                                                                <div className="border-t border-gray-100 my-1"></div>

                                                                {/* Custom Shift Section */}
                                                                <div>
                                                                    {entry.customShift?.enabled ? (
                                                                        <div className="space-y-1">
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-[10px] font-bold text-purple-700">Ca gãy</span>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        if (!isOnLeave) {
                                                                                            const updated = { ...entry, customShift: { ...entry.customShift!, enabled: false } };
                                                                                            upsertSchedule(updated);
                                                                                        }
                                                                                    }}
                                                                                    className="text-[10px] text-red-500 hover:underline"
                                                                                >
                                                                                    Hủy
                                                                                </button>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <SmartTimeInput
                                                                                    value={entry.customShift.startTime}
                                                                                    onChange={(val) => {
                                                                                        if (!isOnLeave) {
                                                                                            const updated = { ...entry, customShift: { ...entry.customShift!, startTime: val } };
                                                                                            upsertSchedule(updated);
                                                                                        }
                                                                                    }}
                                                                                    className="w-12 text-[10px] p-0.5 border rounded text-center"
                                                                                    placeholder="Start"
                                                                                />
                                                                                <span className="text-gray-400">-</span>
                                                                                <SmartTimeInput
                                                                                    value={entry.customShift.endTime}
                                                                                    onChange={(val) => {
                                                                                        if (!isOnLeave) {
                                                                                            const updated = { ...entry, customShift: { ...entry.customShift!, endTime: val } };
                                                                                            upsertSchedule(updated);
                                                                                        }
                                                                                    }}
                                                                                    className="w-12 text-[10px] p-0.5 border rounded text-center"
                                                                                    placeholder="End"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => {
                                                                                if (!isOnLeave) {
                                                                                    const updated = {
                                                                                        ...entry,
                                                                                        customShift: {
                                                                                            enabled: true,
                                                                                            startTime: '10:00',
                                                                                            endTime: '22:00'
                                                                                        }
                                                                                    };
                                                                                    upsertSchedule(updated);
                                                                                }
                                                                            }}
                                                                            disabled={!!isOnLeave}
                                                                            className={`text-[10px] text-purple-600 hover:underline w-full text-left ${isOnLeave ? 'cursor-not-allowed opacity-50' : ''}`}
                                                                        >
                                                                            + Ca gãy
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-2 py-2 text-center border border-gray-200">
                                                    <button
                                                        onClick={() => handleRemoveRow(emp.id, emp.fullName)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        title="Remove employee from this week"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
