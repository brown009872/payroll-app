
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

/**
 * Exports the Result Schedule to an Excel file.
 * Structure:
 * Rows: Morning / Afternoon
 * Columns: Monday, Tuesday, ... Sunday
 * Cells: List of employee names
 */
export const exportScheduleToExcel = (
    weekLabel: string,
    days: Date[],
    morningShifts: Record<string, string[]>, // Key: YYYY-MM-DD, Value: [EmpName1, EmpName2]
    afternoonShifts: Record<string, string[]>
) => {
    // 1. Prepare Data for Sheet
    // We want a readable format. Maybe:
    // | Shift | Mon (date) | Tue (date) | ...
    // | Morning | Emp A, Emp B | Emp C | ...
    // | Afternoon | Emp C | Emp A | ...

    const headers = ['Shift', ...days.map(d => format(d, 'EEE dd/MM'))];

    const morningRow = [
        'Morning',
        ...days.map(d => {
            const dateStr = format(d, 'yyyy-MM-dd');
            return (morningShifts[dateStr] || []).join(', ');
        })
    ];

    const afternoonRow = [
        'Afternoon',
        ...days.map(d => {
            const dateStr = format(d, 'yyyy-MM-dd');
            return (afternoonShifts[dateStr] || []).join(', ');
        })
    ];

    const data = [
        headers,
        morningRow,
        afternoonRow
    ];

    // 2. Create Workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Auto-width columns
    const colWidths = data[0].map((_, i) => ({ wch: i === 0 ? 15 : 30 }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Schedule');

    // 3. Write File
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    saveAs(blob, `Schedule_${weekLabel}.xlsx`);
};
