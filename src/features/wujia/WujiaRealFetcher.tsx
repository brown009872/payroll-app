import React, { useState } from 'react';
import { Card, Button, Input, message, Table, Space, Collapse } from 'antd';
import { SyncOutlined, EnterOutlined } from '@ant-design/icons';
import { scrapeRealOrder } from '../../api/wujiaApi';
import type { RealWujiaOrder } from '../../api/wujiaApi';
import { useInventory } from '../../hooks/useInventory';

export const WujiaRealFetcher: React.FC = () => {
    const [orderNumber, setOrderNumber] = useState('');
    const [fetchedOrder, setFetchedOrder] = useState<RealWujiaOrder | null>(null);
    const [isFetching, setIsFetching] = useState(false);

    // Inventory hook
    const { addRecord } = useInventory();

    const formatVND = (n: number) =>
        n ? n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '0 ₫';

    const fetchSpecificOrder = async () => {
        if (!orderNumber) {
            message.warning('Vui lòng nhập Order Number!');
            return;
        }

        try {
            setIsFetching(true);
            setFetchedOrder(null);

            message.loading(`Starting Real Scraper (Node Worker) for Order #${orderNumber}...`);
            // Call Node Worker via API
            const order = await scrapeRealOrder(orderNumber);

            setFetchedOrder(order);
            message.success(`✅ Fetched Order #${order.orderNumber || orderNumber}: ${formatVND(order.totalAmount)}`);

        } catch (error: any) {
            message.error(error.message || 'Failed to fetch order');
            console.error(error);
        } finally {
            setIsFetching(false);
        }
    };

    const importToInventory = (order: RealWujiaOrder) => {
        message.loading('Importing to Inventory...');
        let count = 0;
        order.products.forEach(p => {
            addRecord({
                date: new Date().toISOString().split('T')[0],
                product: p.name || 'Unknown Product',
                start_qty: 0,
                ordered: p.quantity,
                consumed: 0,
                end_qty: p.quantity,
                ceiling_weekday: 0,
                ceiling_weekend: 0,
                efficiency: 0
            });
            count++;
        });
        message.success(`✅ Imported ${count} items from Order #${order.orderNumber} to Inventory!`);
    };

    return (
        <Card title="🔍 Wujia Real Order Fetcher (Node Worker)" className="w-full mb-4 border-purple-200">
            <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                    placeholder="Enter Order Number (e.g., 533145)"
                    value={orderNumber}
                    onChange={e => setOrderNumber(e.target.value)}
                    onPressEnter={fetchSpecificOrder}
                    suffix={<EnterOutlined />}
                    size="large"
                />

                <Button
                    type="primary"
                    onClick={fetchSpecificOrder}
                    loading={isFetching}
                    icon={<SyncOutlined spin={isFetching} />}
                    size="large"
                    className="bg-purple-600 hover:bg-purple-500 w-full"
                >
                    🚀 Fetch REAL Order from Wujia (Node Worker)
                </Button>
            </Space>

            {fetchedOrder && (
                <Collapse style={{ marginTop: 16 }} defaultActiveKey={['1']}>
                    <Collapse.Panel header={`#${fetchedOrder.orderNumber || 'Unknown'} - ${formatVND(fetchedOrder.totalAmount)}`} key="1">
                        <Table
                            dataSource={fetchedOrder.products}
                            rowKey="name"
                            columns={[
                                { title: 'Sản phẩm', dataIndex: 'name', width: '50%' },
                                { title: 'SL', dataIndex: 'quantity', align: 'center', width: 80 },
                                { title: 'Đơn giá', render: (_, p) => formatVND(p.unitPrice), align: 'right', width: 120 },
                                { title: 'Thành tiền', render: (_, p) => formatVND(p.total), align: 'right', width: 120 }
                            ]}
                            pagination={false}
                            size="small"
                        />
                        <div style={{ textAlign: 'right', marginTop: 16, fontSize: 18, fontWeight: 'bold' }}>
                            Tổng cộng: {formatVND(fetchedOrder.totalAmount)}
                        </div>
                        <Button
                            type="primary"
                            onClick={() => importToInventory(fetchedOrder)}
                            style={{ marginTop: 8 }}
                            block
                        >
                            📥 Import to Inventory
                        </Button>
                    </Collapse.Panel>
                </Collapse>
            )}
        </Card>
    );
};
