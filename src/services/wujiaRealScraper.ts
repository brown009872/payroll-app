// import { wujiaLiveAuth } from './wujiaLiveAuth'; // Fallback or auth helper if needed
// Note: 'playwright' import will fail in pure Vite client build.  
// Assuming this is used in an environment where 'chromium' is available globally (Electron) 
// or via an IPC bridge. 
// For now, I will use a guarded import or rely on the user's provided snippet structure 
// but adapted to avoid immediate build crashes.

export interface RealWujiaOrder {
    orderNumber: string;      // "#123456"
    date: string;            // "29/12/2025"
    status: string;          // "Hoàn thành"
    totalAmount: number;     // 2450000
    products: Array<{
        nameVi: string;        // "Hồng Trà Đài Loan"
        nameCn: string;        // "台灣紅茶" 
        quantity: number;      // 10
        unit: string;          // "Bao"
        unitPrice: number;     // 125000
        total: number;         // 1250000
    }>;
}

export async function fetchRealOrderByNumber(orderNumber: string): Promise<RealWujiaOrder> {
    // DYNAMIC IMPORT or GLOBAL ACCESS to avoid Vite build error "module 'playwright' not found"
    // In a real Electron app, you'd use window.require('playwright') or IPC.
    // Here we strictly follow user code but guard it for the browser build.
    let chromium;
    try {
        // @ts-ignore
        if (typeof window !== 'undefined' && window.chromium) {
            // @ts-ignore
            chromium = window.chromium;
        } else {
            // This line forces Node.js check, preventing webpack/vite from trying to bundle it client-side
            // if (typeof process !== "undefined" && process.versions && process.versions.node) {
            //    const pw = await import('playwright');
            //    chromium = pw.chromium;
            // }
            throw new Error("Playwright not found properly. (Browser Mock Bypass Active)");
        }
    } catch (e) {
        console.warn("Playwright import failed or not in Node env:", e);
        // CRITICAL REQ: "NO FAKE DATA". 
        // If we can't load Playwright, we must fail or rely on a bridge.
        // For the sake of the 'Test Run' in this environment, 
        // we might be blocked if we can't actually run Playwright.
        // I will throw error to respect "Stop fake data".
        throw new Error("Cannot run Real Scraper: Playwright not available in this environment.");
    }

    const browser = await chromium.launch({
        headless: false,  // VISIBLE để debug
        slowMo: 1000      // 1s delay mỗi action
    });

    const page = await browser.newPage();

    try {
        // STEP 1: LIVE LOGIN
        await page.goto('https://shop.wujiatea.com.vn/en/web/login');
        await page.waitForSelector('input[type="email"], input[name="email"], #email, input[placeholder*="Email"]');

        // Fill credentials (multiple selectors để chắc chắn)
        await page.fill('input[type="email"], input[name="email"], #email, input[placeholder*="Email"]', 'H031');
        await page.fill('input[type="password"], input[name="password"], #password', 'FatalSSS@');
        await page.click('button[type="submit"], .btn-login, .login-btn');

        // await page.waitForURL(/.*dashboard.*/i, { timeout: 15000 });
        const regex = new RegExp(".*dashboard.*", "i");
        await page.waitForURL(regex, { timeout: 15000 });
        console.log('✅ Login success');

        // STEP 2: GO TO PURCHASE HISTORY
        await page.goto('https://shop.wujiatea.com.vn/en/portal/purchase_history');
        await page.waitForSelector('table, .table, .order-table, tbody tr', { timeout: 10000 });
        console.log('✅ Purchase History loaded');

        // STEP 3: SEARCH SPECIFIC ORDER NUMBER
        // Method 1: Filter input
        const filterInput = await page.waitForSelector('input[placeholder*="Tìm kiếm"], .search-input, #search', { timeout: 2000 }).catch(() => null);
        if (filterInput) {
            await filterInput.fill(orderNumber);
            await page.waitForTimeout(2000); // Wait filter
        }

        // Method 2: Direct search in table
        const orderRow = await page.waitForSelector(`td:has-text("${orderNumber}"), [data-order="${orderNumber}"], a[href*="${orderNumber}"]`, { timeout: 5000 });
        if (!orderRow) {
            throw new Error(`❌ Order #${orderNumber} not found`);
        }

        console.log('✅ Order found, clicking...');
        await orderRow.click();

        // STEP 4: SCRAPE ORDER DETAIL PAGE
        await page.waitForSelector('.order-detail, .order-products, table.order-items', { timeout: 10000 });

        const orderData = await page.evaluate(() => {
            const products: any[] = [];
            const rows = document.querySelectorAll('.order-items tr, .product-row');

            rows.forEach(row => {
                const nameCell = row.querySelector('.product-name, .name, td:nth-child(2)');
                const qtyCell = row.querySelector('.quantity, .qty, td:nth-child(3)');
                const priceCell = row.querySelector('.price, .unit-price, td:nth-child(4)');
                const totalCell = row.querySelector('.total, td:nth-child(5)');

                if (nameCell?.textContent?.trim()) {
                    products.push({
                        nameVi: nameCell.textContent.trim(),
                        nameCn: '', // Scraping CN name if available?
                        quantity: parseInt(qtyCell?.textContent?.trim() || '0'),
                        unit: 'Unit', // Default or extract
                        unitPrice: parseFloat(priceCell?.textContent?.replace(/[₫,]/g, '') || '0'),
                        total: parseFloat(totalCell?.textContent?.replace(/[₫,]/g, '') || '0')
                    });
                }
            });

            return {
                orderNumber: document.querySelector('.order-id, .order-number')?.textContent?.trim() || '',
                date: document.querySelector('.order-date')?.textContent?.trim() || '',
                status: document.querySelector('.order-status')?.textContent?.trim() || 'Completed',
                totalAmount: parseFloat(document.querySelector('.order-total')?.textContent?.replace(/[₫,]/g, '') || '0'),
                products
            };
        });

        console.log('✅ Order scraped:', orderData);
        // Ensure type match
        return {
            ...orderData,
            products: orderData.products.map((p: any) => ({
                ...p,
                nameCn: '', // logic to split if name has CN?
                unit: 'Unit'
            }))
        } as RealWujiaOrder;

    } catch (error) {
        console.error('❌ Scrape failed:', error);
        throw error;
    } finally {
        // await browser.close(); // Keep open for debugging
        // if (browser) await browser.close();
    }
}
