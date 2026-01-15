// Node.js worker - FULL Playwright scraper
// Note: This script runs in a Node.js process spawned by Vite, NOT in the browser.

const { chromium } = require('playwright');

async function scrapeOrder(orderNumber) {
    if (!orderNumber) {
        console.error('❌ Error: No order number provided');
        process.exit(1);
    }

    console.error(`🚀 Starting Scraper for Order #${orderNumber}...`);

    // Launch browser
    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const page = await browser.newPage();

    try {
        // 1. LOGIN WUJIA
        console.error('... Navigating to Login');
        await page.goto('https://shop.wujiatea.com.vn/en/web/login', {
            waitUntil: 'networkidle',
            timeout: 60000
        });

        // Wait for inputs
        await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 60000 });

        console.error('... Filling credentials (H031)');
        await page.fill('input[type="email"], input[name="email"], #email', 'H031');
        await page.fill('input[type="password"], input[name="password"], #password', 'FatalSSS@');
        await page.click('button[type="submit"], .btn-login');

        await page.waitForURL(/.*dashboard.*/i, { timeout: 60000 });
        console.error('✅ Login success');

        // 2. PURCHASE HISTORY
        console.error('... Going to Purchase History');
        await page.goto('https://shop.wujiatea.com.vn/en/portal/purchase_history', { timeout: 60000 });
        await page.waitForSelector('table, .table', { timeout: 60000 });

        // 3. SEARCH ORDER
        console.error(`... Searching for order ${orderNumber}`);
        // Try multiple selector strategies
        const orderRow = await page.waitForSelector(
            `text=${orderNumber}, td:has-text("${orderNumber}"), a[href*="${orderNumber}"]`,
            { timeout: 30000 }
        );

        if (!orderRow) throw new Error(`Order ${orderNumber} not found in list`);

        await orderRow.click();

        // 4. SCRAPE ORDER DETAIL
        console.error('... Scraping details');
        await page.waitForSelector('.order-detail, .order-products, table.order-items', { timeout: 30000 });

        const orderData = await page.evaluate((orderNum) => {
            const products = Array.from(document.querySelectorAll('.order-items tr, .product-row')).map(row => {
                const name = row.querySelector('.product-name, .name, td:nth-child(2)')?.textContent?.trim() || '';
                const qtyVal = row.querySelector('.quantity, .qty, td:nth-child(3)')?.textContent?.trim() || '0';
                const priceVal = row.querySelector('.price, .unit-price, td:nth-child(4)')?.textContent?.replace(/[₫,]/g, '') || '0';
                const totalVal = row.querySelector('.total, td:nth-child(5)')?.textContent?.replace(/[₫,]/g, '') || '0';

                return {
                    name,
                    quantity: parseInt(qtyVal),
                    unitPrice: parseFloat(priceVal),
                    total: parseFloat(totalVal)
                };
            }).filter(p => p.name);

            return {
                orderNumber: orderNum,
                status: document.querySelector('.order-status')?.textContent?.trim() || 'Đã xử lý',
                totalAmount: parseFloat(document.querySelector('.order-total')?.textContent?.replace(/[₫,]/g, '') || '0'),
                products
            };
        }, orderNumber);

        await browser.close();

        // Output JSON to stdout (ONLY this line ideally)
        process.stdout.write(JSON.stringify(orderData));
        process.exit(0);

    } catch (error) {
        if (browser) await browser.close();
        console.error('❌ Scrape failed:', error.message);
        // Log error to stdout for debugging if needed, or stderr
        process.stderr.write(JSON.stringify({ error: error.message }));
        process.exit(1);
    }
}

// CLI usage
const orderArg = process.argv[2];
scrapeOrder(orderArg);
