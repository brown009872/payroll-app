import React from 'react';
import { useAppStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { FileDown, Trash2 } from 'lucide-react';
import { calculateHours, calculateDayTotal } from '../../utils/calculations';

export const ExportPanel: React.FC = () => {
    const { employees, attendance, resetAllData } = useAppStore();

    const handleExportCSV = () => {
        // Headers
        const headers = ['Date', 'Employee ID', 'Full Name', 'Position', 'In Time', 'Out Time', 'Hours', 'Rate', 'Holiday Multiplier', 'Bonus', 'Penalty', 'Total'];
        const rows: string[] = [headers.join(',')];

        // Gather all data
        // We iterate attendance keys.
        Object.values(attendance).forEach(record => {
            const emp = employees.find(e => e.id === record.employeeId);
            if (!emp) return;

            const hours = calculateHours(record.inTime, record.outTime);
            // Multiplier text
            const multiplierStr = record.holidayMultiplierType === 'custom'
                ? `${record.holidayMultiplierValue || 1} (Custom)`
                : (record.holidayMultiplierType || 'x1');

            const total = calculateDayTotal(hours, record.hourlyRate, Number(record.bonus || 0), Number(record.penalty || 0), record.holidayMultiplierValue || 1);

            const row = [
                record.date,
                emp.id,
                `"${emp.fullName}"`, // Quote for CSV safety
                `"${emp.position}"`,
                record.inTime,
                record.outTime,
                hours,
                record.hourlyRate,
                `"${multiplierStr}"`,
                record.bonus,
                record.penalty,
                total
            ];
            rows.push(row.join(','));
        });

        // Create Blob
        const csvContent = rows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        // Trigger download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'payroll_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReset = () => {
        if (confirm('WARNING: This will delete ALL employees and attendance data. This action cannot be undone. Are you sure?')) {
            resetAllData();
            alert('All data has been reset.');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Export Data</h3>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500 mb-4">
                        Download all attendance history as a CSV file compatible with Excel or Google Sheets.
                    </p>
                    <Button onClick={handleExportCSV}>
                        <FileDown className="w-4 h-4 mr-2" />
                        Export All to CSV
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-red-200">
                <CardHeader className="border-red-200 bg-red-50">
                    <h3 className="text-lg font-medium leading-6 text-red-900">Danger Zone</h3>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500 mb-4">
                        Resetting the application will clear all local storage data, including employees and attendance records.
                    </p>
                    <Button variant="danger" onClick={handleReset}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Reset All Data
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
