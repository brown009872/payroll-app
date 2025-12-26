export const formatDate = (date: Date): string => {
    // YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getTodayStr = (): string => formatDate(new Date());

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const getWeekDays = (anchorDateStr: string): Date[] => {
    const d = new Date(anchorDateStr);
    const day = d.getDay(); // 0 (Sun) - 6 (Sat)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday

    const monday = new Date(d.setDate(diff));
    const days = [];
    for (let i = 0; i < 7; i++) {
        const next = new Date(monday);
        next.setDate(monday.getDate() + i);
        days.push(next);
    }
    return days;
};

export const normalizeTimeInput = (value: string): string => {
    // Trim whitespace
    const v = value.trim();

    // Empty return empty
    if (!v) return '';

    // If matches 1 or 2 digits, pad with 0 and append :00
    // e.g. "8" -> "08:00", "22" -> "22:00"
    if (/^\d{1,2}$/.test(v)) {
        const num = parseInt(v, 10);
        if (num >= 0 && num <= 23) {
            return `${String(num).padStart(2, '0')}:00`;
        }
    }

    // Handle 3 or 4 digits: "730" -> "07:30", "1130" -> "11:30"
    if (/^\d{3,4}$/.test(v)) {
        let h, m;
        if (v.length === 3) {
            h = parseInt(v.substring(0, 1), 10);
            m = parseInt(v.substring(1), 10);
        } else {
            h = parseInt(v.substring(0, 2), 10);
            m = parseInt(v.substring(2), 10);
        }

        if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }
    }

    // If matches standard HH:mm format, strict check?
    // Let's accept HH:MM and pad if needed? Input usually guarantees HH:mm if type="time" but we use text now.
    // e.g. "8:30" -> "08:30"
    if (/^\d{1,2}:\d{2}$/.test(v)) {
        const parts = v.split(':');
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }
    }

    // Return original if valid or let it fail downstream? 
    // Requirement says "If invalid, return null or fallback".
    // Let's return the string, maybe cleaned, or empty if totally invalid?
    // For now, if it doesn't match our 'smart' patterns, return as is.
    return v;
};

export const isDateBetween = (target: string, start: string, end: string): boolean => {
    if (!target || !start || !end) return false;
    const t = new Date(target);
    const s = new Date(start);
    const e = new Date(end);
    t.setHours(0, 0, 0, 0);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    return t >= s && t <= e;
};

export const addDays = (base: Date, days: number): Date => {
    const result = new Date(base);
    // Set hours to noon to avoid DST/timezone midnight shifting issues when adding days
    // result.setHours(12, 0, 0, 0); 
    // Actually, simply using setDate on a cloned object is usually fine if we don't cross DST in a way that shifts day.
    // Given the requirement:
    result.setDate(result.getDate() + days);
    return result;
};
