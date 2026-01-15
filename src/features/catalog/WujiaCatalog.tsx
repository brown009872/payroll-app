import React, { useState, useMemo } from 'react';
import { Table, Input, Button, Card, Space, List, Divider, Select } from 'antd';
import { ShoppingCartOutlined, PlusOutlined, MinusOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import { WUJIA_PRODUCTS } from '../../data/wujiaProducts';
import type { WujiaProduct, WujiaCategory } from '../../data/wujiaProducts';
import { useWujiaCart } from '../../hooks/useWujiaCart';
import type { CartItem } from '../../hooks/useWujiaCart';

const { Search } = Input;

export interface WujiaCatalogProps {
    onCreateOrder?: (lines: CartItem[]) => void;
}

const formatVnd = (n: number) =>
    n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

import { LoginOutlined, LogoutOutlined, CalendarOutlined, SelectOutlined } from '@ant-design/icons';
import { Collapse } from 'antd';
import { WujiaLoginModal } from '../wujia/WujiaLoginModal';
import { WujiaDateFetcherModal } from '../wujia/WujiaDateFetcherModal';
import { WujiaManualSelector } from '../wujia/WujiaManualSelector';
import { WujiaLiveFetcher } from '../wujia/WujiaLiveFetcher';
import { WujiaRealFetcher } from '../wujia/WujiaRealFetcher';
import { useWujiaLiveSync } from '../../hooks/useWujiaLiveSync';

export const WujiaCatalog: React.FC<WujiaCatalogProps> = ({ onCreateOrder }) => {
    const [activeCategory, setActiveCategory] = useState<WujiaCategory | 'ALL'>('ALL');
    const [searchText, setSearchText] = useState('');
    // Old Fetcher Modal (keeping for backward compat or removing? Promp implues "Build complete... v6.1")
    // The prompt says "UI FLOW (Orders Tab - Wujia Section) // NEW SECTION - Above existing Wujia Catalog"
    // I will keep the old "Fetch Wujia Live" button just in case, but usually v6.1 supersedes it. 
    // Actually, I'll replace the old red button with this new system as requested in "UI FLOW".

    // UI State for v6.1
    const [loginVisible, setLoginVisible] = useState(false);
    const [dateFetchVisible, setDateFetchVisible] = useState(false);
    const [manualSelectorVisible, setManualSelectorVisible] = useState(false);

    const { items, addItem, removeItem, changeQuantity, clearCart, totalPrice } = useWujiaCart();
    const { isLoggedIn, username, fetchOrders, importOrdersToCart } = useWujiaLiveSync();

    const filteredProducts = useMemo(() => {
        return WUJIA_PRODUCTS.filter((p) => {
            const matchCategory = activeCategory === 'ALL' || p.category === activeCategory;
            const q = searchText.toLowerCase();
            const matchSearch =
                !searchText ||
                p.nameVi.toLowerCase().includes(q) ||
                p.nameCn.toLowerCase().includes(q) ||
                p.packaging.toLowerCase().includes(q);
            return matchCategory && matchSearch;
        });
    }, [activeCategory, searchText]);

    const columns = [
        {
            title: 'Product Name',
            key: 'name',
            render: (_: any, record: WujiaProduct) => (
                <div>
                    <div className="font-bold text-base">{record.nameVi}</div>
                    <div className="text-xs text-gray-500">{record.nameCn}</div>
                    <div className="text-xs text-gray-400 mt-1">{record.packaging}</div>
                </div>
            ),
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            key: 'unit',
            width: 80,
        },
        {
            title: 'Unit Price',
            dataIndex: 'unitPrice',
            key: 'price',
            width: 120,
            render: (val: number) => (
                <span className="text-green-600 font-semibold">{formatVnd(val)}</span>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            width: 80,
            render: (_: any, record: WujiaProduct) => (
                <Button
                    type="primary"
                    ghost
                    icon={<ShoppingCartOutlined />}
                    onClick={() => addItem(record)}
                />
            ),
        },
    ];

    const handleCreateOrder = () => {
        if (onCreateOrder) {
            onCreateOrder(items);
            clearCart();
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full gap-4 p-4 bg-gray-50 min-h-screen">
            {/* Modals v6.1 */}
            <WujiaLoginModal
                visible={loginVisible}
                onCancel={() => setLoginVisible(false)}
                onSuccess={() => setDateFetchVisible(true)} // Auto open Date Fetcher after login
            />
            <WujiaDateFetcherModal
                visible={dateFetchVisible}
                onCancel={() => setDateFetchVisible(false)}
                onFetch={async (date) => {
                    const orders = await fetchOrders(date);
                    if (orders.length > 0) importOrdersToCart(orders);
                }}
            />
            <WujiaManualSelector
                visible={manualSelectorVisible}
                onCancel={() => setManualSelectorVisible(false)}
            />

            {/* LEFT: Catalog */}
            <div className="flex-1 flex flex-col gap-4">
                {/* 0. REAL EXACT ORDER SCRAPER (NEW - HIGH PRIORITY) */}
                <WujiaRealFetcher />

                {/* 1. REAL LIVE FETCHER (NEW) */}
                <WujiaLiveFetcher />

                {/* 2. v6.1 AUTO-SYNC TOOLS (OLD) */}
                <Collapse
                    defaultActiveKey={['1']}
                    items={[{
                        key: '1',
                        label: '🔗 Wujia Auto-Sync',
                        children: (
                            <Space wrap>
                                <Button
                                    type={isLoggedIn ? "default" : "primary"}
                                    onClick={() => setLoginVisible(true)}
                                    icon={isLoggedIn ? <LogoutOutlined /> : <LoginOutlined />}
                                >
                                    {isLoggedIn ? `Đã đăng nhập (${username})` : '🔐 Login Wujia'}
                                </Button>

                                <Button
                                    disabled={!isLoggedIn}
                                    onClick={() => setDateFetchVisible(true)}
                                    icon={<CalendarOutlined />}
                                >
                                    📅 Fetch Orders by Date
                                </Button>

                                <Button
                                    disabled={!isLoggedIn}
                                    onClick={() => setManualSelectorVisible(true)}
                                    icon={<SelectOutlined />}
                                >
                                    ✂️ Manual Select Orders
                                </Button>
                            </Space>
                        )
                    }]}
                />

                <div className="bg-white p-4 rounded shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
                        <div className="flex items-center gap-4 flex-1">
                            <div style={{ minWidth: 200 }}>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Chọn danh mục"
                                    value={activeCategory}
                                    onChange={(val) => setActiveCategory(val)}
                                    size="large"
                                    options={[
                                        { value: 'ALL', label: 'Tất cả - 全部' },
                                        { value: 'TRA', label: 'Trà - 茶類' },
                                        { value: 'NGUYEN_LIEU', label: 'Nguyên liệu - 原料' },
                                        { value: 'PHU_LIEU', label: 'Phụ liệu - 輔料' },
                                        { value: 'VAT_LIEU', label: 'Vật liệu - 物料' },
                                        { value: 'SAN_PHAM_DAT_RIENG', label: 'Sản phẩm đặt riêng - 定制產品' },
                                        { value: 'THIET_BI', label: 'Thiết bị - 設備' }
                                    ]}
                                />
                            </div>
                            <Search
                                placeholder="Enter product name to search"
                                allowClear
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ maxWidth: 400, flex: 1 }}
                                size="large"
                            />
                        </div>
                    </div>

                    <Table
                        dataSource={filteredProducts}
                        columns={columns}
                        rowKey="id"
                        pagination={{ pageSize: 8 }}
                        size="middle"
                    />
                </div>
            </div>

            {/* RIGHT: Cart Summary */}
            <div className="w-full lg:w-96 flex-shrink-0">
                <Card title={<Space><ShoppingCartOutlined /> Cart Summary</Space>} className="h-full shadow-sm">
                    {items.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                            No items in cart
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto max-h-[60vh]">
                                <List
                                    dataSource={items}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <div className="w-full">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">{item.nameVi}</div>
                                                        <div className="text-xs text-gray-400">{item.unit} | {formatVnd(item.unitPrice)}</div>
                                                    </div>
                                                    <div className="text-right font-semibold text-sm">
                                                        {formatVnd(item.unitPrice * item.quantity)}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center mt-2 bg-gray-50 p-1 rounded">
                                                    <Button size="small" icon={<MinusOutlined />} onClick={() => changeQuantity(item.productId, -1)} />
                                                    <span className="mx-2 font-bold">{item.quantity}</span>
                                                    <Button size="small" icon={<PlusOutlined />} onClick={() => changeQuantity(item.productId, 1)} />
                                                    <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(item.productId)} className="ml-auto" />
                                                </div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </div>

                            <Divider />

                            <div className="mt-auto">
                                <div className="flex justify-between text-lg font-bold mb-4">
                                    <span>Total:</span>
                                    <span className="text-blue-600">{formatVnd(totalPrice)}</span>
                                </div>

                                <Button
                                    type="primary"
                                    block
                                    size="large"
                                    icon={<FileTextOutlined />}
                                    onClick={handleCreateOrder}
                                    disabled={items.length === 0}
                                >
                                    Create Import Order
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
