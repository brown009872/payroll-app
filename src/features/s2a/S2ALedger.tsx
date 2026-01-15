import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Trash2, Calendar, ChevronLeft, ChevronRight, FileSpreadsheet, X, Settings, Save } from 'lucide-react';
import { exportS2AExcel, getExportPreview } from './exportExcel';

// ============================================
// TYPES
// ============================================

export interface BusinessSettings {
  businessName: string;      // HỘ, CÁ NHÂN KINH DOANH
  address: string;           // Địa chỉ
  taxNumber: string;         // Mã số thuế
  businessLocation: string;  // Địa điểm kinh doanh
  representativeName: string; // Người đại diện
}

export interface DailyRevenue {
  id: string;
  date: string; // YYYY-MM-DD
  offline: number;      // Doanh thu trong ngày tại cửa hàng
  grab: number;         // Grab
  shopeeFood: number;   // ShopeeFood
  be: number;           // Be
  xanhSm: number;       // XanhSM
  createdAt: string;
  updatedAt: string;
}

// Tax rates based on template
const TAX_RATES = {
  GTGT: 0.03,   // 3%
  TNCN: 0.015,  // 1.5%
};

// LocalStorage keys
const STORAGE_KEY = 's2a_daily_revenue';
const SETTINGS_KEY = 's2a_business_settings';

// Default business settings
const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: '',
  address: '',
  taxNumber: '',
  businessLocation: '',
  representativeName: '',
};

// Helper to format date for display
const formatDisplayDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Get today's date string
const getTodayStr = () => new Date().toISOString().split('T')[0];

// Format VND
const formatVND = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

// Format number input
const formatNumberInput = (value: string): string => {
  const num = value.replace(/[^\d]/g, '');
  if (!num) return '';
  return parseInt(num).toLocaleString('vi-VN');
};

// Parse formatted number
const parseFormattedNumber = (value: string): number => {
  return parseInt(value.replace(/[^\d]/g, '') || '0');
};

export const S2ALedger: React.FC = () => {
  // State
  const [revenues, setRevenues] = useState<DailyRevenue[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingSettings, setEditingSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);

  // Input date for new/edit entry
  const [inputDate, setInputDate] = useState(getTodayStr());

  // Revenue inputs
  const [offlineInput, setOfflineInput] = useState('');
  const [grabInput, setGrabInput] = useState('');
  const [shopeeFoodInput, setShopeeFoodInput] = useState('');
  const [beInput, setBeInput] = useState('');
  const [xanhSmInput, setXanhSmInput] = useState('');

  // Report view state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Excel export modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [exportLoading, setExportLoading] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null);

  // ============================================
  // LOAD/SAVE DATA
  // ============================================

  useEffect(() => {
    const savedRevenues = localStorage.getItem(STORAGE_KEY);
    if (savedRevenues) {
      try {
        setRevenues(JSON.parse(savedRevenues));
      } catch (e) {
        console.error('Failed to load S2A revenues:', e);
      }
    }

    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setEditingSettings(parsed);
      } catch (e) {
        console.error('Failed to load S2A settings:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(revenues));
  }, [revenues]);

  // ============================================
  // HANDLERS
  // ============================================

  // Save business settings
  const handleSaveSettings = () => {
    setSettings(editingSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(editingSettings));
    setShowSettingsModal(false);
  };

  // Load existing entry for selected date
  useEffect(() => {
    const existing = revenues.find(r => r.date === inputDate);
    if (existing) {
      setOfflineInput(existing.offline ? existing.offline.toLocaleString('vi-VN') : '');
      setGrabInput(existing.grab ? existing.grab.toLocaleString('vi-VN') : '');
      setShopeeFoodInput(existing.shopeeFood ? existing.shopeeFood.toLocaleString('vi-VN') : '');
      setBeInput(existing.be ? existing.be.toLocaleString('vi-VN') : '');
      setXanhSmInput(existing.xanhSm ? existing.xanhSm.toLocaleString('vi-VN') : '');
    } else {
      setOfflineInput('');
      setGrabInput('');
      setShopeeFoodInput('');
      setBeInput('');
      setXanhSmInput('');
    }
  }, [inputDate, revenues]);

  // Save daily revenue
  const handleSaveRevenue = () => {
    const offline = parseFormattedNumber(offlineInput);
    const grab = parseFormattedNumber(grabInput);
    const shopeeFood = parseFormattedNumber(shopeeFoodInput);
    const be = parseFormattedNumber(beInput);
    const xanhSm = parseFormattedNumber(xanhSmInput);

    if (offline === 0 && grab === 0 && shopeeFood === 0 && be === 0 && xanhSm === 0) {
      alert('Vui lòng nhập ít nhất một loại doanh thu!');
      return;
    }

    const existingIndex = revenues.findIndex(r => r.date === inputDate);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      // Update existing
      const updated = [...revenues];
      updated[existingIndex] = {
        ...updated[existingIndex],
        offline,
        grab,
        shopeeFood,
        be,
        xanhSm,
        updatedAt: now,
      };
      setRevenues(updated);
    } else {
      // Create new
      const newRevenue: DailyRevenue = {
        id: crypto.randomUUID(),
        date: inputDate,
        offline,
        grab,
        shopeeFood,
        be,
        xanhSm,
        createdAt: now,
        updatedAt: now,
      };
      setRevenues(prev => [newRevenue, ...prev]);
    }
  };

  // Delete entry
  const handleDelete = (id: string) => {
    if (window.confirm('Xóa doanh thu ngày này?')) {
      setRevenues(prev => prev.filter(r => r.id !== id));
    }
  };

  // Navigate month
  const navigateMonth = (delta: number) => {
    let newMonth = selectedMonth + delta;
    let newYear = selectedYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  // ============================================
  // CALCULATIONS
  // ============================================

  // Filter revenues by selected month
  const filteredRevenues = useMemo(() => {
    return revenues
      .filter(r => {
        const d = new Date(r.date);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [revenues, selectedMonth, selectedYear]);

  // Summary calculations
  const summary = useMemo(() => {
    let totalOffline = 0;
    let totalGrab = 0;
    let totalShopeeFood = 0;
    let totalBe = 0;
    let totalXanhSm = 0;

    filteredRevenues.forEach(r => {
      totalOffline += r.offline;
      totalGrab += r.grab;
      totalShopeeFood += r.shopeeFood;
      totalBe += r.be;
      totalXanhSm += r.xanhSm;
    });

    const totalOnline = totalGrab + totalShopeeFood + totalBe + totalXanhSm;
    const grandTotal = totalOffline + totalOnline;

    // Tax calculations
    const offlineGTGT = Math.round(totalOffline * TAX_RATES.GTGT);
    const offlineTNCN = Math.round(totalOffline * TAX_RATES.TNCN);
    const onlineGTGT = Math.round(totalOnline * TAX_RATES.GTGT);
    const onlineTNCN = Math.round(totalOnline * TAX_RATES.TNCN);
    const totalGTGT = offlineGTGT + onlineGTGT;
    const totalTNCN = offlineTNCN + onlineTNCN;

    return {
      totalOffline,
      totalGrab,
      totalShopeeFood,
      totalBe,
      totalXanhSm,
      totalOnline,
      grandTotal,
      offlineGTGT,
      offlineTNCN,
      onlineGTGT,
      onlineTNCN,
      totalGTGT,
      totalTNCN,
    };
  }, [filteredRevenues]);

  // Export preview
  const exportPreview = useMemo(() => {
    return getExportPreview(revenues, exportMonth, exportYear);
  }, [revenues, exportMonth, exportYear]);

  // Handle Excel export
  const handleExportExcel = () => {
    if (!settings.businessName) {
      alert('Vui lòng cập nhật thông tin doanh nghiệp trước khi xuất Excel!');
      setShowExportModal(false);
      setShowSettingsModal(true);
      return;
    }

    setExportLoading(true);
    setExportResult(null);

    setTimeout(() => {
      const result = exportS2AExcel({
        revenues,
        month: exportMonth,
        year: exportYear,
        settings,
      });

      setExportLoading(false);

      if (result.success) {
        setExportResult({
          success: true,
          message: `✓ Đã xuất ${result.dayCount} ngày - ${result.filename}`
        });
      } else {
        setExportResult({
          success: false,
          message: result.error || 'Lỗi xuất file'
        });
      }
    }, 300);
  };

  // Check if entry exists for input date
  const existingEntry = revenues.find(r => r.date === inputDate);

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sổ S2A - Doanh Thu Hàng Ngày</h1>
          <p className="text-sm text-gray-500">
            {settings.businessName || 'Chưa cập nhật thông tin doanh nghiệp'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { setEditingSettings({ ...settings }); setShowSettingsModal(true); }}>
            <Settings className="w-4 h-4 mr-2" /> Cài đặt
          </Button>
          <Button variant="primary" onClick={() => { setShowExportModal(true); setExportResult(null); }}>
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Xuất Excel
          </Button>
        </div>
      </div>

      {/* Business Info Banner (if not set) */}
      {!settings.businessName && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-yellow-800">Chưa cập nhật thông tin doanh nghiệp</p>
              <p className="text-sm text-yellow-600">Vui lòng cập nhật để xuất Excel đúng định dạng</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowSettingsModal(true)}>
              Cập nhật ngay
            </Button>
          </div>
        </Card>
      )}

      {/* Daily Entry Form */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Nhập Doanh Thu Ngày</h2>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
            {existingEntry && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Đã có dữ liệu</span>
            )}
          </div>
        </div>

        {/* Offline Revenue Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs flex items-center justify-center mr-2">1</span>
            Doanh thu tại cửa hàng (Offline)
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Doanh thu trong ngày (VNĐ)</label>
              <Input
                type="text"
                value={offlineInput}
                onChange={(e) => setOfflineInput(formatNumberInput(e.target.value))}
                placeholder="0"
                className="text-right text-lg font-semibold"
              />
            </div>
          </div>
          {parseFormattedNumber(offlineInput) > 0 && (
            <div className="mt-2 text-sm text-gray-500 flex gap-4">
              <span>Thuế GTGT (3%): <span className="font-medium text-orange-600">{formatVND(Math.round(parseFormattedNumber(offlineInput) * TAX_RATES.GTGT))}</span></span>
              <span>Thuế TNCN (1.5%): <span className="font-medium text-red-600">{formatVND(Math.round(parseFormattedNumber(offlineInput) * TAX_RATES.TNCN))}</span></span>
            </div>
          )}
        </div>

        {/* Online Revenue Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center mr-2">2</span>
            Doanh thu sàn TMĐT (Online)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Grab</label>
              <Input
                type="text"
                value={grabInput}
                onChange={(e) => setGrabInput(formatNumberInput(e.target.value))}
                placeholder="0"
                className="text-right"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">ShopeeFood</label>
              <Input
                type="text"
                value={shopeeFoodInput}
                onChange={(e) => setShopeeFoodInput(formatNumberInput(e.target.value))}
                placeholder="0"
                className="text-right"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Be</label>
              <Input
                type="text"
                value={beInput}
                onChange={(e) => setBeInput(formatNumberInput(e.target.value))}
                placeholder="0"
                className="text-right"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">XanhSM</label>
              <Input
                type="text"
                value={xanhSmInput}
                onChange={(e) => setXanhSmInput(formatNumberInput(e.target.value))}
                placeholder="0"
                className="text-right"
              />
            </div>
          </div>
          {(parseFormattedNumber(grabInput) + parseFormattedNumber(shopeeFoodInput) + parseFormattedNumber(beInput) + parseFormattedNumber(xanhSmInput)) > 0 && (
            <div className="mt-2 text-sm text-gray-500 flex gap-4">
              <span>Tổng Online: <span className="font-semibold text-blue-600">{formatVND(parseFormattedNumber(grabInput) + parseFormattedNumber(shopeeFoodInput) + parseFormattedNumber(beInput) + parseFormattedNumber(xanhSmInput))}</span></span>
              <span>Thuế GTGT (3%): <span className="font-medium text-orange-600">{formatVND(Math.round((parseFormattedNumber(grabInput) + parseFormattedNumber(shopeeFoodInput) + parseFormattedNumber(beInput) + parseFormattedNumber(xanhSmInput)) * TAX_RATES.GTGT))}</span></span>
              <span>Thuế TNCN (1.5%): <span className="font-medium text-red-600">{formatVND(Math.round((parseFormattedNumber(grabInput) + parseFormattedNumber(shopeeFoodInput) + parseFormattedNumber(beInput) + parseFormattedNumber(xanhSmInput)) * TAX_RATES.TNCN))}</span></span>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSaveRevenue}>
            <Save className="w-4 h-4 mr-2" /> {existingEntry ? 'Cập nhật' : 'Lưu'}
          </Button>
        </div>
      </Card>

      {/* Month Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center">
            <span className="text-lg font-semibold text-gray-700">
              Tháng {selectedMonth}/{selectedYear}
            </span>
            <span className="text-sm text-gray-500 ml-2">({filteredRevenues.length} ngày)</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Offline Summary */}
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-sm text-green-600 font-medium">1. Tại cửa hàng (Offline)</div>
          <div className="text-2xl font-bold text-green-800 mt-1">{formatVND(summary.totalOffline)}</div>
          <div className="text-xs text-green-600 mt-2 space-y-1">
            <div>GTGT (3%): {formatVND(summary.offlineGTGT)}</div>
            <div>TNCN (1.5%): {formatVND(summary.offlineTNCN)}</div>
          </div>
        </Card>

        {/* Online Summary */}
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-sm text-blue-600 font-medium">2. Sàn TMĐT (Online)</div>
          <div className="text-2xl font-bold text-blue-800 mt-1">{formatVND(summary.totalOnline)}</div>
          <div className="text-xs text-blue-600 mt-2 grid grid-cols-2 gap-1">
            <div>Grab: {formatVND(summary.totalGrab)}</div>
            <div>ShopeeFood: {formatVND(summary.totalShopeeFood)}</div>
            <div>Be: {formatVND(summary.totalBe)}</div>
            <div>XanhSM: {formatVND(summary.totalXanhSm)}</div>
          </div>
          <div className="text-xs text-blue-600 mt-2 border-t border-blue-200 pt-2 space-y-1">
            <div>GTGT (3%): {formatVND(summary.onlineGTGT)}</div>
            <div>TNCN (1.5%): {formatVND(summary.onlineTNCN)}</div>
          </div>
        </Card>

        {/* Total Tax */}
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="text-sm text-orange-600 font-medium">Tổng Thuế Phải Nộp</div>
          <div className="text-2xl font-bold text-orange-800 mt-1">{formatVND(summary.totalGTGT + summary.totalTNCN)}</div>
          <div className="text-xs text-orange-600 mt-2 space-y-1">
            <div>Tổng GTGT: {formatVND(summary.totalGTGT)}</div>
            <div>Tổng TNCN: {formatVND(summary.totalTNCN)}</div>
          </div>
          <div className="text-lg font-bold text-gray-700 mt-3 pt-2 border-t border-orange-200">
            Tổng DT: {formatVND(summary.grandTotal)}
          </div>
        </Card>
      </div>

      {/* Daily Revenue Table */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Chi tiết theo ngày</h3>
        {filteredRevenues.length === 0 ? (
          <div className="text-center text-gray-400 py-8">Không có dữ liệu tháng này</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Ngày</th>
                  <th className="text-right p-2">Offline</th>
                  <th className="text-right p-2">Grab</th>
                  <th className="text-right p-2">ShopeeFood</th>
                  <th className="text-right p-2">Be</th>
                  <th className="text-right p-2">XanhSM</th>
                  <th className="text-right p-2 font-semibold">Tổng</th>
                  <th className="text-center p-2">Xóa</th>
                </tr>
              </thead>
              <tbody>
                {filteredRevenues.map(r => {
                  const total = r.offline + r.grab + r.shopeeFood + r.be + r.xanhSm;
                  return (
                    <tr key={r.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setInputDate(r.date)}>
                      <td className="p-2">{formatDisplayDate(r.date)}</td>
                      <td className="p-2 text-right text-green-700">{r.offline ? formatVND(r.offline) : '-'}</td>
                      <td className="p-2 text-right text-blue-600">{r.grab ? formatVND(r.grab) : '-'}</td>
                      <td className="p-2 text-right text-orange-600">{r.shopeeFood ? formatVND(r.shopeeFood) : '-'}</td>
                      <td className="p-2 text-right text-purple-600">{r.be ? formatVND(r.be) : '-'}</td>
                      <td className="p-2 text-right text-teal-600">{r.xanhSm ? formatVND(r.xanhSm) : '-'}</td>
                      <td className="p-2 text-right font-semibold">{formatVND(total)}</td>
                      <td className="p-2 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-100 font-semibold">
                <tr>
                  <td className="p-2">Tổng cộng</td>
                  <td className="p-2 text-right text-green-700">{formatVND(summary.totalOffline)}</td>
                  <td className="p-2 text-right text-blue-600">{formatVND(summary.totalGrab)}</td>
                  <td className="p-2 text-right text-orange-600">{formatVND(summary.totalShopeeFood)}</td>
                  <td className="p-2 text-right text-purple-600">{formatVND(summary.totalBe)}</td>
                  <td className="p-2 text-right text-teal-600">{formatVND(summary.totalXanhSm)}</td>
                  <td className="p-2 text-right">{formatVND(summary.grandTotal)}</td>
                  <td className="p-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* Business Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Thông Tin Doanh Nghiệp</h2>
              <button onClick={() => setShowSettingsModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hộ, cá nhân kinh doanh <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={editingSettings.businessName}
                  onChange={(e) => setEditingSettings(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder="Tên hộ kinh doanh / cá nhân"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <Input
                  type="text"
                  value={editingSettings.address}
                  onChange={(e) => setEditingSettings(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Địa chỉ đăng ký kinh doanh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                <Input
                  type="text"
                  value={editingSettings.taxNumber}
                  onChange={(e) => setEditingSettings(prev => ({ ...prev, taxNumber: e.target.value }))}
                  placeholder="Mã số thuế"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm kinh doanh</label>
                <Input
                  type="text"
                  value={editingSettings.businessLocation}
                  onChange={(e) => setEditingSettings(prev => ({ ...prev, businessLocation: e.target.value }))}
                  placeholder="Địa điểm kinh doanh thực tế"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Người đại diện</label>
                <Input
                  type="text"
                  value={editingSettings.representativeName}
                  onChange={(e) => setEditingSettings(prev => ({ ...prev, representativeName: e.target.value }))}
                  placeholder="Họ tên người đại diện"
                />
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t bg-gray-50 rounded-b-xl">
              <Button variant="secondary" className="flex-1" onClick={() => setShowSettingsModal(false)}>
                Hủy
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleSaveSettings}>
                <Save className="w-4 h-4 mr-2" /> Lưu
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Xuất Excel S2A</h2>
              <button onClick={() => setShowExportModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tháng</label>
                  <select
                    value={exportMonth}
                    onChange={(e) => setExportMonth(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Năm</label>
                  <select
                    value={exportYear}
                    onChange={(e) => setExportYear(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const y = new Date().getFullYear() - 2 + i;
                      return <option key={y} value={y}>{y}</option>;
                    })}
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div className={`p-4 rounded-lg ${exportPreview.dayCount > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="text-sm font-medium text-gray-600 mb-2">Xem trước</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Số ngày</div>
                    <div className="font-bold text-lg">{exportPreview.dayCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Tổng DT</div>
                    <div className="font-bold text-blue-600">{formatVND(exportPreview.totalRevenue)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Thuế GTGT (3%)</div>
                    <div className="font-semibold text-orange-600">{formatVND(exportPreview.totalGTGT)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Thuế TNCN (1.5%)</div>
                    <div className="font-semibold text-red-600">{formatVND(exportPreview.totalTNCN)}</div>
                  </div>
                </div>
              </div>

              {exportResult && (
                <div className={`p-3 rounded-lg ${exportResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {exportResult.message}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-4 border-t bg-gray-50 rounded-b-xl">
              <Button variant="secondary" className="flex-1" onClick={() => setShowExportModal(false)}>
                Đóng
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleExportExcel}
                disabled={exportLoading || exportPreview.dayCount === 0}
              >
                {exportLoading ? 'Đang xuất...' : (
                  <>
                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Xuất Excel
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
