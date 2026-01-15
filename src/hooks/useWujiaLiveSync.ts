import { useState, useCallback } from 'react';
import { wujiaLiveFetcher } from '../services/wujiaLiveFetcher';
import type { WujiaLiveOrder } from '../services/wujiaLiveFetcher';
import { useWujiaCart } from './useWujiaCart';
import { message } from 'antd';

export const useWujiaLiveSync = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!wujiaLiveFetcher.getCredentials());
    const [username, setUsername] = useState(() => wujiaLiveFetcher.getCredentials()?.username || '');
    const [loading, setLoading] = useState(false);
    const [liveOrders, setLiveOrders] = useState<WujiaLiveOrder[]>([]);

    const { addItem } = useWujiaCart();

    const login = useCallback(async (user: string, pass: string, save: boolean) => {
        setLoading(true);
        try {
            const success = await wujiaLiveFetcher.login(user, pass);
            if (success) {
                setIsLoggedIn(true);
                setUsername(user);
                if (save) {
                    wujiaLiveFetcher.saveCredentials(user, pass);
                }
                message.success('Login Wujia successful!');
            } else {
                message.error('Login failed! Check credentials.');
            }
            return success;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchOrders = useCallback(async (date: string) => {
        setLoading(true);
        try {
            const orders = await wujiaLiveFetcher.fetchOrdersByDate(date);
            setLiveOrders(orders);
            if (orders.length === 0) {
                message.info(`No orders found for ${date}`);
            } else {
                message.success(`Found ${orders.length} orders for ${date}`);
            }
            return orders;
        } catch (error) {
            message.error('Failed to fetch orders');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const importOrdersToCart = useCallback((ordersToImport: WujiaLiveOrder[]) => {
        let count = 0;
        ordersToImport.forEach(order => {
            order.products.forEach(p => {
                // Basic mapping to WujiaProduct interface used by Cart
                // In a real app, we might need more robust ID matching
                addItem({
                    id: p.id,
                    category: 'TRA', // Default or derived
                    nameVi: p.nameVi,
                    nameCn: p.nameCn,
                    packaging: p.unit, // Mapping unit to packaging loosely
                    unit: p.unit,
                    unitPrice: p.unitPrice,
                }, p.quantity);
                count++;
            });
        });
        message.success(`Imported ${count} products from ${ordersToImport.length} orders to Cart`);
    }, [addItem]);

    return {
        isLoggedIn,
        username,
        loading,
        liveOrders,
        login,
        fetchOrders,
        importOrdersToCart
    };
};
