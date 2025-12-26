import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Employee, AttendanceRecord, WorkScheduleEntry } from '../types';

interface AppState {
    employees: Employee[];
    attendance: Record<string, AttendanceRecord>; // key: date_employeeId
    weeklyDelays: Record<string, number>; // "YYYY-MM-DD_employeeId" -> delayDays

    addEmployee: (employee: Omit<Employee, 'id'>) => void;
    updateEmployee: (id: string, employee: Partial<Employee>) => void;
    deleteEmployee: (id: string) => void;
    setWeeklyDelay: (weekEndDate: string, employeeId: string, days: number) => void;

    updateAttendance: (record: AttendanceRecord) => void;
    deleteAttendance: (date: string, employeeId: string) => void;
    deleteAttendanceForEmployeeInWeek: (employeeId: string, dateStrings: string[]) => void;
    clearAttendanceForDate: (date: string) => void;

    // Work Schedule
    workSchedules: Record<string, WorkScheduleEntry>; // key: date_employeeId
    upsertSchedule: (entry: WorkScheduleEntry) => void;
    deleteScheduleForWeek: (employeeId: string, dates: string[]) => void;

    resetAllData: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            employees: [],
            attendance: {},
            weeklyDelays: {},

            addEmployee: (emp) =>
                set((state) => ({
                    employees: [...state.employees, { ...emp, id: crypto.randomUUID() }],
                })),

            updateEmployee: (id, data) =>
                set((state) => ({
                    employees: state.employees.map((emp) =>
                        emp.id === id ? { ...emp, ...data } : emp
                    ),
                })),

            deleteEmployee: (id) =>
                set((state) => ({
                    employees: state.employees.filter((e) => e.id !== id)
                })),

            setWeeklyDelay: (weekEndDate, employeeId, days) =>
                set((state) => ({
                    weeklyDelays: {
                        ...state.weeklyDelays,
                        [`${weekEndDate}_${employeeId}`]: days
                    }
                })),

            updateAttendance: (record) => {
                const key = `${record.date}_${record.employeeId}`;
                set((state) => ({
                    attendance: { ...state.attendance, [key]: record },
                }));
            },

            deleteAttendance: (date, employeeId) => {
                const key = `${date}_${employeeId}`;
                set((state) => {
                    const newAttendance = { ...state.attendance };
                    delete newAttendance[key];
                    return { attendance: newAttendance };
                });
            },

            deleteAttendanceForEmployeeInWeek: (employeeId, dates) =>
                set((state) => {
                    const newAttendance = { ...state.attendance };
                    dates.forEach(date => {
                        const key = `${date}_${employeeId}`;
                        if (newAttendance[key]) {
                            delete newAttendance[key];
                        }
                    });
                    return { attendance: newAttendance };
                }),

            clearAttendanceForDate: (date) =>
                set((state) => {
                    const newAttendance = { ...state.attendance };
                    Object.keys(newAttendance).forEach(key => {
                        if (key.startsWith(date)) { // Key is date_empId
                            delete newAttendance[key];
                        }
                    });
                    return { attendance: newAttendance };
                }),

            // Work Schedule
            workSchedules: {},
            upsertSchedule: (entry) =>
                set((state) => {
                    const key = `${entry.date}_${entry.employeeId}`;
                    return {
                        workSchedules: {
                            ...state.workSchedules,
                            [key]: entry
                        }
                    };
                }),
            deleteScheduleForWeek: (employeeId, dates) =>
                set((state) => {
                    const newSchedules = { ...state.workSchedules };
                    dates.forEach(date => {
                        const key = `${date}_${employeeId}`;
                        if (newSchedules[key]) {
                            delete newSchedules[key];
                        }
                    });
                    return { workSchedules: newSchedules };
                }),

            resetAllData: () => set({ employees: [], attendance: {}, workSchedules: {}, weeklyDelays: {} }),
        }),
        {
            name: 'cham-cong-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
