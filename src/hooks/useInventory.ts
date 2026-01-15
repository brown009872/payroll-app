import { useState, useEffect } from 'react';
import type { StockRecord, InventoryState, OrderRecord } from '../types/inventory';
import { getTodayStr } from '../utils/date';

const STORAGE_KEY = 'cham-cong-inventory';

// Test data as per request
const INITIAL_DATA: StockRecord[] = [
    {
        id: 'test-1',
        date: '2025-12-28',
        product: 'Product A',
        start_qty: 2,
        ordered: 5,
        consumed: 3,
        end_qty: 4, // 2+5-3
        ceiling_weekday: 10,
        ceiling_weekend: 15,
        efficiency: 60
    }
];

export const useInventory = () => {
    const [state, setState] = useState<InventoryState>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Migration check: if old format (array), wrap it
            if (Array.isArray(parsed)) {
                return { records: parsed, orders: [] };
            }
            return parsed;
        }
        return { records: INITIAL_DATA, orders: [] };
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    // Convenience accessors
    const records = state.records;
    const orders = state.orders;

    // "Cron" hook: Check if we have data for today, if not, suggest/carry over from yesterday
    useEffect(() => {
        const today = getTodayStr();
        const existingToday = records.find(r => r.date === today);

        // Simulating "cron": if no record for today for Product A, create one based on yesterday's leftover
        if (!existingToday) {
            // Find yesterday's record
            // Simplification: just find the latest record for Product A
            const latest = [...records]
                .filter(r => r.product === 'Product A') // For demo
                .sort((a, b) => b.date.localeCompare(a.date))[0];

            if (latest && latest.date < today) {
                // Determine if we should auto-create. For now, let's just log or prepare.
                console.log("Suggestions: Carry over", latest.end_qty, "from", latest.date);
            }
        }
    }, [records]);

    const addRecord = (record: Omit<StockRecord, 'id'>) => {
        const newRecord = { ...record, id: crypto.randomUUID() };
        setState(prev => ({
            ...prev,
            records: [...prev.records, newRecord]
        }));
    };

    const updateRecord = (id: string, updates: Partial<StockRecord>) => {
        setState(prev => ({
            ...prev,
            records: prev.records.map(r => r.id === id ? { ...r, ...updates } : r)
        }));
    };

    const deleteRecord = (id: string) => {
        setState(prev => ({
            ...prev,
            records: prev.records.filter(r => r.id !== id)
        }));
    };

    const addOrder = (order: OrderRecord) => {
        setState(prev => ({
            ...prev,
            orders: [...prev.orders, order]
        }));
    };

    const getRecordsByDate = (date: string) => records.filter(r => r.date === date);

    return {
        records,
        orders,
        addRecord,
        updateRecord,
        deleteRecord,
        addOrder,
        getRecordsByDate
    };
};
