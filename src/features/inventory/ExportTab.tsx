import React from 'react';
import { Table, Card, Button } from 'antd';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import type { StockRecord } from '../../types/inventory';
import { DownloadOutlined } from '@ant-design/icons';
import { generateInventoryReport } from '../../utils/pdfGenerator';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface ExportTabProps {
    records: StockRecord[];
}

export const ExportTab: React.FC<ExportTabProps> = ({ records }) => {

    const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date));

    // Chart: Consumption Trend vs Forecast (Ceiling)
    const chartData = {
        labels: sortedRecords.map(r => r.date),
        datasets: [
            {
                label: 'Actual Consumption',
                data: sortedRecords.map(r => r.consumed),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Forecast (Ceiling)',
                data: sortedRecords.map(r => r.ceiling_weekday), // Simplified: using weekday ceiling as forecast line
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                borderDash: [5, 5],
            },
        ],
    };

    const columns = [
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Product', dataIndex: 'product', key: 'product' },
        { title: 'Consumed', dataIndex: 'consumed', key: 'consumed' },
        { title: 'Efficiency %', dataIndex: 'efficiency', key: 'efficiency', render: (val: number) => `${val}%` },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => generateInventoryReport(records)}
                >
                    Export Report (TT 88/2021)
                </Button>
            </div>

            <Card title="Consumption Trends">
                <Line options={{ responsive: true }} data={chartData} />
            </Card>

            <Card title="Consumption Data">
                <Table
                    dataSource={records}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                />
            </Card>
        </div>
    );
};
