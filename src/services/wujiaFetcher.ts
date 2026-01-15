// This service handles fetching orders from Wujia Portal.
// NOTE: Real automation requires Node.js/Playwright. This client-side version 
// simulates the process for demonstration purposes or connects to a backend proxy.

import { WUJIA_PRODUCTS } from '../data/wujiaProducts';
import type { WujiaProduct } from '../data/wujiaProducts';

export interface WujiaOrderProduct {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface WujiaOrder {
    orderId: string;
    date: string;
    products: WujiaOrderProduct[];
    totalAmount: number;
}

// Logic to match Wujia portal names to our Catalog
const matchWujiaProduct = (wujiaName: string): WujiaProduct | null => {
    // 1. Direct match (Vietnamese)
    const exactVi = WUJIA_PRODUCTS.find(p => p.nameVi.toLowerCase() === wujiaName.toLowerCase());
    if (exactVi) return exactVi;

    // 2. Direct match (Chinese)
    const exactCn = WUJIA_PRODUCTS.find(p => p.nameCn === wujiaName);
    if (exactCn) return exactCn;

    // 3. Partial match (Fuzzy-ish)
    const partial = WUJIA_PRODUCTS.find(p =>
        wujiaName.toLowerCase().includes(p.nameVi.toLowerCase()) ||
        p.nameVi.toLowerCase().includes(wujiaName.toLowerCase())
    );
    return partial || null;
};

// Simulation Data for "Live Fetch"
const MOCK_ORDERS: WujiaOrder[] = [
    {
        orderId: 'WO-20251229-001',
        date: '2025-12-29',
        products: [
            { name: 'Hồng Trà Đài Loan', quantity: 10, unitPrice: 125000, total: 1250000 },
            { name: 'Pudding Trứng', quantity: 20, unitPrice: 5000, total: 100000 },
        ],
        totalAmount: 1350000
    },
    {
        orderId: 'WO-20251229-002',
        date: '2025-12-29',
        products: [
            { name: 'Túi 1 Ly', quantity: 5, unitPrice: 60000, total: 300000 },
            { name: 'Sữa Tươi', quantity: 12, unitPrice: 70000, total: 840000 }
        ],
        totalAmount: 1140000
    }
];

export async function fetchWujiaOrders(date: string): Promise<WujiaOrder[]> {
    console.log(`[WujiaFetcher] Starting fetch for ${date}...`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('[WujiaFetcher] Authenticating...');

    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('[WujiaFetcher] Parsing Purchase History...');

    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('[WujiaFetcher] Matching products...');

    // In a real scenario, this would POST to a backend endpoint like /api/wujia-fetch
    // For this client-side demo, we return mock data if date matches today/demo date
    // Otherwise return empty to simulate no orders.

    if (date === '2025-12-29') {
        return MOCK_ORDERS;
    }

    if (date === '2025-12-27') {
        return [
            {
                orderId: 'WO-20251227-001',
                date: '2025-12-27',
                products: [
                    { name: 'Trà Bí Đao', quantity: 5, unitPrice: 132000, total: 660000 },
                    { name: 'Thạch Sương Sáo', quantity: 10, unitPrice: 28000, total: 280000 },
                ],
                totalAmount: 940000
            }
        ];
    }

    return [];
}

export { matchWujiaProduct };
