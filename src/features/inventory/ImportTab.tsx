import React, { useState } from 'react';
import { Table, Card, Statistic, Button, Modal, Form, Select, InputNumber, DatePicker } from 'antd';
import { ArrowUpOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { Bar } from 'react-chartjs-2';
import dayjs from 'dayjs';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import type { StockRecord } from '../../types/inventory';
import { WUJIA_PRODUCTS } from '../../data/wujiaProducts'; // Update import
import { generateImportVoucher } from '../../utils/pdfGenerator';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface ImportTabProps {
    records: StockRecord[];
    onAddRecord: (record: Omit<StockRecord, 'id'>) => void;
}

export const ImportTab: React.FC<ImportTabProps> = ({ records, onAddRecord }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const handleOk = () => {
        form.validateFields().then(values => {
            const selectedProduct = WUJIA_PRODUCTS.find(p => p.id === values.wujiaId); // Update usage
            const productName = selectedProduct ? selectedProduct.nameVi : 'Unknown'; // Update field name

            const newRecord: Omit<StockRecord, 'id'> = {
                date: values.date.format('YYYY-MM-DD'),
                product: productName,
                start_qty: values.startQty || 0,
                ordered: values.ordered || 0,
                consumed: 0,
                end_qty: (values.startQty || 0) + (values.ordered || 0),
                ceiling_weekday: 10,
                ceiling_weekend: 15,
                efficiency: 100
            };
            onAddRecord(newRecord);
            setIsModalOpen(false);
            form.resetFields();
        });
    };

    // Sort records by date for chart
    const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date));

    const chartData = {
        labels: sortedRecords.map(r => r.date),
        datasets: [
            {
                label: 'Ordered',
                data: sortedRecords.map(r => r.ordered),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
            {
                label: 'Consumed',
                data: sortedRecords.map(r => r.consumed),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Product',
            dataIndex: 'product',
            key: 'product',
        },
        {
            title: 'Ordered',
            dataIndex: 'ordered',
            key: 'ordered',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: StockRecord) => (
                <Button
                    icon={<DownloadOutlined />}
                    size="small"
                    onClick={() => generateImportVoucher(record)}
                >
                    Voucher
                </Button>
            ),
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                    Add Import Record
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <Statistic
                        title="Total Ordered"
                        value={records.reduce((acc, r) => acc + r.ordered, 0)}
                        prefix={<ArrowUpOutlined />}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </Card>
                <Card>
                    <Statistic
                        title="Avg Efficiency"
                        value={60}
                        precision={2}
                        suffix="%"
                    />
                </Card>
            </div>

            <Card title="Import vs Consumption Flow">
                <Bar options={{ responsive: true }} data={chartData} />
            </Card>

            <Card title="Import Records">
                <Table
                    dataSource={records}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                />
            </Card>

            <Modal title="Add Import Record" open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)}>
                <Form form={form} layout="vertical" initialValues={{ date: dayjs() }}>
                    <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                        <DatePicker />
                    </Form.Item>
                    <Form.Item name="wujiaId" label="Select Wujia Product" rules={[{ required: true }]}>
                        <Select
                            showSearch
                            placeholder="Select a product"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={WUJIA_PRODUCTS.map(p => ({
                                value: p.id,
                                label: `${p.nameVi} (${p.unitPrice?.toLocaleString('vi-VN')} ₫)`
                            }))}
                        />
                    </Form.Item>
                    <Form.Item name="startQty" label="Start Quantity">
                        <InputNumber min={0} className="w-full" />
                    </Form.Item>
                    <Form.Item name="ordered" label="Ordered Quantity">
                        <InputNumber min={0} className="w-full" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
