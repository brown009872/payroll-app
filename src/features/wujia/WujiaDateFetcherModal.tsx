import React, { useState } from 'react';
import { Modal, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';
// Removed unused hook import

interface Props {
    visible: boolean;
    onCancel: () => void;
    onFetch: (date: string) => void;
}

export const WujiaDateFetcherModal: React.FC<Props> = ({ visible, onCancel, onFetch }) => {
    const [date, setDate] = useState(dayjs());

    return (
        <Modal
            title="📅 Fetch Orders by Date"
            open={visible}
            onCancel={onCancel}
            footer={null}
        >
            <div className="flex flex-col gap-4">
                <DatePicker
                    format="YYYY-MM-DD"
                    placeholder="Chọn ngày đặt hàng"
                    value={date}
                    onChange={(d) => setDate(d || dayjs())}
                    style={{ width: '100%' }}
                    size="large"
                />
                <Button
                    type="primary"
                    size="large"
                    onClick={() => {
                        onFetch(date.format('YYYY-MM-DD'));
                        onCancel();
                    }}
                    block
                >
                    🚀 Fetch ALL Orders → Import Inventory
                </Button>
            </div>
        </Modal>
    );
};
