export type EmployeeStatus = 'active' | 'inactive' | 'resigned';

// Preset color options for employee cards
export const EMPLOYEE_COLORS = [
    { id: 'blue', bg: 'bg-blue-100', text: 'text-blue-800', hex: '#DBEAFE' },
    { id: 'green', bg: 'bg-green-100', text: 'text-green-800', hex: '#DCFCE7' },
    { id: 'purple', bg: 'bg-purple-100', text: 'text-purple-800', hex: '#F3E8FF' },
    { id: 'pink', bg: 'bg-pink-100', text: 'text-pink-800', hex: '#FCE7F3' },
    { id: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800', hex: '#FEF9C3' },
    { id: 'orange', bg: 'bg-orange-100', text: 'text-orange-800', hex: '#FFEDD5' },
    { id: 'teal', bg: 'bg-teal-100', text: 'text-teal-800', hex: '#CCFBF1' },
    { id: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-800', hex: '#E0E7FF' },
    { id: 'rose', bg: 'bg-rose-100', text: 'text-rose-800', hex: '#FFE4E6' },
    { id: 'cyan', bg: 'bg-cyan-100', text: 'text-cyan-800', hex: '#CFFAFE' },
] as const;

export type EmployeeColorId = typeof EMPLOYEE_COLORS[number]['id'];

export interface Employee {
    id: string; // UUID
    fullName: string;
    position: string;
    status: EmployeeStatus;
    joinedDate?: string; // YYYY-MM-DD
    resignedDate?: string; // ISO date string (YYYY-MM-DD)
    leaveStartDate?: string; // YYYY-MM-DD
    leaveEndDate?: string; // YYYY-MM-DD
    leaveTotalDays?: number;
    hourlyRate?: number;
    code?: string;
    department?: string;
    basicSalary: number;
    color?: EmployeeColorId; // Custom color for schedule cards
}

export interface AttendanceRecord {
    id: string; // Composite key usually date_employeeId, but unique ID is safer
    date: string; // YYYY-MM-DD
    employeeId: string;
    inTime: string; // HH:mm
    outTime: string; // HH:mm
    hourlyRate: number;
    bonus: number | string;
    penalty: number | string;
    totalHours?: number;
    provisionalAmount?: number;
    dayTotal?: number;
    holidayMultiplierType?: 'x1' | 'x2' | 'x3' | 'custom';
    holidayMultiplierValue?: number;
}

export interface WeekSummaryRow {
    employeeId: string;
    employeeName: string;
    days: {
        date: string;
        description: string; // "Mon", "Tue"...
        hours: number;
        amount: number;
    }[];
    totalHoursWeek: number;
    weekTotal: number;
}

export interface CustomShift {
    enabled: boolean;
    startTime: string; // 'HH:mm'
    endTime: string;   // 'HH:mm'
}

export interface WorkScheduleEntry {
    id: string; // UUID
    employeeId: string;
    date: string; // YYYY-MM-DD
    morning: boolean;
    evening: boolean;
    morningNew: boolean;
    eveningNew: boolean;
    customShift?: CustomShift; // New custom shift field
}
