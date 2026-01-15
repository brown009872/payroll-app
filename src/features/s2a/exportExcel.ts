/**
 * S2A Excel Export Module
 * Generates Excel file matching S2a-template.xlsx format
 * Per Thông tư số 152/2025/TT-BTC
 */

import * as XLSX from 'xlsx';
import type { BusinessSettings, DailyRevenue } from './S2ALedger';

// ============================================
// TYPES
// ============================================

export interface ExportOptions {
  revenues: DailyRevenue[];
  month: number;
  year: number;
  settings: BusinessSettings;
}

export interface ExportResult {
  success: boolean;
  error?: string;
  filename?: string;
  dayCount?: number;
  totalRevenue?: number;
  totalGTGT?: number;
  totalTNCN?: number;
}

// Tax rates per template
const TAX_RATES = {
  GTGT: 0.03,   // 3%
  TNCN: 0.015,  // 1.5%
};

// Platform code prefixes
const PLATFORM_CODES = {
  offline: 'AU',      // Ăn Uống - offline
  grab: 'GR',         // Grab
  shopeeFood: 'SF',   // ShopeeFood
  be: 'BE',           // Be
  xanhSm: 'XS',       // XanhSM
};

// ============================================
// MAIN EXPORT FUNCTION
// ============================================

export function exportS2AExcel(options: ExportOptions): ExportResult {
  const { revenues, month, year, settings } = options;

  try {
    // Filter revenues for selected month/year
    const filtered = revenues
      .filter(r => {
        const d = new Date(r.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    if (filtered.length === 0) {
      return {
        success: false,
        error: `Không có dữ liệu cho tháng ${month}/${year}`,
      };
    }

    // Calculate totals
    let totalOffline = 0;
    let totalGrab = 0;
    let totalShopeeFood = 0;
    let totalBe = 0;
    let totalXanhSm = 0;

    filtered.forEach(r => {
      totalOffline += r.offline || 0;
      totalGrab += r.grab || 0;
      totalShopeeFood += r.shopeeFood || 0;
      totalBe += r.be || 0;
      totalXanhSm += r.xanhSm || 0;
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

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Build sheet data following template structure
    const rows: (string | number | null)[][] = [];

    // Row 1: Business info header
    rows.push([
      `HỘ, CÁ NHÂN KINH DOANH: ${settings.businessName}\nĐịa chỉ: ${settings.address}\nMã số thuế: ${settings.taxNumber}`,
      '', '',
      'Mẫu số S2a-HKD\n(Kèm theo Thông tư số 152/2025/TT-BTC ngày 31 tháng 12 năm 2025 của Bộ trưởng Bộ Tài chính)'
    ]);

    // Row 2: Title (will be centered)
    rows.push(['SỔ DOANH THU BÁN HÀNG HÓA, DỊCH VỤ', '', '', '']);

    // Row 3: Business location (will be centered)
    rows.push([`Địa điểm kinh doanh: ${settings.businessLocation}`, '', '', '']);

    // Row 4: Reporting period (will be centered)
    rows.push([`Kỳ kê khai: Tháng ${month}/${year}`, '', '', '']);

    // Row 5: Currency unit
    rows.push(['Đơn vị tính:', 'VNĐ', '', '']);

    // Row 6: Header row 1
    rows.push(['Chứng từ', '', 'Diễn giải', 'Số tiền']);

    // Row 7: Header row 2
    rows.push(['Số hiệu', 'Ngày, tháng', '', '']);

    // Row 8: Column labels
    rows.push(['A', 'B', 'C', 1]);

    // ===== SECTION 1: OFFLINE REVENUE =====
    rows.push(['', '', '1. Ngành nghề Ăn Uống', '']);
    rows.push(['', '', 'Doanh thu trong ngày tại cửa hàng', '']);

    // Daily offline entries with Số hiệu and Ngày, tháng
    let offlineSeq = 0;
    filtered.forEach((r) => {
      if (r.offline > 0) {
        offlineSeq++;
        const dateStr = formatDateVN(r.date);
        const dayOfMonth = new Date(r.date).getDate();
        const code = generateCode(PLATFORM_CODES.offline, month, dayOfMonth, offlineSeq);
        rows.push([code, dateStr, `Doanh thu ngày ${dateStr}`, r.offline]);
      }
    });

    // Offline subtotal
    rows.push(['', '', 'Tổng cộng (1)', totalOffline]);
    rows.push(['', '', 'Thuế GTGT', offlineGTGT]);
    rows.push(['', '', 'Thuế TNCN', offlineTNCN]);

    // ===== SECTION 2: ONLINE REVENUE (TMĐT) =====
    rows.push(['', '', '2. Ngành nghề Ăn Uống', '']);
    rows.push(['', '', 'Doanh thu sàn TMĐT', '']);

    // Platform monthly totals with Số hiệu and period
    const monthStr = String(month).padStart(2, '0');
    const periodStr = `Tháng ${month}/${year}`;

    // Grab - monthly total
    if (totalGrab > 0) {
      const grabCode = `${PLATFORM_CODES.grab}${monthStr}001`;
      rows.push([grabCode, periodStr, 'Grab', totalGrab]);
    }

    // ShopeeFood - monthly total
    if (totalShopeeFood > 0) {
      const shopeeCode = `${PLATFORM_CODES.shopeeFood}${monthStr}001`;
      rows.push([shopeeCode, periodStr, 'ShopeeFood', totalShopeeFood]);
    }

    // Be - monthly total
    if (totalBe > 0) {
      const beCode = `${PLATFORM_CODES.be}${monthStr}001`;
      rows.push([beCode, periodStr, 'Be', totalBe]);
    }

    // XanhSM - monthly total
    if (totalXanhSm > 0) {
      const xanhCode = `${PLATFORM_CODES.xanhSm}${monthStr}001`;
      rows.push([xanhCode, periodStr, 'XanhSm', totalXanhSm]);
    }

    // Online subtotal
    rows.push(['', '', 'Tổng cộng (2)', totalOnline]);
    rows.push(['', '', 'Thuế GTGT', onlineGTGT]);
    rows.push(['', '', 'Thuế TNCN', onlineTNCN]);

    // ===== TOTALS =====
    rows.push(['', '', '', '']);
    rows.push(['', '', 'Tổng số thuế GTGT phải nộp', totalGTGT]);
    rows.push(['', '', 'Tổng số thuế TNCN phải nộp', totalTNCN]);

    // Signature section
    const signatureDate = `Ngày ... tháng ${month} năm ${year}`;
    rows.push(['', '', '', `${signatureDate}\n NGƯỜI ĐẠI DIỆN HỘ KINH DOANH/\n CÁ NHÂN KINH DOANH\n (Ký, ghi rõ họ tên và đóng dấu (nếu có))`]);

    // Add representative name if available
    if (settings.representativeName) {
      rows.push(['', '', '', '']);
      rows.push(['', '', '', settings.representativeName]);
    }

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Apply formatting and center alignment
    applySheetFormatting(ws);

    // Add to workbook
    XLSX.utils.book_append_sheet(wb, ws, `Tháng ${month}`);

    // Generate filename
    const filename = generateFilename(settings.businessName, month, year);

    // Download file
    XLSX.writeFile(wb, filename);

    return {
      success: true,
      filename,
      dayCount: filtered.length,
      totalRevenue: grandTotal,
      totalGTGT,
      totalTNCN,
    };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: `Lỗi xuất file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// ============================================
// PREVIEW FUNCTION
// ============================================

export function getExportPreview(
  revenues: DailyRevenue[],
  month: number,
  year: number
): {
  dayCount: number;
  totalRevenue: number;
  totalGTGT: number;
  totalTNCN: number;
  totalOffline: number;
  totalOnline: number;
} {
  const filtered = revenues.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  let totalOffline = 0;
  let totalOnline = 0;

  filtered.forEach(r => {
    totalOffline += r.offline || 0;
    totalOnline += (r.grab || 0) + (r.shopeeFood || 0) + (r.be || 0) + (r.xanhSm || 0);
  });

  const totalRevenue = totalOffline + totalOnline;
  const totalGTGT = Math.round(totalRevenue * TAX_RATES.GTGT);
  const totalTNCN = Math.round(totalRevenue * TAX_RATES.TNCN);

  return {
    dayCount: filtered.length,
    totalRevenue,
    totalGTGT,
    totalTNCN,
    totalOffline,
    totalOnline,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate document code: PREFIX + MMDD + SEQ
 * Example: GR0115001 = Grab, Jan 15, sequence 1
 */
function generateCode(prefix: string, month: number, day: number, seq: number): string {
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const seqStr = String(seq).padStart(3, '0');
  return `${prefix}${monthStr}${dayStr}${seqStr}`;
}

function formatDateVN(isoDate: string): string {
  const d = new Date(isoDate);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function generateFilename(businessName: string, month: number, year: number): string {
  const safeName = businessName
    .replace(/[^a-zA-Z0-9_\u00C0-\u1EF9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 30);
  const monthStr = String(month).padStart(2, '0');
  // Add timestamp to ensure unique filenames (prevents Excel "same name" error)
  const now = new Date();
  const timestamp = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  return `S2A_${safeName}_${year}-${monthStr}_${timestamp}.xlsx`;
}

function applySheetFormatting(ws: XLSX.WorkSheet): void {
  // Set column widths
  ws['!cols'] = [
    { wch: 15 },  // Column A - Code
    { wch: 14 },  // Column B - Date
    { wch: 45 },  // Column C - Description
    { wch: 18 },  // Column D - Amount
  ];

  // Set row heights for header rows
  ws['!rows'] = [
    { hpt: 60 },  // Row 1 - Business info (taller for multi-line)
    { hpt: 30 },  // Row 2 - Title (centered)
    { hpt: 22 },  // Row 3 - Location (centered)
    { hpt: 22 },  // Row 4 - Period (centered)
    { hpt: 20 },  // Row 5
    { hpt: 20 },  // Row 6
    { hpt: 20 },  // Row 7
    { hpt: 20 },  // Row 8
  ];

  // Merge cells for header
  ws['!merges'] = [
    // Row 1: A1:C1 for business info
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    // Row 2: A2:D2 for title - SỔ DOANH THU BÁN HÀNG HÓA, DỊCH VỤ
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
    // Row 3: A3:D3 for location
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
    // Row 4: A4:D4 for period - Kỳ kê khai
    { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } },
    // Row 6: A6:B6 for "Chứng từ"
    { s: { r: 5, c: 0 }, e: { r: 5, c: 1 } },
  ];

  // Apply center alignment to title and period rows
  // Row 2 (index 1): SỔ DOANH THU BÁN HÀNG HÓA, DỊCH VỤ
  if (ws['A2']) {
    ws['A2'].s = {
      alignment: { horizontal: 'center', vertical: 'center' },
      font: { bold: true, sz: 14 }
    };
  }

  // Row 3 (index 2): Địa điểm kinh doanh
  if (ws['A3']) {
    ws['A3'].s = {
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }

  // Row 4 (index 3): Kỳ kê khai
  if (ws['A4']) {
    ws['A4'].s = {
      alignment: { horizontal: 'center', vertical: 'center' },
      font: { bold: true }
    };
  }
}

// ============================================
// CURRENCY FORMATTER (for display purposes)
// ============================================

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}
