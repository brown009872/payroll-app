export interface StockRecord {
    id: string; // unique ID for local management
    date: string; // "YYYY-MM-DD"
    product: string;
    start_qty: number;
    end_qty: number;
    consumed: number;
    ordered: number;
    ceiling_weekday: number;
    ceiling_weekend: number;
    efficiency?: number; // %
}

// New Types for Wujia Catalog Integration
export interface OrderRecord {
    id: string;
    date: string;
    supplier: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    invoiceNumber: string;
    receivedBy: string;
    status: 'pending' | 'received' | 'cancelled';
    notes?: string;
    isWujiaCatalogItem?: boolean;
    wujiaProductId?: string;
}

export interface InventoryState {
    records: StockRecord[];
    orders: OrderRecord[];
    lastUpdated?: string;
}
