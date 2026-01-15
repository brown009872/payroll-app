import React from 'react';
import { Table, Tag, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';

export interface WujiaPurchaseRecord {
    orderId: string;        // "123456"
    time: string;           // "20:30 29/12/2025"
    status: 'pending' | 'completed' | 'cancelled' | string;
    totalAmount: number;    // 2,450,000
    supplier: 'Wujia Tea';
    products?: Array<{     // Expanded on "Chi tiết"
        nameVi: string;
        quantity: number;
        unitPrice: number;
    }>;
}

interface Props {
    dataSource: WujiaPurchaseRecord[];
    loading?: boolean;
    onImport?: (record: WujiaPurchaseRecord) => void;
    onViewDetail?: (record: WujiaPurchaseRecord) => void;
}

const formatVND = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

export const WujiaLiveHistoryTable: React.FC<Props> = ({ dataSource, loading, onImport, onViewDetail }) => {
    const purchaseHistoryColumns: ColumnsType<WujiaPurchaseRecord> = [
        {
            title: 'Thời gian',
            dataIndex: 'time',
            width: 140,
            render: (time) => <div style={{ fontSize: 13 }}>{time}</div>
        },
        {
            title: 'Đơn hàng',
            key: 'orderId',
            width: 120,
            render: (_, record) => (
                <div style={{ fontSize: 13, color: '#1890ff', fontWeight: 500 }}>
                    #{record.orderId}
                </div>
            )
        },
        {
            title: 'Trạng thái',
            width: 100,
            render: (_, record) => {
                const info = record.status.toLowerCase() === 'completed'
                    ? { color: 'green', text: 'Hoàn thành' }
                    : { color: 'orange', text: 'Đang xử lý' };
                return (
                    <Tag color={info.color} style={{ fontSize: 12 }}>
                        {info.text}
                    </Tag>
                );
            }
        },
        {
            title: 'Tổng tiền',
            width: 140,
            align: 'right',
            render: (_, record) => (
                <div style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#52c41a',
                    textAlign: 'right'
                }}>
                    {formatVND(record.totalAmount)}
                </div>
            )
        },
        {
            title: '',
            width: 140,
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        type="link"
                        onClick={() => onViewDetail?.(record)}
                    >
                        Chi tiết
                    </Button>
                    <Button
                        size="small"
                        type="primary"
                        onClick={() => onImport?.(record)}
                    >
                        Import
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <Table
            columns={purchaseHistoryColumns}
            dataSource={dataSource}
            pagination={{ pageSize: 10 }}
            scroll={{ y: 400 }}
            rowKey="orderId"
            loading={loading}
            size="middle"
        />
    );
};
