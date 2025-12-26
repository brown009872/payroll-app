import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { getTodayStr, formatDate, normalizeTimeInput } from '../../utils/date';
import { calculateHours, calculateDayTotal } from '../../utils/calculations';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import type { AttendanceRecord } from '../../types';
import { SmartTimeInput } from '../../components/SmartTimeInput';

export const DailyAttendance: React.FC = () => {
    const {
        employees,
        attendance,
        updateAttendance,
        clearAttendanceForDate
    } = useAppStore();

    const [selectedDate, setSelectedDate] = useState(getTodayStr());

    // Only active employees appear in daily attendance
    const activeEmployees = employees.filter(e => e.status === 'active');

    const handleDateChange = (days: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(formatDate(d));
    };

    const getRecord = (empId: string): Partial<AttendanceRecord> => {
        const key = `${selectedDate}_${empId}`;
        return attendance[key] || {
            date: selectedDate,
            employeeId: empId,
            inTime: '',
            outTime: '',
            hourlyRate: 0,
            bonus: 0,
            penalty: 0,
            holidayMultiplierType: 'x1',
            holidayMultiplierValue: 1
        };
    };

    const updateRecord = (empId: string, field: keyof AttendanceRecord, value: string | number) => {
        const current = getRecord(empId);
        const updated = { ...current, [field]: value, employeeId: empId, date: selectedDate };

        const employee = employees.find(e => e.id === empId);

        // Calculate derived fields
        const inTime = (field === 'inTime' ? value : updated.inTime) as string;
        const outTime = (field === 'outTime' ? value : updated.outTime) as string;
        const hours = calculateHours(inTime || '', outTime || '');

        // Use employee rate if available, fall back to record rate, then 0
        const rate = employee?.hourlyRate || current.hourlyRate || 0;

        // Multiplier logic
        let multiplierType = (field === 'holidayMultiplierType' ? value : (updated.holidayMultiplierType || 'x1')) as 'x1' | 'x2' | 'x3' | 'custom';
        let multiplierValue = Number(field === 'holidayMultiplierValue' ? value : (updated.holidayMultiplierValue || 1));

        // If generic type selection changes, set standard value
        if (field === 'holidayMultiplierType') {
            switch (value) {
                case 'x1': multiplierValue = 1; break;
                case 'x2': multiplierValue = 2; break;
                case 'x3': multiplierValue = 3; break;
                // custom keeps previous value or defaults to 1 if invalid
                case 'custom': if (!multiplierValue || multiplierValue === 1) multiplierValue = 1.5; break;
            }
        }

        // Ensure valid distinct value for custom if manually typed (handled by direct setting of value), but safer here?
        // We trust the passed value for 'holidayMultiplierValue' normally.

        const bonus = Number(field === 'bonus' ? value : updated.bonus) || 0;
        const penalty = Number(field === 'penalty' ? value : updated.penalty) || 0;

        // Calculate provisional and total
        // provisional = hours * rate * multiplier
        // We don't display 'provisional' in the table directly named like this, but logic persists.
        const provisional = Number((hours * rate * multiplierValue).toFixed(0)); // rounded

        // dayTotal = hours * rate * multiplier + bonus - penalty
        // Re-use util for consistency
        const dayTotal = calculateDayTotal(hours, rate, bonus, penalty, multiplierValue);

        const fullRecord: AttendanceRecord = {
            id: current.id || crypto.randomUUID(), // Ensure ID
            date: selectedDate,
            employeeId: empId,
            inTime: inTime || '',
            outTime: outTime || '',
            hourlyRate: rate,
            bonus: bonus,
            penalty: penalty,
            holidayMultiplierType: multiplierType,
            holidayMultiplierValue: multiplierValue,
            totalHours: hours,
            provisionalAmount: provisional,
            dayTotal: dayTotal
        };
        updateAttendance(fullRecord);
    };

    const handleClearDay = () => {
        if (confirm(`Clear all attendance data for ${selectedDate}?`)) {
            clearAttendanceForDate(selectedDate);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Daily Attendance</h2>
                    <p className="text-gray-500 text-sm">{selectedDate}</p>
                </div>

                <div className="flex items-center space-x-4">
                    <Button variant="secondary" size="sm" onClick={() => handleDateChange(-1)}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                    />
                    <Button variant="secondary" size="sm" onClick={() => handleDateChange(1)}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                <Button variant="danger" size="sm" onClick={handleClearDay}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Day
                </Button>
            </div>

            <Card>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Employee</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">In</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Out</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Hours</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Rate</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Holiday / Tết</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Bonus</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Penalty</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {activeEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                        No active employees.
                                    </td>
                                </tr>
                            ) : (
                                activeEmployees.map(emp => {
                                    const record = getRecord(emp.id);
                                    // Use stored values if available, otherwise calculate (fallback)
                                    // PREFER employee rate for display/calc over stored rate if we want dynamic?
                                    // User request: "Use the employee’s hourlyRate... Display as read-only"
                                    const rateToUse = emp.hourlyRate || record.hourlyRate || 0;

                                    const hours = record.totalHours ?? calculateHours(record.inTime || '', record.outTime || '');
                                    // If we want dynamic update on view (recalc if emp rate changed but record stale):
                                    // But we only recalc explicitly on save in updateRecord. 
                                    // For display here, let's respect the record's TOTAL but maybe show the CURRENT rate?
                                    // Actually, if we just rely on record.dayTotal, it might be stale if rate changed.
                                    // But changing rate in DB doesn't usually retroactively change paid amounts unless re-processed.
                                    // Let's stick to using the rate that was used or the current one if not set.

                                    const total = record.dayTotal ?? calculateDayTotal(hours, rateToUse, Number(record.bonus || 0), Number(record.penalty || 0), record.holidayMultiplierValue || 1);

                                    return (
                                        <tr key={emp.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">
                                                {emp.fullName}
                                                <div className="text-xs text-gray-400">{emp.position}</div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <SmartTimeInput
                                                    className="w-full border-gray-300 rounded-md text-sm p-1 border"
                                                    value={record.inTime || ''}
                                                    onChange={val => updateRecord(emp.id, 'inTime', val)}
                                                    onBlur={e => {
                                                        const norm = normalizeTimeInput(e.target.value);
                                                        if (norm !== record.inTime) {
                                                            updateRecord(emp.id, 'inTime', norm);
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <SmartTimeInput
                                                    className="w-full border-gray-300 rounded-md text-sm p-1 border"
                                                    value={record.outTime || ''}
                                                    onChange={val => updateRecord(emp.id, 'outTime', val)}
                                                    onBlur={e => {
                                                        const norm = normalizeTimeInput(e.target.value);
                                                        if (norm !== record.outTime) {
                                                            updateRecord(emp.id, 'outTime', norm);
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-500">
                                                {hours > 0 ? hours : '-'}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="text-sm text-gray-700 font-medium bg-gray-100 rounded px-2 py-1 inline-block min-w-[3rem] text-right">
                                                    {rateToUse > 0 ? rateToUse.toLocaleString() : (
                                                        <span className="text-orange-500 text-xs" title="Chưa thiết lập lương">⚠</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex flex-col space-y-1">
                                                    <select
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs p-1 border"
                                                        value={record.holidayMultiplierType || 'x1'}
                                                        onChange={(e) => updateRecord(emp.id, 'holidayMultiplierType', e.target.value)}
                                                    >
                                                        <option value="x1">x1</option>
                                                        <option value="x2">x2</option>
                                                        <option value="x3">x3</option>
                                                        <option value="custom">Khác</option>
                                                    </select>
                                                    {record.holidayMultiplierType === 'custom' && (
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            className="w-full border-gray-300 rounded-md text-sm p-1 border"
                                                            value={record.holidayMultiplierValue}
                                                            onChange={(e) => updateRecord(emp.id, 'holidayMultiplierValue', parseFloat(e.target.value) || 1)}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    className="w-full border-gray-300 rounded-md text-sm p-1 border"
                                                    value={record.bonus}
                                                    placeholder="0"
                                                    min="0"
                                                    onFocus={() => {
                                                        if (record.bonus === 0) updateRecord(emp.id, 'bonus', '');
                                                    }}
                                                    onChange={e => updateRecord(emp.id, 'bonus', e.target.value)}
                                                    onBlur={() => {
                                                        if (record.bonus === '' || record.bonus === null || record.bonus === undefined) {
                                                            updateRecord(emp.id, 'bonus', 0);
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    className="w-full border-gray-300 rounded-md text-sm p-1 border"
                                                    value={record.penalty}
                                                    placeholder="0"
                                                    min="0"
                                                    onFocus={() => {
                                                        if (record.penalty === 0) updateRecord(emp.id, 'penalty', '');
                                                    }}
                                                    onChange={e => updateRecord(emp.id, 'penalty', e.target.value)}
                                                    onBlur={() => {
                                                        if (record.penalty === '' || record.penalty === null || record.penalty === undefined) {
                                                            updateRecord(emp.id, 'penalty', 0);
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-sm font-bold text-gray-900">
                                                {total > 0 || (record.totalHours || 0) > 0 || Number(record.bonus || 0) > 0 || Number(record.penalty || 0) > 0 ? total.toLocaleString() : '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
};
