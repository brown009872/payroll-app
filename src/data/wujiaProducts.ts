export type WujiaCategory = 'TRA' | 'NGUYEN_LIEU' | 'PHU_LIEU' | 'VAT_LIEU' | 'SAN_PHAM_DAT_RIENG' | 'THIET_BI';

export interface WujiaProduct {
    id: string;
    category: WujiaCategory;
    nameVi: string;
    nameCn: string;
    packaging: string;
    unit: string;
    unitPrice: number;
}

export const WUJIA_PRODUCTS: WujiaProduct[] = [
    // 1) TRA - 茶類
    { id: 'wujia-t-001', category: 'TRA', nameVi: 'Hồng Trà Đài Loan', nameCn: '台灣紅茶', packaging: '10kg/bao', unit: 'Bao', unitPrice: 125000 },
    { id: 'wujia-t-002', category: 'TRA', nameVi: 'Hồng Trà Đài Loan KHÔNG Đường', nameCn: '台灣無糖紅茶', packaging: '4kg/bao', unit: 'Bao', unitPrice: 45000 },
    { id: 'wujia-t-003', category: 'TRA', nameVi: 'Trà Bí Đao', nameCn: '冬瓜茶', packaging: '10kg/bao', unit: 'Bao', unitPrice: 132000 },
    { id: 'wujia-t-004', category: 'TRA', nameVi: 'Trà Xí Muội Ngô Gia', nameCn: '吳家酸梅湯', packaging: '10kg/bao', unit: 'Bao', unitPrice: 160000 },
    { id: 'wujia-t-005', category: 'TRA', nameVi: 'Hồng Trà Vải Thiều', nameCn: '荔枝紅茶', packaging: '10kg/bao', unit: 'Bao', unitPrice: 132000 },
    { id: 'wujia-t-006', category: 'TRA', nameVi: 'Trà Xanh Hoa Nhài', nameCn: '綠茶', packaging: '10kg/bao', unit: 'Bao', unitPrice: 132000 },
    { id: 'wujia-t-007', category: 'TRA', nameVi: 'Trà Xanh KHÔNG Đường', nameCn: '無糖綠', packaging: '4kg/bao', unit: 'Bao', unitPrice: 50000 },
    { id: 'wujia-t-008', category: 'TRA', nameVi: 'Trà Ô Long Bạch Đào có đường', nameCn: '白桃烏龍茶有糖', packaging: '10kg/bao', unit: 'Bao', unitPrice: 132000 },
    { id: 'wujia-t-009', category: 'TRA', nameVi: 'Trà Ô Long Bạch Đào không đường', nameCn: '白桃烏龍茶無糖', packaging: '4kg/bao', unit: 'Bao', unitPrice: 50000 },

    // 2) NGUYÊN LIỆU - 原料
    { id: 'wujia-n-001', category: 'NGUYEN_LIEU', nameVi: 'Pudding Trứng', nameCn: '鸡蛋布丁', packaging: '120 cái / thùng', unit: 'Hộp', unitPrice: 5000 },
    { id: 'wujia-n-002', category: 'NGUYEN_LIEU', nameVi: 'Sữa Tươi', nameCn: '鮮奶', packaging: '2L/bình', unit: 'Bình', unitPrice: 70000 },
    { id: 'wujia-n-003', category: 'NGUYEN_LIEU', nameVi: 'Thạch Aiyu', nameCn: '愛玉凍', packaging: '1kg/hộp', unit: 'Hộp', unitPrice: 37000 },
    { id: 'wujia-n-004', category: 'NGUYEN_LIEU', nameVi: 'Thạch Q Ngô Gia', nameCn: '吳家Q凍', packaging: '1kg/hộp', unit: 'Hộp', unitPrice: 50000 },
    { id: 'wujia-n-005', category: 'NGUYEN_LIEU', nameVi: 'Thạch Sương Sáo', nameCn: '仙草凍', packaging: '1kg/hộp', unit: 'Hộp', unitPrice: 28000 },
    { id: 'wujia-n-006', category: 'NGUYEN_LIEU', nameVi: 'Thạch Sương Sáo Viên', nameCn: '仙草凍球', packaging: '1kg/hộp', unit: 'Hộp', unitPrice: 38000 },
    { id: 'wujia-n-007', category: 'NGUYEN_LIEU', nameVi: 'Thạch Sữa Viên', nameCn: '奶凍球', packaging: '1kg/hộp', unit: 'Hộp', unitPrice: 47000 },
    { id: 'wujia-n-008', category: 'NGUYEN_LIEU', nameVi: 'Khoai Môn Nghiền', nameCn: '芋泥', packaging: '1kg / hộp', unit: 'Hộp', unitPrice: 60000 },
    { id: 'wujia-n-009', category: 'NGUYEN_LIEU', nameVi: 'Trân Châu Khoai Môn 500G', nameCn: '小芋圓', packaging: '30 bao / 1 thùng', unit: 'Bao', unitPrice: 32000 },
    { id: 'wujia-n-010', category: 'NGUYEN_LIEU', nameVi: 'Khoai Dẻo Tam Sắc', nameCn: '三色Q薯圆', packaging: '1kg/bao (20bao/thùng)', unit: 'Bao', unitPrice: 51000 },

    { id: 'wujia-n-011', category: 'NGUYEN_LIEU', nameVi: 'Trân Châu Củ Năng', nameCn: '马蹄粉圆', packaging: '1kg/bao (20bao/thùng)', unit: 'Bao', unitPrice: 85000 },
    { id: 'wujia-n-012', category: 'NGUYEN_LIEU', nameVi: 'Trân Châu Vị Dâu', nameCn: '草莓粉圆', packaging: '1kg/bao (20bao/thùng)', unit: 'Bao', unitPrice: 76000 },
    { id: 'wujia-n-013', category: 'NGUYEN_LIEU', nameVi: 'Bánh Vuông Đường Đen', nameCn: '黑糖小快蛋糕', packaging: '1kg/bao (20bao/thùng)', unit: 'Bao', unitPrice: 51000 },
    { id: 'wujia-n-014', category: 'NGUYEN_LIEU', nameVi: 'Kem Béo Thực Vật 1Kg', nameCn: '奶精', packaging: '12 hộp/thùng', unit: 'Hộp', unitPrice: 50000 },
    { id: 'wujia-n-015', category: 'NGUYEN_LIEU', nameVi: 'Kem Béo Vị Sữa (500g)', nameCn: '奶油 (500g)', packaging: '24hộp/thùng', unit: 'Hộp', unitPrice: 35000 },
    { id: 'wujia-n-016', category: 'NGUYEN_LIEU', nameVi: 'Kem Vani 3 Kg', nameCn: '3公斤香草冰淇淋', packaging: '3kg/hộp', unit: 'Hộp', unitPrice: 240000 },
    { id: 'wujia-n-017', category: 'NGUYEN_LIEU', nameVi: 'Hạt é 100g', nameCn: '100克奇亞籽', packaging: '100g/gói', unit: 'Gói', unitPrice: 16000 },
    { id: 'wujia-n-018', category: 'NGUYEN_LIEU', nameVi: 'Đào Ngâm Nước Đường', nameCn: '葡萄牙水蜜桃罐头', packaging: '12lon/thùng', unit: 'Hộp', unitPrice: 32000 },
    { id: 'wujia-n-019', category: 'NGUYEN_LIEU', nameVi: 'Mứt Nho', nameCn: '葡萄醬', packaging: '12lon/thùng', unit: 'Lon', unitPrice: 89000 },
    { id: 'wujia-n-020', category: 'NGUYEN_LIEU', nameVi: 'Sốt Phô Mai', nameCn: '起司醬', packaging: '1kg/chai', unit: 'Chai', unitPrice: 172000 },

    { id: 'wujia-n-021', category: 'NGUYEN_LIEU', nameVi: 'Sốt Socola (680g)', nameCn: '巧克力酱', packaging: '24chai/thùng', unit: 'Chai', unitPrice: 69000 },
    { id: 'wujia-n-022', category: 'NGUYEN_LIEU', nameVi: 'Thạch Đào 2.5 Kg', nameCn: '蜜桃椰果', packaging: '6hộp/thùng', unit: 'Hộp', unitPrice: 57000 },
    { id: 'wujia-n-023', category: 'NGUYEN_LIEU', nameVi: 'Thạch Dừa Nguyên Vị', nameCn: '原味椰果', packaging: '20bao/thùng', unit: 'Hộp', unitPrice: 22000 },
    { id: 'wujia-n-024', category: 'NGUYEN_LIEU', nameVi: 'Trân Châu Trắng 3Q 1 Kg', nameCn: '原味寒天', packaging: '20bao/thùng', unit: 'Bao', unitPrice: 35000 },
    { id: 'wujia-n-025', category: 'NGUYEN_LIEU', nameVi: 'Trân Châu Đường Đen', nameCn: '黑糖珍珠', packaging: '6bao/thùng', unit: 'Bao', unitPrice: 88000 },
    { id: 'wujia-n-026', category: 'NGUYEN_LIEU', nameVi: 'Trân châu Ngũ Sắc', nameCn: '五色珍珠', packaging: '1kg/bao', unit: 'Bao', unitPrice: 33000 },
    { id: 'wujia-n-027', category: 'NGUYEN_LIEU', nameVi: 'Bánh Đựng Kem', nameCn: '冰淇淋卷筒', packaging: '100 cái/thùng', unit: 'Thùng', unitPrice: 70000 },
    { id: 'wujia-n-028', category: 'NGUYEN_LIEU', nameVi: 'Muối hồng', nameCn: '玫瑰鹽', packaging: '200g/hộp', unit: 'Hộp', unitPrice: 20000 },
    { id: 'wujia-n-029', category: 'NGUYEN_LIEU', nameVi: 'Hạt sen (450g)', nameCn: '蓮子罐頭 (450g)', packaging: '450G/Lon', unit: 'Lon', unitPrice: 45000 },

    // 1) PHỤ LIỆU - 輔料 (Auxiliary Ingredients)
    { id: 'phu-lieu-001', category: 'PHU_LIEU', nameVi: 'Nước Cốt Chanh', nameCn: '檸檬汁', packaging: '20 bao / 1 thùng', unit: 'Bao', unitPrice: 55000 },
    { id: 'phu-lieu-002', category: 'PHU_LIEU', nameVi: 'Nước Cốt Ổi Đỏ', nameCn: '紅心芭樂汁', packaging: '20 bao / 1 thùng', unit: 'Bao', unitPrice: 36000 },
    { id: 'phu-lieu-003', category: 'PHU_LIEU', nameVi: 'Nước Đường', nameCn: '蔗糖', packaging: '4 bình/thùng', unit: 'Bình', unitPrice: 144000 },
    { id: 'phu-lieu-004', category: 'PHU_LIEU', nameVi: 'Siro Đường Đen', nameCn: '黑糖漿', packaging: '6 bình/thùng', unit: 'Bình', unitPrice: 120000 },
    { id: 'phu-lieu-005', category: 'PHU_LIEU', nameVi: 'Xí Muội', nameCn: '话梅', packaging: '50 bao / 1 thùng', unit: 'Bao', unitPrice: 84000 },

    // 2) VẬT LIỆU - 物料 (Materials/Packaging)
    { id: 'vat-lieu-001', category: 'VAT_LIEU', nameVi: 'Túi 1 Ly', nameCn: '一杯袋', packaging: '10kg/thùng', unit: 'kg', unitPrice: 60000 },
    { id: 'vat-lieu-002', category: 'VAT_LIEU', nameVi: 'Túi 2 Ly', nameCn: '二杯袋', packaging: '10kg/thùng', unit: 'kg', unitPrice: 60000 },
    { id: 'vat-lieu-003', category: 'VAT_LIEU', nameVi: 'Túi 4 Ly', nameCn: '四杯袋', packaging: '10kg/thùng', unit: 'kg', unitPrice: 60000 },
    { id: 'vat-lieu-004', category: 'VAT_LIEU', nameVi: 'Túi đựng đá viên', nameCn: '裝冰袋', packaging: '1.000cái/thùng', unit: 'Thùng', unitPrice: 900000 },
    { id: 'vat-lieu-005', category: 'VAT_LIEU', nameVi: 'Nón Wujia size L', nameCn: '', packaging: '', unit: 'Cái', unitPrice: 63000 },
    { id: 'vat-lieu-006', category: 'VAT_LIEU', nameVi: 'Ly Đựng Topping', nameCn: '装加料杯子', packaging: '1000 cái / thùng', unit: 'Thùng', unitPrice: 620000 },
    { id: 'vat-lieu-007', category: 'VAT_LIEU', nameVi: 'Ly Nhựa 960cc (Giáng Sinh)', nameCn: '塑膠杯 (圣诞节)', packaging: '', unit: 'Thùng', unitPrice: 980000 },
    { id: 'vat-lieu-008', category: 'VAT_LIEU', nameVi: 'Ly Nhựa 700cc (Giáng Sinh)', nameCn: '塑膠杯 (圣诞节)', packaging: '', unit: 'Thùng', unitPrice: 750000 },
    { id: 'vat-lieu-009', category: 'VAT_LIEU', nameVi: 'Ống Hút Lớn 3000', nameCn: '粗吸管', packaging: '3000 ống / 1 thùng', unit: 'Thùng', unitPrice: 600000 },
    { id: 'vat-lieu-010', category: 'VAT_LIEU', nameVi: 'Ống Hút Nhỏ 3000', nameCn: '細吸管', packaging: '3000 cái / thùng', unit: 'Thùng', unitPrice: 468000 },
    { id: 'vat-lieu-011', category: 'VAT_LIEU', nameVi: 'Thùng trà nhỏ (4kg)', nameCn: '小茶桶（四公斤）', packaging: 'Dùng cho loại trà Không Đường (4kg)', unit: 'Cái', unitPrice: 170000 },
    { id: 'vat-lieu-012', category: 'VAT_LIEU', nameVi: 'Nắp kem cheese', nameCn: '奶蓋蓋子', packaging: '1000 cái/thùng', unit: 'Thùng', unitPrice: 380000 },
    { id: 'vat-lieu-013', category: 'VAT_LIEU', nameVi: 'Nắp Ly Lớn', nameCn: '大杯蓋', packaging: '500 cái / 1 thùng', unit: 'Thùng', unitPrice: 540000 },
    { id: 'vat-lieu-014', category: 'VAT_LIEU', nameVi: 'Nắp Ly Nhỏ', nameCn: '小杯蓋', packaging: '1000 cái / 1 thùng', unit: 'Thùng', unitPrice: 380000 },
    { id: 'vat-lieu-015', category: 'VAT_LIEU', nameVi: 'Muỗng Nhựa', nameCn: '塑料勺子', packaging: '2000 cái / thùng', unit: 'Thùng', unitPrice: 600000 },
    { id: 'vat-lieu-016', category: 'VAT_LIEU', nameVi: 'Tem dán ly Ngô Gia', nameCn: '', packaging: '100 cuộn/thùng', unit: 'Thùng', unitPrice: 1900000 },
    { id: 'vat-lieu-017', category: 'VAT_LIEU', nameVi: 'Cuộn màng dập ly Trung Quốc', nameCn: '中國封口膜', packaging: '6 cuộn/ 1 thùng', unit: 'Cuộn', unitPrice: 300000 },
    { id: 'vat-lieu-018', category: 'VAT_LIEU', nameVi: 'Khung nam châm', nameCn: '', packaging: '', unit: 'Cái', unitPrice: 16000 },
    { id: 'vat-lieu-019', category: 'VAT_LIEU', nameVi: 'Giấy dầu lót chống tràn', nameCn: '防漏紙', packaging: '500miếng/gói', unit: 'Gói', unitPrice: 30000 },
    { id: 'vat-lieu-020', category: 'VAT_LIEU', nameVi: 'Giấy in hóa đơn 30m (dành cho máy Pos để bàn)', nameCn: '', packaging: '100 cuộn/thùng', unit: 'Thùng', unitPrice: 1300000 },
    { id: 'vat-lieu-021', category: 'VAT_LIEU', nameVi: 'Giấy in hóa đơn 13m (dành cho máy Pos cầm tay)', nameCn: '', packaging: '100 cuộn/thùng', unit: 'Thùng', unitPrice: 650000 },

    // 3) SẢN PHẨM ĐẶT RIÊNG - 定制產品 (Custom Orders)
    { id: 'san-pham-dat-rieng-001', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Túi giữ nhiệt 2', nameCn: '保溫袋', packaging: '', unit: 'Cái', unitPrice: 2000 },
    { id: 'san-pham-dat-rieng-002', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Túi giữ nhiệt 4', nameCn: '保溫袋', packaging: '', unit: 'Cái', unitPrice: 4500 },
    { id: 'san-pham-dat-rieng-003', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Tạp dề (size lớn)', nameCn: '圍裙（大）', packaging: '', unit: 'Cái', unitPrice: 120000 },
    { id: 'san-pham-dat-rieng-004', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Tạp dề (size nhỏ)', nameCn: '圍裙（小）', packaging: '', unit: 'Cái', unitPrice: 120000 },
    { id: 'san-pham-dat-rieng-005', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Áo Mưa Tiện Lợi Wujia', nameCn: '屋家便利雨衣', packaging: '', unit: 'Cái', unitPrice: 5000 },
    { id: 'san-pham-dat-rieng-006', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Áo Đồng Phục Nữ size S', nameCn: '制服T恤女版 S', packaging: '', unit: 'Cái', unitPrice: 120000 },
    { id: 'san-pham-dat-rieng-007', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Áo Đồng Phục Nam size 5XL', nameCn: '制服T恤男版 5XL', packaging: '', unit: 'Cái', unitPrice: 120000 },
    { id: 'san-pham-dat-rieng-008', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Áo Đồng Phục Nữ size M', nameCn: '制服T恤女版 M', packaging: '', unit: 'Cái', unitPrice: 120000 },
    { id: 'san-pham-dat-rieng-009', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Áo Đồng Phục Nữ size L', nameCn: '制服T恤女版 L', packaging: '', unit: 'Cái', unitPrice: 120000 },
    { id: 'san-pham-dat-rieng-010', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Áo Đồng Phục Nữ size XL', nameCn: '制服T恤女版 XL', packaging: '', unit: 'Cái', unitPrice: 120000 },
    { id: 'san-pham-dat-rieng-011', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Áo Đồng Phục Nam size M', nameCn: '制服T恤男版 M', packaging: '', unit: 'Cái', unitPrice: 120000 },
    { id: 'san-pham-dat-rieng-012', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Áo Đồng Phục Nam size L', nameCn: '制服T恤男版 L', packaging: '', unit: 'Cái', unitPrice: 120000 },
    { id: 'san-pham-dat-rieng-013', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Áo Đồng Phục Nam size XL', nameCn: '制服T恤男版 XL', packaging: '', unit: 'Cái', unitPrice: 120000 },
    { id: 'san-pham-dat-rieng-014', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Áo Đồng Phục Nam size 2XL', nameCn: '制服T恤男版 2XL', packaging: '', unit: 'Cái', unitPrice: 120000 },
    { id: 'san-pham-dat-rieng-015', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Áo Đồng Phục Nam size 3XL', nameCn: '制服T恤男版 3XL', packaging: '', unit: 'Cái', unitPrice: 120000 },
    { id: 'san-pham-dat-rieng-016', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Áo Đồng Phục Nam size 4XL', nameCn: '制服T恤男版 4XL', packaging: '', unit: 'Cái', unitPrice: 120000 },
    { id: 'san-pham-dat-rieng-017', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Ly Múc Trà', nameCn: '紅茶杯', packaging: '100 cái / thùng', unit: 'Cái', unitPrice: 24000 },
    { id: 'san-pham-dat-rieng-018', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Thùng trà lớn (10kg)', nameCn: '大茶桶（十公斤）', packaging: 'Dùng cho loại trà Có Đường (10kg)', unit: 'Cái', unitPrice: 270000 },
    { id: 'san-pham-dat-rieng-019', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Nắp Khay', nameCn: '加料盒蓋子', packaging: '', unit: 'Cái', unitPrice: 70000 },
    { id: 'san-pham-dat-rieng-020', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Muỗng Múc Kem', nameCn: '冰淇淋挖勺', packaging: '', unit: 'Cái', unitPrice: 150000 },
    { id: 'san-pham-dat-rieng-021', category: 'SAN_PHAM_DAT_RIENG', nameVi: 'Khay Đựng Topping', nameCn: '加料盒', packaging: '', unit: 'Cái', unitPrice: 118000 },

    // 4) THIẾT BỊ - 設備 (Equipment)
    { id: 'thiet-bi-001', category: 'THIET_BI', nameVi: 'Nắp Đậy Thùng Trà', nameCn: '茶桶蓋子', packaging: '', unit: 'Cái', unitPrice: 85000 },
    { id: 'thiet-bi-002', category: 'THIET_BI', nameVi: 'Máy Ép Miệng Ly', nameCn: '封口機', packaging: '', unit: 'Cái', unitPrice: 16000000 }
];
