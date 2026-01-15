export interface RealWujiaOrder {
    orderNumber: string;
    status: string;
    totalAmount: number;
    products: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }>;
}

export const scrapeRealOrder = async (orderNumber: string): Promise<RealWujiaOrder> => {
    // Call the Vite middleware endpoint
    const response = await fetch('/api/scrape-wujia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Scraper Error: ${errText}`);
    }

    return response.json();
};
