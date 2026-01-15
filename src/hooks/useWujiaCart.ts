import { create } from 'zustand';
import type { WujiaProduct } from '../data/wujiaProducts';

export interface CartItem extends WujiaProduct {
    quantity: number;
    productId: string;
}

interface WujiaCartState {
    items: CartItem[];
    totalPrice: number;
    totalItems: number;
    addItem: (product: WujiaProduct, qty?: number) => void;
    removeItem: (productId: string) => void;
    changeQuantity: (productId: string, delta: number) => void;
    clearCart: () => void;
}

export const useWujiaCart = create<WujiaCartState>((set) => ({
    items: [],
    totalPrice: 0,
    totalItems: 0,

    addItem: (product: WujiaProduct, qty: number = 1) => {
        set((state) => {
            const existing = state.items.find((i) => i.productId === product.id);
            let newItems;
            if (existing) {
                newItems = state.items.map((i) =>
                    i.productId === product.id ? { ...i, quantity: i.quantity + qty } : i
                );
            } else {
                newItems = [
                    ...state.items,
                    {
                        ...product,
                        productId: product.id,
                        quantity: qty,
                    },
                ];
            }
            return {
                items: newItems,
                totalPrice: newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
                totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
            };
        });
    },

    removeItem: (productId: string) => {
        set((state) => {
            const newItems = state.items.filter((i) => i.productId !== productId);
            return {
                items: newItems,
                totalPrice: newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
                totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
            };
        });
    },

    changeQuantity: (productId: string, delta: number) => {
        set((state) => {
            const newItems = state.items
                .map((item) => {
                    if (item.productId === productId) {
                        const newQty = item.quantity + delta;
                        // Remove if quantity becomes 0 or less, OR keep at 0? 
                        // Requirement usually implies > 0. Previous code filtered <= 0.
                        if (newQty <= 0) return null;
                        return { ...item, quantity: newQty };
                    }
                    return item;
                })
                .filter((item): item is CartItem => item !== null);

            return {
                items: newItems,
                totalPrice: newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
                totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
            };
        });
    },

    clearCart: () => set({ items: [], totalPrice: 0, totalItems: 0 }),
}));
