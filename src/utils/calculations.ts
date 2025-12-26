

export const calculateHours = (inTime: string, outTime: string): number => {
    if (!inTime || !outTime) return 0;

    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);

    const start = inH + inM / 60;
    const end = outH + outM / 60;

    if (end < start) return 0; // Invalid or next day not handled deeply here per req

    return Number((end - start).toFixed(2));
};

export const calculateDayTotal = (
    hours: number,
    rate: number,
    bonus: number,
    penalty: number,
    multiplier: number = 1 // Default to 1 if not provided
): number => {
    const base = hours * rate * multiplier;
    return Number((base + bonus - penalty).toFixed(0)); // Round to integer for currency
};

export const calculateProvisional = (hours: number, rate: number): number => {
    return Number((hours * rate).toFixed(0));
};

export const generateId = (): string => {
    return crypto.randomUUID();
};
