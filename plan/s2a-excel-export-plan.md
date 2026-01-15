# S2A Excel Export - Selectable Tax Rate Implementation

Add Ministry-compliant Excel export with **selectable tax rate** (4.5% OR 7%, one at a time) to the S2A Ledger.

---

## User Review Required

> [!IMPORTANT]
> **Design Decision**: Export will generate a **single sheet** for the selected tax rate only (either 4.5% OR 7%), plus a summary sheet. This differs from the original plan which created multiple sheets for all tax rates.

---

## Proposed Changes

### Export Module

#### [NEW] [exportExcel.ts](file:///d:/Antigravity/cham%20cong/src/features/s2a/exportExcel.ts)

New module to handle Excel generation with **tax rate selection**:

```typescript
// Key interface
interface ExportOptions {
  transactions: S2ATransaction[];
  month: number;
  year: number;
  taxRate: 4.5 | 7;  // <-- SELECTABLE: one at a time
  businessName?: string;
}

// Main function
export function exportS2AExcel(options: ExportOptions): ExportResult
```

**Implementation details:**
- Filter transactions by selected month/year **AND selected tax rate**
- Create **single data sheet** for the chosen tax rate:
  - 4.5% → "Bán Lẻ (4.5%)" sheet
  - 7% → "Dịch Vụ (7%)" sheet  
- Generate "Tổng Hợp" (Summary) sheet with totals for selected rate only
- Apply blue header styling, yellow total row styling
- Filename format: `S2A_[BusinessName]_[TaxRate]_YYYY-MM.xlsx`

---

#### [MODIFY] [S2ALedger.tsx](file:///d:/Antigravity/cham%20cong/src/features/s2a/S2ALedger.tsx)

Add UI elements for Excel export with **tax rate selector**:

```diff
+ import { exportS2AExcel } from './exportExcel';
+ import { FileSpreadsheet } from 'lucide-react';

// New state for export modal
+ const [showExportModal, setShowExportModal] = useState(false);
+ const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
+ const [exportYear, setExportYear] = useState(new Date().getFullYear());
+ const [selectedTaxRate, setSelectedTaxRate] = useState<4.5 | 7>(4.5); // <-- TAX RATE SELECTOR

// Export button
+ <Button variant="primary" onClick={() => setShowExportModal(true)}>
+   <FileSpreadsheet className="w-4 h-4 mr-2" /> Xuất Excel
+ </Button>

// In export modal - Tax Rate Selector
+ <div className="mb-4">
+   <label className="block text-sm font-medium text-gray-700 mb-2">
+     Chọn Thuế Suất (một lựa chọn)
+   </label>
+   <div className="flex gap-4">
+     <button
+       className={`px-4 py-2 rounded-lg border-2 ${
+         selectedTaxRate === 4.5 
+           ? 'border-blue-500 bg-blue-50 text-blue-700' 
+           : 'border-gray-300 bg-white text-gray-700'
+       }`}
+       onClick={() => setSelectedTaxRate(4.5)}
+     >
+       4.5% - Bán Lẻ/Sản Xuất
+     </button>
+     <button
+       className={`px-4 py-2 rounded-lg border-2 ${
+         selectedTaxRate === 7 
+           ? 'border-orange-500 bg-orange-50 text-orange-700' 
+           : 'border-gray-300 bg-white text-gray-700'
+       }`}
+       onClick={() => setSelectedTaxRate(7)}
+     >
+       7% - Dịch Vụ/Ăn Uống/Lưu Trú
+     </button>
+   </div>
+ </div>
```

---

### Excel File Structure (Updated)

With **selectable tax rate**, the export generates:

```
S2A_Shop_4.5_2026-05.xlsx   (if 4.5% selected)
├── Sheet 1: "Bán Lẻ (4.5%)" - Filtered transactions
│   ├── Blue header row
│   ├── Transaction data rows (only 4.5% rate)
│   └── Yellow total row with tax calculation
└── Sheet 2: "Tổng Hợp" - Summary
    ├── Report period: 05/2026
    ├── Tax rate: 4.5%
    ├── Total revenue
    └── Tax liability
```

OR

```
S2A_Shop_7_2026-05.xlsx   (if 7% selected)
├── Sheet 1: "Dịch Vụ (7%)" - Filtered transactions
│   ├── Blue header row
│   ├── Transaction data rows (only 7% rate)
│   └── Yellow total row with tax calculation
└── Sheet 2: "Tổng Hợp" - Summary
    ├── Report period: 05/2026
    ├── Tax rate: 7%
    ├── Total revenue
    └── Tax liability
```

---

### Tax Rate Categories

| Tax Rate | Industries | Sheet Name |
|----------|-----------|------------|
| **4.5%** | Bán lẻ (BL), Sản xuất | "Bán Lẻ (4.5%)" |
| **7%** | Dịch vụ (DV), Ăn uống (AN), Lưu trú (LS) | "Dịch Vụ (7%)" |

---

## Reference Documents

The following comprehensive documents in `plan/s2a/` folder should be used as implementation reference:

| Document | Purpose |
|----------|---------|
| [enhanced-implementation-code.md](file:///d:/Antigravity/cham%20cong/plan/s2a/enhanced-implementation-code.md) | Production-ready code (400+ lines) |
| [COMPLETE_REVIEW_SUMMARY.md](file:///d:/Antigravity/cham%20cong/plan/s2a/COMPLETE_REVIEW_SUMMARY.md) | Full review with improvements |
| [plan-review-improvements.md](file:///d:/Antigravity/cham%20cong/plan/s2a/plan-review-improvements.md) | Detailed analysis |
| [DELIVERABLES_INDEX.md](file:///d:/Antigravity/cham%20cong/plan/s2a/DELIVERABLES_INDEX.md) | Document index |

---

## Verification Plan

### Manual Testing

1. Start dev server: `npm run dev`
2. Navigate to S2A Ledger tab
3. Add test transactions with different industries (BL, AN, DV, LS)
4. Click "Xuất Excel" button
5. **Select tax rate** (4.5% or 7%)
6. Select month/year
7. Verify preview shows only transactions for selected rate
8. Download and verify:
   - [ ] Single data sheet for selected tax rate
   - [ ] Summary sheet with correct totals
   - [ ] Filename includes tax rate
