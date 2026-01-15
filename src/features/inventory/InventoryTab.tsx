import React from 'react';
import { Tabs } from 'antd';
import { ImportTab } from './ImportTab';
import { ExportTab } from './ExportTab';
import { useInventory } from '../../hooks/useInventory';

export const InventoryTab: React.FC = () => {
    const { records, addRecord } = useInventory();

    const items = [
        {
            key: '1',
            label: 'Import Management',
            children: <ImportTab records={records} onAddRecord={addRecord} />,
        },
        {
            key: '2',
            label: 'Export & Consumption',
            children: <ExportTab records={records} />,
        },
    ];

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>
            <Tabs defaultActiveKey="1" items={items} />
        </div>
    );
};
