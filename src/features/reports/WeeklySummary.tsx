import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store';
import { getTodayStr, getWeekDays, formatDate, formatCurrency, addDays } from '../../utils/date';
import { calculateHours, calculateDayTotal } from '../../utils/calculations';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const WeeklySummary: React.FC = () => {
    const { employees, attendance, weeklyDelays, setWeeklyDelay } = useAppStore();
    const [anchorDate, setAnchorDate] = useState(getTodayStr());

    const weekDays = useMemo(() => getWeekDays(anchorDate), [anchorDate]);
    const startOfWeek = weekDays[0];
    const endOfWeek = weekDays[6];

    const handleWeekChange = (direction: number) => {
        const d = new Date(anchorDate);
        d.setDate(d.getDate() + direction * 7);
        setAnchorDate(formatDate(d));
    };

    const weekData = useMemo(() => {
        return employees.map(emp => {
            let totalHoursWeek = 0;
            let totalAmountWeek = 0;

            const days = weekDays.map(day => {
                const dateStr = formatDate(day);
                const key = `${dateStr}_${emp.id}`;
                const record = attendance[key];

                let hours = 0;
                let amount = 0;

                if (record) {
                    if (record.totalHours !== undefined && record.dayTotal !== undefined) {
                        hours = record.totalHours;
                        amount = record.dayTotal;
                    } else {
                        hours = calculateHours(record.inTime || '', record.outTime || '');
                        amount = calculateDayTotal(hours, record.hourlyRate, Number(record.bonus || 0), Number(record.penalty || 0), record.holidayMultiplierValue || 1);
                    }
                }

                totalHoursWeek += hours;
                totalAmountWeek += amount;

                return { date: dateStr, hours, amount };
            });

            // Calculate Pay Date
            const delayKey = `${formatDate(endOfWeek)}_${emp.id}`;
            const delayDays = weeklyDelays[delayKey] || 0;

            const payDateObj = addDays(endOfWeek, delayDays);
            const payDateStr = formatDate(payDateObj);

            return {
                employee: emp,
                days,
                totalHoursWeek,
                totalAmountWeek,
                payDelayDays: delayDays,
                payDateStr
            };
        }).filter(item => {
            const hasData = item.days.some(d => d.hours > 0 || d.amount > 0);
            return hasData;
        });
    }, [employees, attendance, weekDays, endOfWeek, weeklyDelays]);

    const grandTotalHours = weekData.reduce((sum, item) => sum + item.totalHoursWeek, 0);
    const grandTotalAmount = weekData.reduce((sum, item) => sum + item.totalAmountWeek, 0);

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Weekly Summary</h2>
                        <p className="text-gray-500 text-sm">
                            {formatDate(startOfWeek)} - {formatDate(endOfWeek)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Pay date is calculated per employee based on their delay settings.
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                            <span className="text-sm font-medium text-gray-500 uppercase">Total Hours</span>
                            <span className="text-3xl font-bold text-blue-600">{grandTotalHours.toFixed(2)}</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-6">
                            <span className="text-sm font-medium text-gray-500 uppercase">Total Payroll</span>
                            <span className="text-3xl font-bold text-green-600">{formatCurrency(grandTotalAmount)}</span>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mt-4">
                    <CardHeader>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Attendance Details</h3>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 shadow-sm">Employee</th>
                                    {weekDays.map(day => (
                                        <th key={day.toISOString()} className="px-2 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
                                            {day.toLocaleDateString('en-US', { weekday: 'short' })}<br />
                                            <span className="text-xs font-normal">{day.getDate()}/{day.getMonth() + 1}</span>
                                        </th>
                                    ))}
                                    <th className="px-3 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Hrs</th>
                                    <th className="px-3 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Amt</th>
                                    <th className="px-3 py-3 text-center font-medium text-gray-500 uppercase tracking-wider text-xs">Delay</th>
                                    <th className="px-3 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">Pay Date</th>
                                    <th className="px-3 py-3 text-center font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {weekData.length === 0 ? (
                                    <tr><td colSpan={13} className="px-6 py-4 text-center text-gray-500">No data</td></tr>
                                ) : (
                                    weekData.map(({ employee, days, totalHoursWeek, totalAmountWeek, payDelayDays, payDateStr }) => (
                                        <tr key={employee.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-4 font-medium text-gray-900 sticky left-0 bg-white shadow-sm z-10 whitespace-nowrap">
                                                {employee.fullName}
                                            </td>
                                            {days.map(d => (
                                                <td key={d.date} className="px-2 py-4 text-center text-gray-500">
                                                    <div className={d.hours > 0 ? 'font-medium text-gray-900' : ''}>
                                                        {d.hours > 0 ? d.hours : '-'}
                                                    </div>
                                                    {d.amount > 0 && (
                                                        <div className="text-xs text-green-600">
                                                            {formatCurrency(d.amount)}
                                                        </div>
                                                    )}
                                                </td>
                                            ))}
                                            <td className="px-3 py-4 text-right font-bold text-gray-900">
                                                {totalHoursWeek.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-4 text-right font-bold text-green-600">
                                                {formatCurrency(totalAmountWeek)}
                                            </td>
                                            <td className="px-3 py-4 text-center text-gray-500 text-xs">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-16 p-1 border rounded text-center"
                                                    value={payDelayDays}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        const weekKey = formatDate(endOfWeek);
                                                        setWeeklyDelay(weekKey, employee.id, val);
                                                    }}
                                                />
                                            </td>
                                            <td className="px-3 py-4 text-center font-medium text-blue-700 whitespace-nowrap">
                                                {new Date(payDateStr).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-3 py-4 text-center">
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Clear this week's data for ${employee.fullName}?`)) {
                                                            const datesToDelete = days.map(d => d.date);
                                                            useAppStore.getState().deleteAttendanceForEmployeeInWeek(employee.id, datesToDelete);
                                                        }
                                                    }}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                    title="Delete weekly data"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
