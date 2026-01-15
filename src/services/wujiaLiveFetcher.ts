// import { chromium, Browser, Page } from 'playwright';
import CryptoJS from 'crypto-js';

// Types for Order Data
export interface WujiaLiveProduct {
    id: string;
    nameVi: string;
    nameCn: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface WujiaLiveOrder {
    orderId: string;
    date: string;
    status: string;
    totalAmount: number;
    products: WujiaLiveProduct[];
}

const ENCRYPTION_KEY = 'wujia-secret-key-demo'; // In prod, use env var

class WujiaLiveFetcher {
    private isLoggedIn = false;
    private savedCreds: { u: string, p: string } | null = null;

    constructor() {
        this.loadCredentials();
    }

    saveCredentials(username: string, pass: string) {
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify({ u: username, p: pass }), ENCRYPTION_KEY).toString();
        localStorage.setItem('wujia_creds', encrypted);
        this.savedCreds = { u: username, p: pass };
    }

    getCredentials() {
        return this.savedCreds ? { username: this.savedCreds.u } : null;
    }

    private loadCredentials() {
        const encrypted = localStorage.getItem('wujia_creds');
        if (encrypted) {
            try {
                const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
                const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                this.savedCreds = decrypted;
            } catch (e) {
                console.error('Failed to decrypt credentials', e);
            }
        }
    }

    async login(username: string, _pass: string): Promise<boolean> {
        // MOCK LOGIN FOR BROWSER DEMO
        console.log('Attempting login with:', username);
        await new Promise(r => setTimeout(r, 1000)); // Simulate network
        if (username.length > 3) {
            this.isLoggedIn = true;
            return true;
        }
        return false;
    }

    async fetchOrdersByDate(date: string): Promise<WujiaLiveOrder[]> {
        if (!this.isLoggedIn) throw new Error('Not logged in');

        console.log('Fetching orders for date:', date);
        await new Promise(r => setTimeout(r, 1500)); // Simulate Fetch

        // MOCK DATA for 2025-12-29
        if (date === '2025-12-29') {
            return [
                {
                    orderId: 'WJ-20251229-001',
                    date: '2025-12-29',
                    status: 'Completed',
                    totalAmount: 1500000,
                    products: [
                        { id: 'p1', nameVi: 'Trà Oolong', nameCn: '乌龙茶', unit: 'kg', quantity: 5, unitPrice: 200000, totalPrice: 1000000 },
                        { id: 'p2', nameVi: 'Ly Nhựa 500ml', nameCn: '塑料杯', unit: 'thùng', quantity: 1, unitPrice: 500000, totalPrice: 500000 },
                    ]
                },
                {
                    orderId: 'WJ-20251229-002',
                    date: '2025-12-29',
                    status: 'Processing',
                    totalAmount: 300000,
                    products: [
                        { id: 'p3', nameVi: 'Trân Châu Đen', nameCn: '黑珍珠', unit: 'bao', quantity: 2, unitPrice: 150000, totalPrice: 300000 },
                    ]
                }
            ];
        }

        return [];
    }
}

export const wujiaLiveFetcher = new WujiaLiveFetcher();
