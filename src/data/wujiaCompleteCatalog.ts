export interface WujiaProduct {
    id: string;
    name: string;
    vietnameseName: string;
    chineseName: string;
    packaging: string;
    unit: string;
    unitPrice: number;
    unitPriceFormatted: string;
    category: 'tea' | 'beverage' | 'topping' | 'milk' | 'powder' | 'syrup' | 'dessert' | 'packaging' | 'other';
    page: number;
    supplier: 'Wujia Tea';
    sku: string;
    searchKeywords: string[];
    createdAt: string;
    status: 'active';
}

export const WUJIA_COMPLETE_CATALOG: WujiaProduct[] = [
    // PAGE 1
    {
        id: 'wujia-001',
        name: 'Hồng Trà Đài Loan',
        vietnameseName: 'Hồng Trà Đài Loan - 台灣紅茶',
        chineseName: '台灣紅茶',
        packaging: '10kg/bao',
        unit: 'Bao',
        unitPrice: 125000,
        unitPriceFormatted: '125,000 ₫',
        category: 'tea',
        page: 1,
        supplier: 'Wujia Tea',
        sku: 'HTDL-10KG',
        searchKeywords: ['hong tra', 'dai loan', 'black tea'],
        createdAt: '2025-12-28',
        status: 'active'
    },
    {
        id: 'wujia-002',
        name: 'Hồng Trà Đài Loan KHÔNG Đường',
        vietnameseName: 'Hồng Trà Đài Loan KHÔNG Đường - 台灣無糖紅茶',
        chineseName: '台灣無糖紅茶',
        packaging: '4kg/bao',
        unit: 'Bao',
        unitPrice: 45000,
        unitPriceFormatted: '45,000 ₫',
        category: 'tea',
        page: 1,
        supplier: 'Wujia Tea',
        sku: 'HTDLKT-4KG',
        searchKeywords: ['hong tra khong duong', 'sugar free'],
        createdAt: '2025-12-28',
        status: 'active'
    },
    {
        id: 'wujia-003',
        name: 'Trà Bí Đao',
        vietnameseName: 'Trà Bí Đao - 冬瓜茶',
        chineseName: '冬瓜茶',
        packaging: '10kg/bao',
        unit: 'Bao',
        unitPrice: 132000,
        unitPriceFormatted: '132,000 ₫',
        category: 'beverage',
        page: 1,
        supplier: 'Wujia Tea',
        sku: 'TBD-10KG',
        searchKeywords: ['tra bi dao', 'winter melon'],
        createdAt: '2025-12-28',
        status: 'active'
    },
    {
        id: 'wujia-004',
        name: 'Trà Xí Muội Ngô Gia',
        vietnameseName: 'Trà Xí Muội Ngô Gia - 吳家酸梅湯',
        chineseName: '吳家酸梅湯',
        packaging: '10kg/bao',
        unit: 'Bao',
        unitPrice: 160000,
        unitPriceFormatted: '160,000 ₫',
        category: 'beverage',
        page: 1,
        supplier: 'Wujia Tea',
        sku: 'TXMNG-10KG',
        searchKeywords: ['tra xi muoi', 'plum tea'],
        createdAt: '2025-12-28',
        status: 'active'
    },
    // PAGE 2
    {
        id: 'wujia-005',
        name: 'Hồng Trà Vải Thiều',
        vietnameseName: 'Hồng Trà Vải Thiều - 荔枝紅茶',
        chineseName: '荔枝紅茶',
        packaging: '10kg/bao',
        unit: 'Bao',
        unitPrice: 132000,
        unitPriceFormatted: '132,000 ₫',
        category: 'tea',
        page: 2,
        supplier: 'Wujia Tea',
        sku: 'HTVT-10KG',
        searchKeywords: ['hong tra vai', 'lychee tea'],
        createdAt: '2025-12-28',
        status: 'active'
    },
    {
        id: 'wujia-006',
        name: 'Trà Xanh Hoa Nhài',
        vietnameseName: 'Trà Xanh Hoa Nhài - 綠茶',
        chineseName: '綠茶',
        packaging: '10kg/bao',
        unit: 'Bao',
        unitPrice: 132000,
        unitPriceFormatted: '132,000 ₫',
        category: 'tea',
        page: 2,
        supplier: 'Wujia Tea',
        sku: 'TXHN-10KG',
        searchKeywords: ['tra xanh', 'hoa nhai', 'jasmine green tea'],
        createdAt: '2025-12-28',
        status: 'active'
    },
    {
        id: 'wujia-007',
        name: 'Trà Xanh KHÔNG Đường',
        vietnameseName: 'Trà Xanh KHÔNG Đường - 無糖綠',
        chineseName: '無糖綠',
        packaging: '4kg/bao',
        unit: 'Bao',
        unitPrice: 50000,
        unitPriceFormatted: '50,000 ₫',
        category: 'tea',
        page: 2,
        supplier: 'Wujia Tea',
        sku: 'TXKT-4KG',
        searchKeywords: ['tra xanh khong duong'],
        createdAt: '2025-12-28',
        status: 'active'
    },
    // PAGE 3
    {
        id: 'wujia-008',
        name: 'Trà Ô Long Bạch Đào có đường',
        vietnameseName: 'Trà Ô Long Bạch Đào có đường - 白桃烏龍茶有糖',
        chineseName: '白桃烏龍茶有糖',
        packaging: '10kg/bao',
        unit: 'Bao',
        unitPrice: 132000,
        unitPriceFormatted: '132,000 ₫',
        category: 'tea',
        page: 3,
        supplier: 'Wujia Tea',
        sku: 'TOLBDCT-10KG',
        searchKeywords: ['o long bach dao', 'oolong peach'],
        createdAt: '2025-12-28',
        status: 'active'
    },
    {
        id: 'wujia-009',
        name: 'Trà Ô Long Bạch Đào không đường',
        vietnameseName: 'Trà Ô Long Bạch Đào không đường - 白桃烏龍茶無糖',
        chineseName: '白桃烏龍茶無糖',
        packaging: '4kg/bao',
        unit: 'Bao',
        unitPrice: 50000,
        unitPriceFormatted: '50,000 ₫',
        category: 'tea',
        page: 3,
        supplier: 'Wujia Tea',
        sku: 'TOLBDKT-4KG',
        searchKeywords: ['o long bach dao khong duong'],
        createdAt: '2025-12-28',
        status: 'active'
    },
    // PAGE 7 (New)
    { id: 'wujia-701', name: 'Thạch Trân (10g)', vietnameseName: 'Thạch Trân (10g) - 大珍珠', chineseName: '大珍珠', packaging: '10g', unit: 'Cái', unitPrice: 270000, unitPriceFormatted: '270,000 ₫', category: 'topping', page: 7, supplier: 'Wujia Tea', sku: 'TT10G', searchKeywords: ['thạch trân', 'trân châu lớn'], createdAt: '2025-12-28', status: 'active' },
    { id: 'wujia-702', name: 'Thạch Trân (4g)', vietnameseName: 'Thạch Trân (4g) - 小珍珠', chineseName: '小珍珠', packaging: '4g', unit: 'Cái', unitPrice: 170000, unitPriceFormatted: '170,000 ₫', category: 'topping', page: 7, supplier: 'Wujia Tea', sku: 'TT4G', searchKeywords: ['thạch trân nhỏ'], createdAt: '2025-12-28', status: 'active' },
    { id: 'wujia-703', name: 'Nắp Đáy Trà', vietnameseName: 'Nắp Đáy Trà - 茶底蓋', chineseName: '茶底蓋', packaging: '', unit: 'Cái', unitPrice: 85000, unitPriceFormatted: '85,000 ₫', category: 'packaging', page: 7, supplier: 'Wujia Tea', sku: 'NDT', searchKeywords: ['nắp đáy', 'nắp trà'], createdAt: '2025-12-28', status: 'active' },
    { id: 'wujia-704', name: 'Nắp Trà Sữa', vietnameseName: 'Nắp Trà Sữa - 奶茶蓋', chineseName: '奶茶蓋', packaging: '', unit: 'Cái', unitPrice: 85000, unitPriceFormatted: '85,000 ₫', category: 'packaging', page: 7, supplier: 'Wujia Tea', sku: 'NTS', searchKeywords: ['nắp trà sữa'], createdAt: '2025-12-28', status: 'active' },
    { id: 'wujia-705', name: 'Nắp Kem Che', vietnameseName: 'Nắp Kem Che - 封口膜', chineseName: '封口膜', packaging: '10,000 cái', unit: 'Thùng', unitPrice: 380000, unitPriceFormatted: '380,000 ₫', category: 'packaging', page: 7, supplier: 'Wujia Tea', sku: 'NKC-10K', searchKeywords: ['nắp kem', 'màng dán'], createdAt: '2025-12-28', status: 'active' },
    { id: 'wujia-706', name: 'Nắp Khay', vietnameseName: 'Nắp Khay - 托盤蓋', chineseName: '托盤蓋', packaging: '1,000 cái', unit: 'Cái', unitPrice: 70000, unitPriceFormatted: '70,000 ₫', category: 'packaging', page: 7, supplier: 'Wujia Tea', sku: 'NK', searchKeywords: ['nắp khay'], createdAt: '2025-12-28', status: 'active' },
    { id: 'wujia-707', name: 'Nắp Ly 50cl', vietnameseName: 'Nắp Ly 50cl - 50cl蓋', chineseName: '50cl蓋', packaging: '1,000 cái', unit: 'Thùng', unitPrice: 540000, unitPriceFormatted: '540,000 ₫', category: 'packaging', page: 7, supplier: 'Wujia Tea', sku: 'NL50CL', searchKeywords: ['nắp ly 50'], createdAt: '2025-12-28', status: 'active' },
    { id: 'wujia-708', name: 'Nắp Ly 10cl', vietnameseName: 'Nắp Ly 10cl - 10cl蓋', chineseName: '10cl蓋', packaging: '1,000 cái', unit: 'Thùng', unitPrice: 380000, unitPriceFormatted: '380,000 ₫', category: 'packaging', page: 7, supplier: 'Wujia Tea', sku: 'NL10CL', searchKeywords: ['nắp ly 10'], createdAt: '2025-12-28', status: 'active' },
    { id: 'wujia-709', name: 'Mực Nêm Kem', vietnameseName: 'Mực Nêm Kem - 封口墨', chineseName: '封口墨', packaging: '', unit: 'Cái', unitPrice: 150000, unitPriceFormatted: '150,000 ₫', category: 'packaging', page: 7, supplier: 'Wujia Tea', sku: 'MNK', searchKeywords: ['mực nêm', 'mực dán'], createdAt: '2025-12-28', status: 'active' },
    { id: 'wujia-710', name: 'Máy Nêm', vietnameseName: 'Máy Nêm - 封口機', chineseName: '封口機', packaging: '', unit: 'Cái', unitPrice: 600000, unitPriceFormatted: '600,000 ₫', category: 'packaging', page: 7, supplier: 'Wujia Tea', sku: 'MN', searchKeywords: ['máy nêm'], createdAt: '2025-12-28', status: 'active' },

    // PAGE 8
    { id: 'wujia-801', name: 'Áo Phông Nam Size L', vietnameseName: 'Áo Phông Nam Size L - 男士T恤L', chineseName: '男士T恤L', packaging: '', unit: 'Cái', unitPrice: 120000, unitPriceFormatted: '120,000 ₫', category: 'packaging', page: 8, supplier: 'Wujia Tea', sku: 'APN-L', searchKeywords: ['áo nam L'], createdAt: '2025-12-28', status: 'active' },
    { id: 'wujia-802', name: 'Áo Phông Nam Size XL', vietnameseName: 'Áo Phông Nam Size XL - 男士T恤XL', chineseName: '男士T恤XL', packaging: '', unit: 'Cái', unitPrice: 120000, unitPriceFormatted: '120,000 ₫', category: 'packaging', page: 8, supplier: 'Wujia Tea', sku: 'APN-XL', searchKeywords: ['áo nam XL'], createdAt: '2025-12-28', status: 'active' },
    { id: 'wujia-803', name: 'Ly Đựng Topping', vietnameseName: 'Ly Đựng Topping - 配料杯', chineseName: '配料杯', packaging: '100 cái/thùng', unit: 'Thùng', unitPrice: 620000, unitPriceFormatted: '620,000 ₫', category: 'packaging', page: 8, supplier: 'Wujia Tea', sku: 'LDT-100', searchKeywords: ['ly topping'], createdAt: '2025-12-28', status: 'active' },
    { id: 'wujia-804', name: 'Ly Nhựa 90cc', vietnameseName: 'Ly Nhựa 90cc (Sinh) - 90cc塑膠杯', chineseName: '90cc塑膠杯', packaging: '1,000 cái', unit: 'Thùng', unitPrice: 890000, unitPriceFormatted: '890,000 ₫', category: 'packaging', page: 8, supplier: 'Wujia Tea', sku: 'LN90CC', searchKeywords: ['ly 90cc'], createdAt: '2025-12-28', status: 'active' },
    { id: 'wujia-805', name: 'Ly Nhựa 70cc', vietnameseName: 'Ly Nhựa 70cc (Sinh) - 70cc塑膠杯', chineseName: '70cc塑膠杯', packaging: '1,000 cái', unit: 'Thùng', unitPrice: 750000, unitPriceFormatted: '750,000 ₫', category: 'packaging', page: 8, supplier: 'Wujia Tea', sku: 'LN70CC', searchKeywords: ['ly 70cc'], createdAt: '2025-12-28', status: 'active' },

    // PAGE 9
    { id: 'wujia-901', name: 'Ống Hút 1000', vietnameseName: 'Ống Hút 1000 - 吸管', chineseName: '吸管', packaging: '1,000 cái', unit: 'Thùng', unitPrice: 60000, unitPriceFormatted: '60,000 ₫', category: 'packaging', page: 9, supplier: 'Wujia Tea', sku: 'OH-1000', searchKeywords: ['ống hút'], createdAt: '2025-12-28', status: 'active' },
    { id: 'wujia-902', name: 'Ống Hút Nhỏ 3000', vietnameseName: 'Ống Hút Nhỏ 3000 - 小吸管', chineseName: '小吸管', packaging: '3,000 cái', unit: 'Thùng', unitPrice: 48000, unitPriceFormatted: '48,000 ₫', category: 'packaging', page: 9, supplier: 'Wujia Tea', sku: 'OHN-3000', searchKeywords: ['ống hút nhỏ'], createdAt: '2025-12-28', status: 'active' },
    { id: 'wujia-903', name: 'Ống Hút Nhỏ 3000', vietnameseName: 'Ống Hút Nhỏ 3000 - 小吸管', chineseName: '小吸管', packaging: '3,000 cái', unit: 'Thùng', unitPrice: 48000, unitPriceFormatted: '48,000 ₫', category: 'packaging', page: 9, supplier: 'Wujia Tea', sku: 'OHN-3000B', searchKeywords: ['ống hút nhỏ'], createdAt: '2025-12-28', status: 'active' },
    // PAGE 9 (Dessert from prev)
    {
        id: 'wujia-010',
        name: 'Pudding Trứng',
        vietnameseName: 'Pudding Trứng - 鸡蛋布丁',
        chineseName: '鸡蛋布丁',
        packaging: '120 cái / thùng',
        unit: 'Hộp',
        unitPrice: 5000,
        unitPriceFormatted: '5,000 ₫',
        category: 'dessert',
        page: 9,
        supplier: 'Wujia Tea',
        sku: 'PT-120CAI',
        searchKeywords: ['pudding trung', 'egg pudding'],
        createdAt: '2025-12-28',
        status: 'active'
    }
];

// 🔥 SEARCH ENGINE WITH KEYWORDS
export const searchWujiaProducts = (query: string): WujiaProduct[] => {
    const q = query.toLowerCase().trim();
    if (!q) return WUJIA_COMPLETE_CATALOG.slice(0, 20);

    return WUJIA_COMPLETE_CATALOG.filter(product =>
        product.searchKeywords.some(keyword => keyword.includes(q)) ||
        product.name.toLowerCase().includes(q) ||
        product.vietnameseName.toLowerCase().includes(q)
    ).slice(0, 20);
};
