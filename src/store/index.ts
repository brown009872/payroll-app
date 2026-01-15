import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import type { Employee, AttendanceRecord, WorkScheduleEntry } from '../types';

interface AppState {
    employees: Employee[];
    attendance: Record<string, AttendanceRecord>; // key: date_employeeId
    workSchedules: Record<string, WorkScheduleEntry>; // key: date_employeeId
    weeklyDelays: Record<string, number>; // "YYYY-MM-DD_employeeId" -> delayDays
    isLoading: boolean;

    fetchInitialData: () => Promise<void>;
    subscribeToRealtime: () => void;
    unsubscribeRealtime: () => void;

    addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
    updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
    deleteEmployee: (id: string) => Promise<void>;
    setWeeklyDelay: (weekEndDate: string, employeeId: string, days: number) => Promise<void>;

    updateAttendance: (record: AttendanceRecord) => Promise<void>;
    deleteAttendance: (date: string, employeeId: string) => Promise<void>;
    deleteAttendanceForEmployeeInWeek: (employeeId: string, dateStrings: string[]) => Promise<void>;
    clearAttendanceForDate: (date: string) => Promise<void>;

    upsertSchedule: (entry: WorkScheduleEntry) => Promise<void>;
    deleteScheduleForWeek: (employeeId: string, dates: string[]) => Promise<void>;

    resetAllData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
    employees: [],
    attendance: {},
    workSchedules: {},
    weeklyDelays: {},
    isLoading: false,

    fetchInitialData: async () => {
        set({ isLoading: true });
        try {
            // 1. Employees
            const { data: empData, error: empError } = await supabase.from('employees').select('*');
            if (empError) throw empError;

            const mappedEmps: Employee[] = (empData || []).map((e: any) => ({
                id: e.id,
                fullName: e.full_name,
                code: e.code,
                position: e.position,
                department: e.department,
                basicSalary: e.basic_salary, // Expecting number from DB logic or component handles string conversion before save
                hourlyRate: e.hourly_rate,
                status: e.status,
                joinedDate: e.joined_date,
                resignedDate: e.resigned_date,
                leaveStartDate: e.leave_start_date,
                leaveEndDate: e.leave_end_date,
                leaveTotalDays: e.leave_total_days,
                color: e.color
            }));

            // 2. Attendance
            const { data: attData, error: attError } = await supabase.from('attendance').select('*');
            if (attError) throw attError;

            const attMap: Record<string, AttendanceRecord> = {};
            (attData || []).forEach((a: any) => {
                const key = `${a.date}_${a.employee_id}`;
                attMap[key] = {
                    id: a.id,
                    date: a.date,
                    employeeId: a.employee_id,
                    inTime: a.in_time || '',
                    outTime: a.out_time || '',
                    hourlyRate: a.hourly_rate,
                    bonus: a.bonus,
                    penalty: a.penalty,
                    totalHours: a.total_hours,
                    provisionalAmount: a.provisional_amount,
                    dayTotal: a.day_total,
                    holidayMultiplierType: a.holiday_multiplier_type,
                    holidayMultiplierValue: a.holiday_multiplier_value
                };
            });

            // 3. Work Schedules
            const { data: schData, error: schError } = await supabase.from('work_schedules').select('*');
            if (schError) throw schError;

            const schMap: Record<string, WorkScheduleEntry> = {};
            (schData || []).forEach((s: any) => {
                const key = `${s.date}_${s.employee_id}`;
                schMap[key] = {
                    id: s.id,
                    date: s.date,
                    employeeId: s.employee_id,
                    morning: s.morning,
                    evening: s.evening,
                    morningNew: s.morning_new,
                    eveningNew: s.evening_new,
                    customShift: {
                        enabled: s.custom_shift_enabled,
                        startTime: s.custom_shift_start || '',
                        endTime: s.custom_shift_end || ''
                    }
                };
            });

            // 4. Delay Settings
            const { data: delayData, error: delayError } = await supabase.from('delay_settings').select('*');
            if (delayError) throw delayError;

            const delayMap: Record<string, number> = {};
            (delayData || []).forEach((d: any) => {
                const key = `${d.week_end_date}_${d.employee_id}`;
                delayMap[key] = d.delay_days;
            });

            set({
                employees: mappedEmps,
                attendance: attMap,
                workSchedules: schMap,
                weeklyDelays: delayMap,
                isLoading: false
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            set({ isLoading: false });
        }
    },

    subscribeToRealtime: () => {
        supabase.channel('db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'work_schedules' },
                (payload) => {
                    const { eventType, new: newRec, old: oldRec } = payload;
                    set((state) => {
                        const newSchedules = { ...state.workSchedules };
                        if (eventType === 'INSERT' || eventType === 'UPDATE') {
                            const s: any = newRec;
                            const key = `${s.date}_${s.employee_id}`;
                            newSchedules[key] = {
                                id: s.id,
                                date: s.date,
                                employeeId: s.employee_id,
                                morning: s.morning,
                                evening: s.evening,
                                morningNew: s.morning_new,
                                eveningNew: s.evening_new,
                                customShift: {
                                    enabled: s.custom_shift_enabled,
                                    startTime: s.custom_shift_start || '',
                                    endTime: s.custom_shift_end || ''
                                }
                            };
                        } else if (eventType === 'DELETE') {
                            const deletedId = (oldRec as any).id;
                            const key = Object.keys(newSchedules).find(k => newSchedules[k].id === deletedId);
                            if (key) delete newSchedules[key];
                        }
                        return { workSchedules: newSchedules };
                    });
                }
            )
            .subscribe();
    },

    unsubscribeRealtime: () => {
        supabase.removeAllChannels();
    },

    addEmployee: async (emp) => {
        const tempId = crypto.randomUUID();
        const newEmp = { ...emp, id: tempId };
        set(state => ({ employees: [...state.employees, newEmp] }));

        try {
            const { data, error } = await supabase.from('employees').insert({
                full_name: emp.fullName,
                code: emp.code,
                position: emp.position,
                department: emp.department,
                basic_salary: emp.basicSalary,
                hourly_rate: emp.hourlyRate,
                status: emp.status,
                joined_date: emp.joinedDate,
                color: emp.color
            }).select().single();

            if (error) throw error;

            if (data) {
                set(state => ({
                    employees: state.employees.map(e => e.id === tempId ? { ...e, id: data.id } : e)
                }));
            }
        } catch (error) {
            console.error('Error adding employee:', error);
            // Rollback optimistic update on error
            set(state => ({ employees: state.employees.filter(e => e.id !== tempId) }));
        }
    },

    updateEmployee: async (id, changes) => {
        const previousEmployees = get().employees;
        set(state => ({
            employees: state.employees.map(e => e.id === id ? { ...e, ...changes } : e)
        }));

        try {
            const dbPayload: any = {};
            if (changes.fullName !== undefined) dbPayload.full_name = changes.fullName;
            if (changes.code !== undefined) dbPayload.code = changes.code;
            if (changes.position !== undefined) dbPayload.position = changes.position;
            if (changes.department !== undefined) dbPayload.department = changes.department;
            if (changes.basicSalary !== undefined) dbPayload.basic_salary = changes.basicSalary;
            if (changes.hourlyRate !== undefined) dbPayload.hourly_rate = changes.hourlyRate;
            if (changes.status !== undefined) dbPayload.status = changes.status;
            if (changes.joinedDate !== undefined) dbPayload.joined_date = changes.joinedDate;
            if (changes.resignedDate !== undefined) dbPayload.resigned_date = changes.resignedDate;
            if (changes.leaveStartDate !== undefined) dbPayload.leave_start_date = changes.leaveStartDate;
            if (changes.leaveEndDate !== undefined) dbPayload.leave_end_date = changes.leaveEndDate;
            if (changes.leaveTotalDays !== undefined) dbPayload.leave_total_days = changes.leaveTotalDays;
            if (changes.color !== undefined) dbPayload.color = changes.color;

            const { error } = await supabase.from('employees').update(dbPayload).eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Error updating employee:', error);
            set({ employees: previousEmployees });
        }
    },

    deleteEmployee: async (id) => {
        const previousEmployees = get().employees;
        set(state => ({ employees: state.employees.filter(e => e.id !== id) }));

        try {
            const { error } = await supabase.from('employees').delete().eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Error deleting employee:', error);
            set({ employees: previousEmployees });
        }
    },

    setWeeklyDelay: async (weekEndDate, employeeId, days) => {
        const key = `${weekEndDate}_${employeeId}`;
        const previousDelays = { ...get().weeklyDelays };
        set(state => ({ weeklyDelays: { ...state.weeklyDelays, [key]: days } }));

        try {
            const { error } = await supabase.from('delay_settings').upsert({
                week_end_date: weekEndDate,
                employee_id: employeeId,
                delay_days: days
            }, { onConflict: 'week_end_date,employee_id' }).select().single();
            if (error) throw error;
        } catch (error) {
            console.error('Error setting delay:', error);
            set({ weeklyDelays: previousDelays });
        }
    },

    updateAttendance: async (record) => {
        const key = `${record.date}_${record.employeeId}`;
        const previousAttendance = { ...get().attendance };
        set(state => ({ attendance: { ...state.attendance, [key]: record } }));

        try {
            const { error } = await supabase.from('attendance').upsert({
                date: record.date,
                employee_id: record.employeeId,
                in_time: record.inTime,
                out_time: record.outTime,
                hourly_rate: record.hourlyRate,
                bonus: record.bonus,
                penalty: record.penalty,
                total_hours: record.totalHours,
                provisional_amount: record.provisionalAmount,
                day_total: record.dayTotal,
                holiday_multiplier_type: record.holidayMultiplierType,
                holiday_multiplier_value: record.holidayMultiplierValue
            }, { onConflict: 'date,employee_id' }).select().single();

            if (error) throw error;
        } catch (error) {
            console.error('Error updating attendance:', error);
            set({ attendance: previousAttendance });
        }
    },

    deleteAttendance: async (date, employeeId) => {
        const key = `${date}_${employeeId}`;
        const previousAttendance = { ...get().attendance };
        set(state => {
            const next = { ...state.attendance };
            delete next[key];
            return { attendance: next };
        });

        try {
            const { error } = await supabase.from('attendance').delete().eq('date', date).eq('employee_id', employeeId);
            if (error) throw error;
        } catch (error) {
            console.error('Error deleting attendance:', error);
            set({ attendance: previousAttendance });
        }
    },

    deleteAttendanceForEmployeeInWeek: async (employeeId, dates) => {
        const previousAttendance = { ...get().attendance };
        set(state => {
            const next = { ...state.attendance };
            dates.forEach(d => delete next[`${d}_${employeeId}`]);
            return { attendance: next };
        });

        try {
            const { error } = await supabase.from('attendance').delete().eq('employee_id', employeeId).in('date', dates);
            if (error) throw error;
        } catch (error) {
            console.error('Error deleting weekly attendance:', error);
            set({ attendance: previousAttendance });
        }
    },

    clearAttendanceForDate: async (date) => {
        const previousAttendance = { ...get().attendance };
        set(state => {
            const next = { ...state.attendance };
            Object.keys(next).forEach(k => {
                if (k.startsWith(date)) delete next[k];
            });
            return { attendance: next };
        });

        try {
            const { error } = await supabase.from('attendance').delete().eq('date', date);
            if (error) throw error;
        } catch (error) {
            console.error('Error clearing daily attendance:', error);
            set({ attendance: previousAttendance });
        }
    },

    upsertSchedule: async (entry) => {
        const key = `${entry.date}_${entry.employeeId}`;
        const previousSchedules = { ...get().workSchedules };
        set(state => ({ workSchedules: { ...state.workSchedules, [key]: entry } }));

        try {
            const { error } = await supabase.from('work_schedules').upsert({
                date: entry.date,
                employee_id: entry.employeeId,
                morning: entry.morning,
                evening: entry.evening,
                morning_new: entry.morningNew,
                evening_new: entry.eveningNew,
                custom_shift_enabled: entry.customShift?.enabled || false,
                custom_shift_start: entry.customShift?.startTime || null,
                custom_shift_end: entry.customShift?.endTime || null
            }, { onConflict: 'date,employee_id' }).select().single();

            if (error) throw error;
        } catch (error) {
            console.error('Error upserting schedule:', error);
            set({ workSchedules: previousSchedules });
        }
    },

    deleteScheduleForWeek: async (employeeId, dates) => {
        const previousSchedules = { ...get().workSchedules };
        set(state => {
            const next = { ...state.workSchedules };
            dates.forEach(d => delete next[`${d}_${employeeId}`]);
            return { workSchedules: next };
        });

        try {
            const { error } = await supabase.from('work_schedules').delete().eq('employee_id', employeeId).in('date', dates);
            if (error) throw error;
        } catch (error) {
            console.error('Error deleting schedule week:', error);
            set({ workSchedules: previousSchedules });
        }
    },

    resetAllData: async () => {
        if (confirm("Are you sure you want to WIPE ALL DATA on the server?")) {
            set({ employees: [], attendance: {}, workSchedules: {}, weeklyDelays: {} });
            // Implement server wipe if truly needed
        }
    },
}));
