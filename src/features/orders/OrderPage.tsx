import React, { useState, useMemo } from 'react';
import { Tabs, Space, Input, Button, Table, message, Card } from 'antd';
import { useInventory } from '../../hooks/useInventory';
import { searchWujiaProducts } from '../../data/wujiaCompleteCatalog';
import type { WujiaProduct } from '../../data/wujiaCompleteCatalog';
import { getTodayStr } from '../../utils/date';
import type { OrderRecord } from '../../types/inventory';

export const OrderPage: React.FC = () => {
    // Mapping useInventory to expected interface
    const { orders, addOrder } = useInventory();

    const [activeTab, setActiveTab] = useState('import');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() =>
        searchWujiaProducts(searchTerm)
        , [searchTerm]);

    const handleQuickImport = (product: WujiaProduct, quantity: number = 1) => {
        const order: OrderRecord = {
            id: `order-${Date.now()}-${Math.random()}`,
            date: getTodayStr(),
            supplier: 'Wujia Tea',
            itemName: product.vietnameseName,
            quantity,
            unitPrice: product.unitPrice,
            totalPrice: product.unitPrice * quantity,
            invoiceNumber: `WUJIA-${product.sku}`,
            receivedBy: '',
            status: 'pending',
            notes: `${product.packaging} - Nhập nhanh từ catalog`,
            isWujiaCatalogItem: true,
            wujiaProductId: product.id
        };
        addOrder(order);
        message.success(`✅ Đã thêm ${quantity} ${product.name}`);
    };

    const columns = [
        { title: 'Sản phẩm', dataIndex: 'vietnameseName', key: 'name', render: (text: string) => <b>{text}</b> },
        { title: 'Đóng gói', dataIndex: 'packaging', key: 'packaging' },
        { title: 'Đơn vị', dataIndex: 'unit', key: 'unit' },
        { title: 'Giá', dataIndex: 'unitPriceFormatted', key: 'price', render: (text: string) => <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{text}</span> },
        {
            title: 'Số lượng',
            key: 'action',
            render: (_: any, product: WujiaProduct) => (
                <Space>
                    <Button size="small" onClick={() => handleQuickImport(product, 1)}>1</Button>
                    <Button size="small" onClick={() => handleQuickImport(product, 10)}>10</Button>
                    <Button size="small" type="primary" onClick={() => handleQuickImport(product, 50)}>50</Button>
                </Space>
            )
        }
    ];

    const orderColumns = [
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Item', dataIndex: 'itemName', key: 'item' },
        { title: 'Qty', dataIndex: 'quantity', key: 'qty' },
        { title: 'Total', dataIndex: 'totalPrice', key: 'total', render: (val: number) => val.toLocaleString() + ' ₫' },
        { title: 'Status', dataIndex: 'status', key: 'status' },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h1 className="text-2xl font-bold mb-4">Orders Center</h1>
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
                {
                    key: 'import',
                    label: '📦 Import Orders',
                    children: (
                        <>
                            <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
                                <Input.Search
                                    placeholder="🔍 Tìm sản phẩm (Trà, Thạch, Nắp, Ống hút...)"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: 300 }}
                                    allowClear
                                />
                                {/* Safe fallback if catalog is empty or filtered out */}
                                {filteredProducts.length > 0 && (
                                    <Button type="primary" onClick={() => handleQuickImport(filteredProducts[0], 10)}>
                                        🚀 Nhập nhanh 10kg {filteredProducts[0].name}
                                    </Button>
                                )}
                            </Space>

                            <Table
                                dataSource={filteredProducts}
                                columns={columns}
                                rowKey="id"
                                pagination={{ pageSize: 15 }}
                                size="middle"
                                scroll={{ y: 500 }}
                            />

                            <Card title="Recent Orders" className="mt-8">
                                <Table dataSource={orders} columns={orderColumns} rowKey="id" />
                            </Card>
                        </>
                    )
                },
                {
                    key: 'export',
                    label: '📤 Export Orders',
                    children: (
                        <div>
                            <p>Export / Consumption tracking available in Inventory Tab.</p>
                        </div>
                    )
                }
            ]} />
        </div>
    );
};
