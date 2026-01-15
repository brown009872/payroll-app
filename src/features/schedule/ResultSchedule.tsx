
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store';
import { getTodayStr, getWeekDays, formatDate } from '../../utils/date';
import { Button } from '../../components/ui/Button';
import { ChevronLeft, ChevronRight, Download, Save, Share2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { exportScheduleToExcel } from '../../utils/excelGenerator';
import { message } from 'antd';
import { SmartTimeInput } from '../../components/SmartTimeInput';
import { EMPLOYEE_COLORS } from '../../types';

export const ResultSchedule: React.FC = () => {
    const { employees, workSchedules, upsertSchedule, deleteScheduleForWeek } = useAppStore();
    const [anchorDate, setAnchorDate] = useState(getTodayStr());

    // Single Quick Assign State (merged morning + afternoon)
    const [selectedEmployee, setSelectedEmployee] = useState('');

    // Mobile view toggle: 'full' or 'mini'
    const [mobileView, setMobileView] = useState<'full' | 'mini'>('mini');



    const weekDays = useMemo(() => getWeekDays(anchorDate), [anchorDate]);
    const startOfWeek = weekDays[0];
    const endOfWeek = weekDays[6];
    const weekLabel = `${formatDate(startOfWeek)} to ${formatDate(endOfWeek)}`;

    // Get color classes for employee (custom or fallback to hash-based)
    const getColor = (emp: typeof employees[0]) => {
        if (emp.color) {
            const colorConfig = EMPLOYEE_COLORS.find(c => c.id === emp.color);
            if (colorConfig) {
                return `${colorConfig.bg} ${colorConfig.text}`;
            }
        }
        // Fallback to hash-based color
        const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800', 'bg-pink-100 text-pink-800', 'bg-yellow-100 text-yellow-800'];
        let hash = 0;
        for (let i = 0; i < emp.fullName.length; i++) hash = emp.fullName.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    // Get initials from full name (e.g., "Nguyễn Văn An" -> "NVA")
    const getInitials = (name: string) => {
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3);
    };

    // Max visible cards before showing "+N more"
    const MAX_VISIBLE_CARDS = 3;

    // Check if employee is on leave for a given date
    const isEmployeeOnLeave = (emp: typeof employees[0], dateStr: string): boolean => {
        if (!emp.leaveStartDate || !emp.leaveEndDate) return false;
        return dateStr >= emp.leaveStartDate && dateStr <= emp.leaveEndDate;
    };

    // Get employees on leave for a specific date
    const getEmployeesOnLeave = (dateStr: string) => {
        return employees.filter(emp => isEmployeeOnLeave(emp, dateStr));
    };

    // Calculate max employees on leave across the week for consistent alignment
    const maxLeaveCount = useMemo(() => {
        return Math.max(0, ...weekDays.map(day => getEmployeesOnLeave(formatDate(day)).length));
    }, [weekDays, employees]);

    const handleWeekChange = (direction: number) => {
        const d = new Date(anchorDate);
        d.setDate(d.getDate() + direction * 7);
        setAnchorDate(formatDate(d));
    };

    // Data Transformation: Map Store to localized efficient structure
    const scheduleGrid = useMemo(() => {
        const grid: Record<string, { morning: typeof employees, afternoon: typeof employees }> = {};

        weekDays.forEach(day => {
            const dateStr = formatDate(day);
            grid[dateStr] = { morning: [], afternoon: [] };

            employees.forEach(emp => {
                const key = `${dateStr}_${emp.id}`;
                const entry = workSchedules[key];
                if (entry?.morning) grid[dateStr].morning.push(emp);
                if (entry?.evening) grid[dateStr].afternoon.push(emp);
            });
        });
        return grid;
    }, [workSchedules, employees, weekDays]);

    // Get custom shift for employee on date
    const getCustomShift = (empId: string, dateStr: string) => {
        const key = `${dateStr}_${empId}`;
        return workSchedules[key]?.customShift;
    };

    // Drag & Drop Handlers
    const handleDragStart = (e: React.DragEvent, empId: string, fromDate: string, fromZone: 'morning' | 'afternoon') => {
        e.dataTransfer.setData('empId', empId);
        e.dataTransfer.setData('fromDate', fromDate);
        e.dataTransfer.setData('fromZone', fromZone);
    };

    const handleDrop = (e: React.DragEvent, toDate: string, toZone: 'morning' | 'afternoon') => {
        e.preventDefault();
        const empId = e.dataTransfer.getData('empId');
        const fromDate = e.dataTransfer.getData('fromDate');
        const fromZone = e.dataTransfer.getData('fromZone');

        if (!empId) return;

        // Check if employee is on leave for target date
        const emp = employees.find(e => e.id === empId);
        if (emp && isEmployeeOnLeave(emp, toDate)) {
            message.warning(`${emp.fullName} đang nghỉ phép ngày này`);
            return;
        }

        // Remove from source
        const removeKey = `${fromDate}_${empId}`;
        const removeEntry = workSchedules[removeKey];
        if (removeEntry) {
            const updatedSource = { ...removeEntry };
            if (fromZone === 'morning') updatedSource.morning = false;
            else updatedSource.evening = false;
            upsertSchedule(updatedSource);
        }

        // Add to dest
        const addKey = `${toDate}_${empId}`;
        const addEntry = workSchedules[addKey] || {
            id: crypto.randomUUID(),
            employeeId: empId,
            date: toDate,
            morning: false,
            evening: false,
            morningNew: false,
            eveningNew: false
        };
        const updatedDest = { ...addEntry };
        if (toZone === 'morning') updatedDest.morning = true;
        else updatedDest.evening = true;

        upsertSchedule(updatedDest);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    // Helper for safe UUID generation
    const generateUUID = (): string => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            try {
                return crypto.randomUUID();
            } catch (e) {
                console.warn('[generateUUID] crypto.randomUUID failed, using fallback');
            }
        }
        return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    };

    // Unified zone click handler - uses single selectedEmployee for both zones
    const handleZoneClick = (dateStr: string, zone: 'morning' | 'afternoon') => {
        console.log(`[handleZoneClick] ${selectedEmployee} → ${dateStr} ${zone}`);

        if (!selectedEmployee) {
            console.log(`[handleZoneClick] No employee selected, returning`);
            return;
        }

        // Check if employee is on leave
        const emp = employees.find(e => e.id === selectedEmployee);
        if (emp && isEmployeeOnLeave(emp, dateStr)) {
            console.log(`[handleZoneClick] Employee on leave, showing warning`);
            message.warning(`${emp.fullName} đang nghỉ phép ngày này`);
            return;
        }

        const key = `${dateStr}_${selectedEmployee}`;
        // Find existing schedule entry for this date/employee
        const entry = workSchedules[key];

        let updated;

        if (!entry) {
            console.log(`[handleZoneClick] No schedule found for key: ${key}, creating new.`);
            updated = {
                id: generateUUID(),
                employeeId: selectedEmployee,
                date: dateStr,
                morning: false,
                evening: false,
                morningNew: false,
                eveningNew: false
            };
        } else {
            updated = { ...entry };
        }

        const currentValue = zone === 'morning' ? updated.morning : updated.evening;
        const newValue = !currentValue;

        console.log(`[handleZoneClick] Toggling ${zone}: ${currentValue} → ${newValue}`);

        if (zone === 'morning') updated.morning = newValue;
        else updated.evening = newValue;

        // Call upsert which handles both create and update
        upsertSchedule(updated);
        console.log(`[handleZoneClick] upsertSchedule called with`, updated);
    };

    // Simplified handler - rely on React's standard onClick which handles both mouse and touch taps correctly
    const handleCellInteraction = (dateStr: string, zone: 'morning' | 'afternoon') => () => {
        handleZoneClick(dateStr, zone);
    };

    const handleRemove = (e: React.MouseEvent, empId: string, dateStr: string, zone: 'morning' | 'afternoon') => {
        e.stopPropagation();
        const key = `${dateStr}_${empId}`;
        const entry = workSchedules[key];
        if (entry) {
            const updated = { ...entry };
            if (zone === 'morning') updated.morning = false;
            else updated.evening = false;
            upsertSchedule(updated);
        }
    };

    // Ca gãy (custom shift) handlers
    const handleEnableCaGay = (empId: string, dateStr: string) => {
        const key = `${dateStr}_${empId}`;
        const entry = workSchedules[key] || {
            id: crypto.randomUUID(),
            employeeId: empId,
            date: dateStr,
            morning: false,
            evening: false,
            morningNew: false,
            eveningNew: false
        };
        const updated = {
            ...entry,
            customShift: {
                enabled: true,
                startTime: '10:00',
                endTime: '22:00'
            }
        };
        upsertSchedule(updated);
    };

    const handleDisableCaGay = (empId: string, dateStr: string) => {
        const key = `${dateStr}_${empId}`;
        const entry = workSchedules[key];
        if (entry) {
            const updated = { ...entry, customShift: { ...entry.customShift!, enabled: false } };
            upsertSchedule(updated);
        }
    };

    const handleCaGayTimeChange = (empId: string, dateStr: string, field: 'startTime' | 'endTime', value: string) => {
        const key = `${dateStr}_${empId}`;
        const entry = workSchedules[key];
        if (entry?.customShift) {
            const updated = { ...entry, customShift: { ...entry.customShift, [field]: value } };
            upsertSchedule(updated);
        }
    };

    const handleExport = () => {
        const morningShifts: Record<string, string[]> = {};
        const afternoonShifts: Record<string, string[]> = {};

        weekDays.forEach(day => {
            const d = formatDate(day);
            morningShifts[d] = scheduleGrid[d].morning.map(e => e.fullName);
            afternoonShifts[d] = scheduleGrid[d].afternoon.map(e => e.fullName);
        });

        exportScheduleToExcel(weekLabel, weekDays, morningShifts, afternoonShifts);
        message.success("Schedule downloaded!");
    };

    const handleResetWeek = () => {
        if (confirm("Reset THIS WEEK'S schedule? This will delete all entries for these dates.")) {
            const dates = weekDays.map(d => formatDate(d));
            const empIds = new Set<string>();
            dates.forEach(d => {
                Object.values(workSchedules).forEach(s => {
                    if (s.date === d) empIds.add(s.employeeId);
                });
            });
            empIds.forEach(id => deleteScheduleForWeek(id, dates));
            message.success("Week reset!");
        }
    };

    return (
        <div className="space-y-4">
            {/* Header Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        📅 Lịch làm
                    </h2>
                    <span className="text-sm text-gray-500">{weekLabel}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleWeekChange(-1)}>
                        <ChevronLeft className="w-4 h-4" /> Prev
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleWeekChange(1)}>
                        Next <ChevronRight className="w-4 h-4" />
                    </Button>
                    {/* Mobile view toggle */}
                    <div className="md:hidden flex bg-gray-100 rounded p-0.5">
                        <button
                            onClick={() => setMobileView('mini')}
                            className={`px-2 py-1 text-xs rounded ${mobileView === 'mini' ? 'bg-white shadow-sm font-medium' : 'text-gray-500'}`}
                        >
                            Mini
                        </button>
                        <button
                            onClick={() => setMobileView('full')}
                            className={`px-2 py-1 text-xs rounded ${mobileView === 'full' ? 'bg-white shadow-sm font-medium' : 'text-gray-500'}`}
                        >
                            Full
                        </button>
                    </div>
                </div>

                {/* Single Quick Assign Dropdown */}
                <div className="flex gap-4 bg-gray-50 p-2 rounded">
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold text-gray-600 mb-1">Click cell to add</label>
                        <select
                            className="text-sm border rounded p-1 w-40"
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                        >
                            <option value="">-- Select --</option>
                            {employees.filter(e => e.status === 'active').map(e => (
                                <option key={e.id} value={e.id}>{e.fullName}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Mini Grid for Mobile Landscape */}
            <div className={`md:hidden ${mobileView === 'mini' ? 'block' : 'hidden'}`}>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Mini Grid Header */}
                    <div className="grid grid-cols-7 bg-gray-50 border-b">
                        {weekDays.map(day => {
                            const dateStr = formatDate(day);
                            const isToday = dateStr === getTodayStr();
                            return (
                                <div key={dateStr} className={`p-1 text-center text-[10px] border-r last:border-r-0 ${isToday ? 'bg-blue-50 font-bold' : ''}`}>
                                    <div>{format(day, 'EEE')}</div>
                                    <div className="text-gray-500">{format(day, 'dd')}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Leave Row - consistent height based on max leave count */}
                    {maxLeaveCount > 0 && (
                        <div className="grid grid-cols-7 bg-red-50 border-b">
                            {weekDays.map(day => {
                                const dateStr = formatDate(day);
                                const onLeave = getEmployeesOnLeave(dateStr);
                                // Dynamic height: row of initials is ~24px per row, estimate 3 per row
                                const miniLeaveHeight = Math.max(24, Math.ceil(maxLeaveCount / 3) * 24 + 8);
                                return (
                                    <div
                                        key={dateStr}
                                        className="p-1 border-r last:border-r-0"
                                        style={{ minHeight: `${miniLeaveHeight}px` }}
                                    >
                                        <div className="flex flex-wrap gap-0.5 justify-center">
                                            {onLeave.map(emp => (
                                                <span
                                                    key={emp.id}
                                                    className="inline-flex items-center justify-center w-5 h-5 text-[8px] bg-red-200 text-red-700 rounded-full font-medium"
                                                    title={emp.fullName}
                                                >
                                                    {getInitials(emp.fullName).slice(0, 2)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Morning Row */}
                    <div className="grid grid-cols-7 border-b">
                        <div className="col-span-7 bg-yellow-50 px-2 py-0.5 text-[9px] font-semibold text-yellow-700 border-b">SÁNG</div>
                        {weekDays.map(day => {
                            const dateStr = formatDate(day);
                            const morningEmps = scheduleGrid[dateStr]?.morning || [];
                            return (
                                <div
                                    key={dateStr}
                                    className="p-1 border-r last:border-r-0 bg-yellow-50/30 min-h-[40px] cursor-pointer hover:bg-yellow-100/50 active:bg-yellow-200/50"
                                    onClick={handleCellInteraction(dateStr, 'morning')}
                                >
                                    <div className="flex flex-wrap gap-0.5 justify-center pointer-events-none">
                                        {morningEmps.map(emp => (
                                            <span
                                                key={emp.id}
                                                className={`inline-flex items-center justify-center w-6 h-6 text-[8px] rounded-full font-medium ${getColor(emp)}`}
                                            >
                                                {getInitials(emp.fullName).slice(0, 2)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Afternoon Row */}
                    <div className="grid grid-cols-7">
                        <div className="col-span-7 bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-700 border-b">CHIỀU</div>
                        {weekDays.map(day => {
                            const dateStr = formatDate(day);
                            const afternoonEmps = scheduleGrid[dateStr]?.afternoon || [];
                            return (
                                <div
                                    key={dateStr}
                                    className="p-1 border-r last:border-r-0 bg-blue-50/30 min-h-[40px] cursor-pointer hover:bg-blue-100/50 active:bg-blue-200/50"
                                    onClick={handleCellInteraction(dateStr, 'afternoon')}
                                >
                                    <div className="flex flex-wrap gap-0.5 justify-center pointer-events-none">
                                        {afternoonEmps.map(emp => (
                                            <span
                                                key={emp.id}
                                                className={`inline-flex items-center justify-center w-6 h-6 text-[8px] rounded-full font-medium ${getColor(emp)}`}
                                            >
                                                {getInitials(emp.fullName).slice(0, 2)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-2">
                    Tap cell to assign selected employee. Initials show assigned staff.
                </p>
            </div>

            {/* Main Grid - Row-based structure for consistent alignment */}
            <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${mobileView === 'mini' ? 'hidden md:block' : ''}`}>
                {/* Grid Container - 7 columns for days */}
                <div className="grid grid-cols-1 md:grid-cols-7">

                    {/* ROW 1: Day Headers */}
                    {weekDays.map(day => {
                        const dateStr = formatDate(day);
                        const isToday = dateStr === getTodayStr();
                        const dayName = format(day, 'EEE');
                        const dayDate = format(day, 'dd/MM');
                        return (
                            <div
                                key={`header-${dateStr}`}
                                className={`p-2 text-center text-sm border-b border-r last:border-r-0 ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                            >
                                <div className={`font-bold ${isToday ? 'text-blue-700' : ''}`}>{dayName}</div>
                                <div className="text-xs text-gray-500">{dayDate}</div>
                            </div>
                        );
                    })}

                    {/* ROW 2: Leave Indicators (if any employees on leave this week) */}
                    {/* Height is dynamic based on maxLeaveCount to ensure consistent row height across all days */}
                    {maxLeaveCount > 0 && weekDays.map(day => {
                        const dateStr = formatDate(day);
                        const onLeaveEmps = getEmployeesOnLeave(dateStr);
                        // Dynamic height: 20px header + 18px per employee pill + 8px padding
                        const leaveRowHeight = 28 + (maxLeaveCount * 18);
                        return (
                            <div
                                key={`leave-${dateStr}`}
                                className="bg-red-50 border-b border-r last:border-r-0 p-1.5"
                                style={{ minHeight: `${leaveRowHeight}px` }}
                            >
                                {onLeaveEmps.length === 0 ? (
                                    <div className="text-[10px] text-red-200 italic text-center">—</div>
                                ) : (
                                    <>
                                        <div className="text-[9px] text-red-600 font-semibold mb-0.5 flex items-center gap-0.5">
                                            <span>🏖️</span> NGHỈ
                                            <span className="ml-auto bg-red-200 text-red-700 px-1 rounded-full text-[8px]">
                                                {onLeaveEmps.length}
                                            </span>
                                        </div>
                                        <div className="space-y-0.5">
                                            {/* Show ALL employees on leave - no slicing */}
                                            {onLeaveEmps.map(emp => (
                                                <div
                                                    key={emp.id}
                                                    className="text-[9px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded truncate"
                                                    title={`${emp.fullName}: ${emp.leaveStartDate} → ${emp.leaveEndDate}`}
                                                >
                                                    {emp.fullName}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}

                    {/* ROW 3: SÁNG (Morning) - Fixed height */}
                    {weekDays.map(day => {
                        const dateStr = formatDate(day);
                        const isToday = dateStr === getTodayStr();
                        return (
                            <div
                                key={`morning-${dateStr}`}
                                className={`p-2 border-b border-r last:border-r-0 bg-yellow-50/30 transition-colors hover:bg-yellow-50 cursor-pointer relative h-[140px] overflow-hidden ${isToday ? 'ring-1 ring-inset ring-blue-200' : ''}`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, dateStr, 'morning')}
                                onClick={handleCellInteraction(dateStr, 'morning')}
                            >
                                <div className="text-[10px] text-yellow-700 mb-1 flex justify-between items-center">
                                    <span className="font-semibold">SÁNG</span>
                                    {scheduleGrid[dateStr].morning.length > 0 && (
                                        <span className="bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full text-[9px] font-medium">
                                            {scheduleGrid[dateStr].morning.length}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1">
                                    {scheduleGrid[dateStr].morning.slice(0, MAX_VISIBLE_CARDS).map(emp => {
                                        const customShift = getCustomShift(emp.id, dateStr);
                                        return (
                                            <div
                                                key={emp.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, emp.id, dateStr, 'morning')}
                                                onClick={(e) => { e.stopPropagation(); handleRemove(e, emp.id, dateStr, 'morning'); }}
                                                className={`text-xs p-1.5 rounded shadow-sm border border-white/50 cursor-move ${getColor(emp)}`}
                                            >
                                                <div className="flex justify-between items-center gap-1">
                                                    <span className="font-medium truncate flex-1" title={emp.fullName}>{emp.fullName}</span>
                                                    <span className="text-[10px] text-red-500 bg-white/50 rounded-full px-1 flex-shrink-0">×</span>
                                                </div>
                                                {customShift?.enabled && (
                                                    <div className="text-[9px] text-purple-600 mt-0.5">
                                                        ⏰ {customShift.startTime}-{customShift.endTime}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {scheduleGrid[dateStr].morning.length > MAX_VISIBLE_CARDS && (
                                        <div className="text-[10px] text-yellow-700 bg-yellow-100 rounded px-1.5 py-0.5 text-center font-medium">
                                            +{scheduleGrid[dateStr].morning.length - MAX_VISIBLE_CARDS} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* ROW 4: CHIỀU (Afternoon) - Fixed height */}
                    {weekDays.map(day => {
                        const dateStr = formatDate(day);
                        const isToday = dateStr === getTodayStr();
                        return (
                            <div
                                key={`afternoon-${dateStr}`}
                                className={`p-2 border-b border-r last:border-r-0 bg-blue-50/30 transition-colors hover:bg-blue-50 cursor-pointer relative h-[140px] overflow-hidden ${isToday ? 'ring-1 ring-inset ring-blue-200' : ''}`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, dateStr, 'afternoon')}
                                onClick={handleCellInteraction(dateStr, 'afternoon')}
                            >
                                <div className="text-[10px] text-blue-700 mb-1 flex justify-between items-center">
                                    <span className="font-semibold">CHIỀU</span>
                                    {scheduleGrid[dateStr].afternoon.length > 0 && (
                                        <span className="bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full text-[9px] font-medium">
                                            {scheduleGrid[dateStr].afternoon.length}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1">
                                    {scheduleGrid[dateStr].afternoon.slice(0, MAX_VISIBLE_CARDS).map(emp => {
                                        const customShift = getCustomShift(emp.id, dateStr);
                                        return (
                                            <div
                                                key={emp.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, emp.id, dateStr, 'afternoon')}
                                                onClick={(e) => { e.stopPropagation(); handleRemove(e, emp.id, dateStr, 'afternoon'); }}
                                                className={`text-xs p-1.5 rounded shadow-sm border border-white/50 cursor-move ${getColor(emp)}`}
                                            >
                                                <div className="flex justify-between items-center gap-1">
                                                    <span className="font-medium truncate flex-1" title={emp.fullName}>{emp.fullName}</span>
                                                    <span className="text-[10px] text-red-500 bg-white/50 rounded-full px-1 flex-shrink-0">×</span>
                                                </div>
                                                {customShift?.enabled && (
                                                    <div className="text-[9px] text-purple-600 mt-0.5">
                                                        ⏰ {customShift.startTime}-{customShift.endTime}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {scheduleGrid[dateStr].afternoon.length > MAX_VISIBLE_CARDS && (
                                        <div className="text-[10px] text-blue-700 bg-blue-100 rounded px-1.5 py-0.5 text-center font-medium">
                                            +{scheduleGrid[dateStr].afternoon.length - MAX_VISIBLE_CARDS} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* ROW 5: Ca gãy (Custom Shift) - Fixed height */}
                    {weekDays.map(day => {
                        const dateStr = formatDate(day);
                        // Check if any employee on this day has ca gãy
                        const allEmpIds = [...new Set([
                            ...scheduleGrid[dateStr].morning.map(e => e.id),
                            ...scheduleGrid[dateStr].afternoon.map(e => e.id)
                        ])];
                        const customShifts = allEmpIds
                            .map(id => ({ id, shift: getCustomShift(id, dateStr), emp: employees.find(e => e.id === id) }))
                            .filter(x => x.shift?.enabled);

                        return (
                            <div
                                key={`cagay-${dateStr}`}
                                className="p-2 bg-purple-50/30 border-r last:border-r-0 h-[80px] overflow-hidden"
                            >
                                <div className="text-[9px] text-purple-600 font-semibold mb-1">CA GÃY</div>
                                {customShifts.length === 0 ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (selectedEmployee) {
                                                handleEnableCaGay(selectedEmployee, dateStr);
                                            } else {
                                                message.warning('Select an employee first');
                                            }
                                        }}
                                        className="text-[9px] text-purple-400 hover:text-purple-600 hover:underline"
                                    >
                                        + Thêm
                                    </button>
                                ) : (
                                    <div className="space-y-1">
                                        {customShifts.slice(0, 1).map(({ id, shift, emp }) => (
                                            <div key={id} className="p-1 bg-white rounded border border-purple-100">
                                                <div className="flex justify-between items-center text-[9px] mb-0.5">
                                                    <span className="font-medium text-purple-700 truncate">{emp?.fullName}</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDisableCaGay(id, dateStr); }}
                                                        className="text-red-400 hover:text-red-600 ml-1"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-0.5">
                                                    <SmartTimeInput
                                                        value={shift!.startTime}
                                                        onChange={(val) => handleCaGayTimeChange(id, dateStr, 'startTime', val)}
                                                        className="w-10 text-[9px] p-0.5 border rounded text-center"
                                                        placeholder="Start"
                                                    />
                                                    <span className="text-gray-400 text-[9px]">-</span>
                                                    <SmartTimeInput
                                                        value={shift!.endTime}
                                                        onChange={(val) => handleCaGayTimeChange(id, dateStr, 'endTime', val)}
                                                        className="w-10 text-[9px] p-0.5 border rounded text-center"
                                                        placeholder="End"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {customShifts.length > 1 && (
                                            <div className="text-[8px] text-purple-500">+{customShifts.length - 1} more</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-4 justify-center md:justify-end border-t border-gray-100">
                <Button variant="secondary" onClick={handleResetWeek} className="text-red-600 hover:bg-red-50">
                    <RefreshCw className="w-4 h-4 mr-2" /> Reset Week
                </Button>
                <Button variant="primary" onClick={handleExport} className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" /> Xuất Excel
                </Button>
                <Button variant="primary" onClick={() => message.info("Gửi Zalo Mock Success!")} className="bg-blue-500 hover:bg-blue-600">
                    <Share2 className="w-4 h-4 mr-2" /> Gửi Zalo
                </Button>
                <Button variant="primary" disabled className="bg-purple-600 opacity-90 cursor-not-allowed" title="Auto-saved to Supabase">
                    <Save className="w-4 h-4 mr-2" /> Saved
                </Button>
            </div>

            <p className="text-center text-xs text-gray-400">
                Tip: Drag employees between zones to move them. Click on names to remove. Click empty space with dropdown selected to add. Use "Ca gãy" section for custom shift times.
            </p>
        </div>
    );
};
