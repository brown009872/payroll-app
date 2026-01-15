import React, { useState, useEffect } from 'react';
import { Modal, Table, Checkbox, Button, Space, Tag, Typography, Pagination, Card } from 'antd';
import { useWujiaLiveSync } from '../../hooks/useWujiaLiveSync';
import type { WujiaLiveOrder } from '../../services/wujiaLiveFetcher';
import dayjs from 'dayjs';
import { WujiaDateFetcherModal } from './WujiaDateFetcherModal';

const { Text } = Typography;

interface Props {
    visible: boolean;
    onCancel: () => void;
}

const formatVND = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export const WujiaManualSelector: React.FC<Props> = ({ visible, onCancel }) => {
    // Hooks
    const { fetchOrders, importOrdersToCart, liveOrders, loading } = useWujiaLiveSync();

    // State
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [openDateFetch, setOpenDateFetch] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentDate, setCurrentDate] = useState(dayjs().format('YYYY-MM-DD'));

    // On open, maybe fetch today's orders automatically? Or wait for date selection.
    // For this flow, let's assume we triggered a fetch before or we offer to fetch now.
    // The prompt implies "Fetch 2025-12-29 -> 5 orders found -> OR Manual Select".
    // So let's just use the `liveOrders` from the hook which should be shared if we used a context, 
    // but since `useWujiaLiveSync` is a local hook (it doesn't use Context/Zustand), 
    // we need to manage the fetch *inside* this component or lift the state.
    // **Correction**: Ideally `useWujiaLiveSync` should be a store or context to share `liveOrders`.
    // BUT the prompt has "4. CORE FETCHING SERVICE... 5. SESSION MANAGEMENT".
    // I will use local fetch here for the manual selector capability.

    useEffect(() => {
        if (visible && liveOrders.length === 0) {
            // Initial fetch or prompt
            handleFetch(currentDate);
        }
    }, [visible]);

    const handleFetch = async (date: string) => {
        setCurrentDate(date);
        await fetchOrders(date);
    };

    const toggleOrder = (orderId: string, checked: boolean) => {
        if (checked) {
            setSelectedOrders(prev => [...prev, orderId]);
        } else {
            setSelectedOrders(prev => prev.filter(id => id !== orderId));
        }
    };

    const importSelectedOrders = () => {
        const orders = liveOrders.filter(o => selectedOrders.includes(o.orderId));
        importOrdersToCart(orders);
        onCancel();
    };

    const selectedTotal = liveOrders
        .filter(o => selectedOrders.includes(o.orderId))
        .reduce((sum, o) => sum + o.totalAmount, 0);

    const wujiaHistoryColumns = [
        {
            title: 'ĐƠN HÀNG',
            dataIndex: 'orderId',
            width: 120,
            render: (id: string) => <Tag color="blue">#{id}</Tag>
        },
        {
            title: 'NGÀY',
            dataIndex: 'date',
            width: 100,
            render: (date: string) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'SẢN PHẨM',
            width: 250,
            render: (_: any, order: WujiaLiveOrder) => (
                <Space direction="vertical" size={0}>
                    {order.products.slice(0, 3).map(product => (
                        <div key={product.id} style={{ fontSize: 13 }}>
                            <span style={{ color: '#1890ff', fontWeight: 500 }}>{product.nameVi}</span>
                            <span style={{ color: '#666', marginLeft: 8, fontSize: 12 }}>
                                {product.nameCn}
                            </span>
                        </div>
                    ))}
                    {order.products.length > 3 && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            +{order.products.length - 3} sản phẩm khác
                        </Text>
                    )}
                </Space>
            )
        },
        {
            title: 'SL',
            dataIndex: 'products',
            width: 60,
            align: 'center' as const,
            render: (products: any[]) => products.reduce((sum, p) => sum + p.quantity, 0)
        },
        {
            title: 'ĐG',
            width: 80,
            align: 'right' as const,
            render: (_: any, order: WujiaLiveOrder) => formatVND(order.products[0]?.unitPrice || 0)
        },
        {
            title: 'THÀNH TIỀN',
            width: 140,
            align: 'right' as const,
            render: (_: any, order: WujiaLiveOrder) => (
                <Space direction="vertical" size={0} style={{ width: '100%', textAlign: 'right' }}>
                    <div style={{ fontWeight: 500, color: '#52c41a' }}>
                        {formatVND(order.totalAmount)}
                    </div>
                    {order.products.length > 1 && (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            {order.products.length} SP
                        </Text>
                    )}
                </Space>
            )
        },
        {
            title: 'IMPORT',
            width: 100,
            align: 'center' as const,
            render: (_: any, order: WujiaLiveOrder) => (
                <Checkbox
                    checked={selectedOrders.includes(order.orderId)}
                    onChange={e => toggleOrder(order.orderId, e.target.checked)}
                >
                    Import
                </Checkbox>
            )
        }
    ];

    return (
        <Modal
            title="📋 Wujia Purchase History - Chọn đơn hàng để Import"
            width={1200}
            open={visible}
            onCancel={onCancel}
            footer={null}
        >
            <div className="mb-4 flex justify-between items-center">
                <div>
                    Viewing orders for: <span className="font-bold">{currentDate}</span>
                </div>
                <Button onClick={() => setOpenDateFetch(true)}>Change Date</Button>
            </div>

            <Table
                columns={wujiaHistoryColumns}
                dataSource={liveOrders}
                pagination={false}
                scroll={{ y: 500 }}
                size="middle"
                rowKey="orderId"
                loading={loading}
            />

            {/* Pagination + Filters */}
            <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Pagination
                    current={currentPage}
                    total={liveOrders.length}
                    pageSize={10}
                    showSizeChanger={false}
                    showQuickJumper={false}
                    onChange={setCurrentPage}
                />
                <Space style={{ marginLeft: 16 }}>
                    <Button size="small">Tất cả</Button>
                    <Button size="small">Hôm nay</Button>
                    <Button size="small">Tuần này</Button>
                    <Button size="small">Tháng này</Button>
                </Space>
            </div>

            {/* Summary Card */}
            <Card style={{ marginTop: 16 }}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                    <div>
                        ✅ Đã chọn: <b>{selectedOrders.length}</b> đơn hàng
                        <br />
                        Tổng giá trị: <b style={{ color: '#52c41a' }}>{formatVND(selectedTotal)}</b>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        onClick={importSelectedOrders}
                        disabled={selectedOrders.length === 0}
                    >
                        📥 IMPORT {selectedOrders.length} ĐƠN HÀNG → INVENTORY
                    </Button>
                </Space>
            </Card>

            <WujiaDateFetcherModal
                visible={openDateFetch}
                onCancel={() => setOpenDateFetch(false)}
                onFetch={handleFetch}
            />
        </Modal>
    );
};
