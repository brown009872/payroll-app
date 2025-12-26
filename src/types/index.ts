export type EmployeeStatus = 'active' | 'inactive' | 'resigned';

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
