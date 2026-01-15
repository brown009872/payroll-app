import React, { useState } from 'react';
import { Modal, Form, Input, Checkbox, Button } from 'antd';
import { useWujiaLiveSync } from '../../hooks/useWujiaLiveSync';

interface Props {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

export const WujiaLoginModal: React.FC<Props> = ({ visible, onCancel, onSuccess }) => {
    const { login, loading } = useWujiaLiveSync();
    const [form] = Form.useForm();
    const [saveCredentials, setSaveCredentials] = useState(true);

    const handleLogin = async () => {
        try {
            const values = await form.validateFields();
            const success = await login(values.username, values.password, saveCredentials);
            if (success) {
                onSuccess();
                onCancel();
            }
        } catch (e) {
            // Form validation error
        }
    };

    return (
        <Modal
            title="🔐 Đăng nhập Wujia Portal"
            open={visible}
            onCancel={onCancel}
            footer={null}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Username/Email"
                    name="username"
                    rules={[{ required: true, message: 'Please input username!' }]}
                >
                    <Input placeholder="shop.wujiatea.com.vn username" />
                </Form.Item>
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input password!' }]}
                >
                    <Input.Password placeholder="Password" />
                </Form.Item>
                <Form.Item>
                    <Checkbox checked={saveCredentials} onChange={e => setSaveCredentials(e.target.checked)}>
                        Lưu thông tin đăng nhập
                    </Checkbox>
                </Form.Item>

                <Button type="primary" onClick={handleLogin} loading={loading} block size="large">
                    ✅ Test & Save Login → Fetch Orders
                </Button>
            </Form>
        </Modal>
    );
};
