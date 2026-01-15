import React, { useState } from 'react';
import { Modal, DatePicker, Button, Steps, List, Typography, Alert } from 'antd';
import { SyncOutlined, CloudDownloadOutlined, CheckCircleOutlined, ShoppingCartOutlined, LoginOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useWujiaSync } from '../hooks/useWujiaSync';

const { Text, Title } = Typography;

interface WujiaOrderFetcherModalProps {
    visible: boolean;
    onClose: () => void;
}

const formatVnd = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

export const WujiaOrderFetcherModal: React.FC<WujiaOrderFetcherModalProps> = ({ visible, onClose }) => {
    const [date, setDate] = useState<dayjs.Dayjs>(dayjs());
    const { isFetching, fetchedOrders, fetchOrders, importOrdersToCart, fetchDate } = useWujiaSync();

    // UI State
    const [currentStep, setCurrentStep] = useState(0);

    const handleFetch = async () => {
        setCurrentStep(1);
        await fetchOrders(date.format('YYYY-MM-DD'));
        setCurrentStep(2);
    };

    const handleImport = () => {
        importOrdersToCart();
        onClose();
        setCurrentStep(0);
    };

    const totalAmount = fetchedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const stepItems = [
        { title: "Select Date", icon: <LoginOutlined /> },
        { title: "Fetching", icon: isFetching ? <SyncOutlined spin /> : <CloudDownloadOutlined /> },
        { title: "Review & Import", icon: <CheckCircleOutlined /> }
    ];

    return (
        <Modal
            title="Fetch Wujia Live Orders"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={700}
        >
            <div className="mb-6">
                <Steps current={currentStep} size="small" items={stepItems} />
            </div>

            {currentStep === 0 && (
                <div className="text-center py-8">
                    <p className="mb-4 text-gray-600">
                        Connect to <b>shop.wujiatea.com.vn</b> to retrieve your purchase history.
                    </p>
                    <div className="flex justify-center gap-4 items-center mb-6">
                        <span className="font-semibold">Order Date:</span>
                        <DatePicker
                            value={date}
                            onChange={(d) => setDate(d || dayjs())}
                            allowClear={false}
                            size="large"
                        />
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        icon={<CloudDownloadOutlined />}
                        onClick={handleFetch}
                        loading={isFetching}
                    >
                        Start Fetching
                    </Button>

                    <div className="mt-4 text-xs text-gray-400">
                        * Requires active internet connection.
                    </div>
                </div>
            )}

            {currentStep === 1 && (
                <div className="text-center py-12">
                    <SyncOutlined spin style={{ fontSize: 36, color: '#1890ff', marginBottom: 16 }} />
                    <Title level={4}>Fetching Orders...</Title>
                    <Text>Navigating to Wujia Portal...</Text>
                </div>
            )}

            {currentStep === 2 && (
                <div className="space-y-4">
                    {fetchedOrders.length > 0 ? (
                        <>
                            <Alert
                                message={`Found ${fetchedOrders.length} orders for ${fetchDate}`}
                                type="success"
                                showIcon
                            />

                            <div className="max-h-60 overflow-y-auto border rounded">
                                <List
                                    dataSource={fetchedOrders}
                                    renderItem={(order) => (
                                        <List.Item className="px-4">
                                            <List.Item.Meta
                                                title={<span className="font-mono">{order.orderId}</span>}
                                                description={`${order.products.length} items`}
                                            />
                                            <div className="font-bold text-blue-600">
                                                {formatVnd(order.totalAmount)}
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </div>

                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded">
                                <span className="text-lg font-bold">Total Value:</span>
                                <span className="text-xl font-bold text-green-600">{formatVnd(totalAmount)}</span>
                            </div>

                            <Button
                                type="primary"
                                block
                                size="large"
                                icon={<ShoppingCartOutlined />}
                                onClick={handleImport}
                            >
                                Import to Inventory Cart
                            </Button>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <Text type="secondary">No orders found for this date.</Text>
                            <div className="mt-4">
                                <Button onClick={() => setCurrentStep(0)}>Try Another Date</Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};
