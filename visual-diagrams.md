# S2A Excel Export - Visual Diagrams & Flows

## 1. USER JOURNEY FLOW

```
┌─────────────────────────────────────────────────────────────┐
│                    USER JOURNEY                             │
└─────────────────────────────────────────────────────────────┘

       DAILY USAGE (Jan-May)          EXPORT (End of Month)
       
           Day 1              Day 2-30           Day 31
             │                   │                  │
             ├─ Enter tx ────────┼─ Keep adding ───┤
             │                   │                  │
          Transaction 1      Transactions         Ready to
          Amount: 5M          2-30                Export
          
                                                    │
                                                    v
                                          ┌────────────────┐
                                          │  User clicks   │
                                          │ "Xuất Excel"   │
                                          └────────┬───────┘
                                                   │
                                                   v
                                          ┌────────────────┐
                                          │ Select Month   │
                                          │ May 2026       │
                                          └────────┬───────┘
                                                   │
                                                   v
                                          ┌────────────────┐
                                          │ Preview Export │
                                          │ 15 transactions│
                                          │ Total: 100M    │
                                          └────────┬───────┘
                                                   │
                                                   v
                                          ┌────────────────┐
                                          │  Download      │
                                          │ S2A_Shop_2026- │
                                          │ 05.xlsx        │
                                          └────────┬───────┘
                                                   │
                                                   v
                                          ┌────────────────┐
                                          │ ✅ Success!    │
                                          │ File saved     │
                                          └────────────────┘
```

---

## 2. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                  DATA FLOW: DAILY → EXPORT                  │
└─────────────────────────────────────────────────────────────┘

WEB APP INPUT
    │
    v
┌──────────────────────┐
│  Transaction Form    │
├──────────────────────┤
│ Industry: Retail     │
│ Source: Shop         │
│ Amount: 5,000,000    │
│ Date: 01/05/2026     │
│ Description: ...     │
└──────────┬───────────┘
           │
           v
┌──────────────────────┐
│  Validation Layer    │
├──────────────────────┤
│ ✓ Gross revenue?     │
│ ✓ Tax rate assign    │
│ ✓ Amount format      │
└──────────┬───────────┘
           │
           v
┌──────────────────────────────┐
│  localStorage (Browser)      │
├──────────────────────────────┤
│ [{                           │
│   id: 1704877200000,        │
│   code: "BL0101",           │
│   date: "2026-05-01",       │
│   industry: "retail",       │
│   amount: 5000000,          │
│   taxRate: 4.5,             │
│   ...                       │
│ }, ...]                     │
└──────────┬───────────────────┘
           │
           v
EXPORT TRIGGERED
    │
    ├─ User clicks export
    ├─ Selects month/year
    ├─ Confirms preview
    │
    v
┌──────────────────────────────┐
│  exportExcel.js Module       │
├──────────────────────────────┤
│                              │
│  1. Filter by month/year     │
│     [15 matching transactions]
│                              │
│  2. Group by tax rate        │
│     ├─ 4.5%: 10 tx          │
│     └─ 7%: 5 tx             │
│                              │
│  3. Create sheet for 4.5%    │
│     ├─ Header row            │
│     ├─ 10 data rows          │
│     ├─ Total rows (formula)  │
│     └─ Formatting (colors)   │
│                              │
│  4. Create sheet for 7%      │
│     └─ Same structure        │
│                              │
│  5. Create summary sheet     │
│     ├─ Report period         │
│     ├─ Category totals       │
│     └─ Tax calculations      │
│                              │
└──────────┬───────────────────┘
           │
           v
┌──────────────────────┐
│  XLSX Library        │
├──────────────────────┤
│ Creates workbook     │
│ with 3 sheets        │
└──────────┬───────────┘
           │
           v
┌──────────────────────┐
│  Excel File (.xlsx)  │
├──────────────────────┤
│ S2A_Shop_2026-05.xlsx
│ File size: 45 KB     │
│ Download to user     │
└──────────┬───────────┘
           │
           v
USER HAS FILE
    │
    ├─ Opens in Excel ✅
    ├─ Opens in Google Sheets ✅
    ├─ Opens in LibreOffice ✅
    │
    v
✓ Can file taxes
✓ Can share with accountant
✓ Can keep records
✓ Compliant with Ministry
```

---

## 3. EXCEL FILE STRUCTURE

```
┌─────────────────────────────────────────────────────────────┐
│     S2A_ShopABC_2026-05.xlsx (Excel Workbook)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SHEET 1: "Bán Lẻ (4.5%)"                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [BLUE HEADER ROW]                                    │  │
│  │ Số Hiệu | Ngày, Tháng | Diễn Giải | Số Tiền (VND) │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ BL0101  | 01/05/2026  | Doanh thu tại cửa hàng | 5M │  │
│  │ BL0102  | 02/05/2026  | Doanh thu tại cửa hàng | 4.8M │
│  │ BL0103  | 03/05/2026  | Doanh thu tại cửa hàng | 5.2M │
│  │ ...     | ...        | ...                    | ... │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ [YELLOW TOTAL ROW]                                   │  │
│  │        |            | TỔNG DOANH THU        | 100M  │  │
│  │        |            | Thuế GTGT (4.5%)      | 4.5M  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  SHEET 2: "Dịch Vụ (7%)" (if applicable)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [BLUE HEADER ROW]                                    │  │
│  │ Số Hiệu | Ngày, Tháng | Diễn Giải | Số Tiền (VND) │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ DV0101  | 05/05/2026  | Doanh thu tư vấn | 2M       │  │
│  │ DV0102  | 10/05/2026  | Doanh thu thiết kế | 3M     │  │
│  │ ...     | ...        | ...             | ... │        │
│  ├──────────────────────────────────────────────────────┤  │
│  │ [YELLOW TOTAL ROW]                                   │  │
│  │        |            | TỔNG DOANH THU        | 50M   │  │
│  │        |            | Thuế GTGT (7%)       | 3.5M  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  SHEET 3: "Tổng Hợp" (Summary)                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ KỲ BÁO CÁO: 05/2026                                 │  │
│  │                                                      │  │
│  │ Bán Lẻ / Sản Xuất (4.5%)                            │  │
│  │   Tổng Doanh Thu        100,000,000 VND             │  │
│  │   Thuế phải nộp (4.5%)    4,500,000 VND             │  │
│  │                                                      │  │
│  │ Dịch Vụ / Lưu Trú (7%)                              │  │
│  │   Tổng Doanh Thu         50,000,000 VND             │  │
│  │   Thuế phải nộp (7%)      3,500,000 VND             │  │
│  │                                                      │  │
│  │ TỔNG DOANH THU          150,000,000 VND             │  │
│  │ TỔNG THUẾ PHẢI NỘP        8,000,000 VND             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. TAX RATE CATEGORIZATION LOGIC

```
┌─────────────────────────────────────────────────────────────┐
│            TAX RATE ASSIGNMENT TREE                         │
└─────────────────────────────────────────────────────────────┘

SELECT INDUSTRY IN FORM
           │
           v
    ┌──────────────────┐
    │ What business    │
    │ are you in?      │
    └────────┬─────────┘
             │
    ┌────────┴────────┐
    │                 │
    v                 v
┌─────────────┐   ┌────────────┐
│  4.5% Rate  │   │  7% Rate   │
├─────────────┤   ├────────────┤
│ ✓ Retail    │   │ ✓ Services │
│ ✓ Dining    │   │ ✓ Consult  │
│ ✓ Food      │   │ ✓ Training │
│ ✓ Beverage  │   │ ✓ Design   │
│ ✓ Production│   │            │
│ ✓ Manufact.│   │ ✓ Accomm.  │
│ ✓ Wholesale│   │ ✓ Lodging  │
│ ✓ E-commerce│   │            │
│             │   │ ✓ Transport│
│             │   │ ✓ Shipping │
└──────┬──────┘   └──────┬─────┘
       │                 │
       v                 v
   SHEET 1          SHEET 2
 "Bán Lẻ"         "Dịch Vụ"
  (4.5%)            (7%)
   
MULTI-CATEGORY BUSINESS
       │
       ├─ Has retail + services?
       │  → Create BOTH sheets
       │
       ├─ Has retail only?
       │  → Create 4.5% sheet only
       │
       └─ Has services only?
          → Create 7% sheet only
```

---

## 5. IMPLEMENTATION TIMELINE GANTT

```
┌─────────────────────────────────────────────────────────────┐
│        IMPLEMENTATION TIMELINE (4 Weeks)                    │
└─────────────────────────────────────────────────────────────┘

       JAN 13      JAN 20      JAN 27      FEB 3       FEB 10
        ↓           ↓           ↓           ↓           ↓
        │           │           │           │           │
WEEK 1  │███████████│           │           │           │
        │ Data Model│           │           │           │
        │ + Export  │           │           │           │
        │ Module    │           │           │           │
        │           │
        │   WEEK 2  │███████████│           │           │
        │           │  UI + Modal│           │           │
        │           │  Integration           │           │
        │           │
        │           │   WEEK 3  │███████████│           │
        │           │           │ Testing & │           │
        │           │           │ Docs      │           │
        │           │           │
        │           │           │   WEEK 4  │███████████│
        │           │           │           │ Beta Test │
        │           │           │           │ & Launch  │
        │           │           │           │           │
        └───────────────────────────────────────────────┘

        ────── Development (16 hrs/week)
        ────── QA & Testing (8 hrs/week)
        ────── Documentation (5 hrs/week)
        ────── Project Management (3 hrs/week)
```

---

## 6. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│              SYSTEM ARCHITECTURE DIAGRAM                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          WEB APP FRONTEND (React)       │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │  Dashboard   │  │  Form Entry  │   │
│  └──────────────┘  └──────────────┘   │
│         │                   │          │
│         └───────────┬───────┘          │
│                     │                  │
│              ┌──────v─────┐            │
│              │  Validation│            │
│              │   Layer    │            │
│              └──────┬─────┘            │
│                     │                  │
└─────────────────────┼──────────────────┘
                      │
                      v
        ┌─────────────────────────┐
        │ Browser localStorage    │
        │ (JSON Data)             │
        └────────────┬────────────┘
                     │
        ┌────────────v────────────┐
        │ exportExcel.js          │
        │ (Export Module)         │
        │                         │
        │ - Filter by month/year  │
        │ - Group by tax rate     │
        │ - Create sheets         │
        │ - Apply formatting      │
        │ - Calculate totals      │
        └────────────┬────────────┘
                     │
        ┌────────────v────────────┐
        │ XLSX Library            │
        │ (Excel Generator)       │
        │                         │
        │ - Create workbook       │
        │ - Add sheets            │
        │ - Apply styles          │
        │ - Generate binary       │
        └────────────┬────────────┘
                     │
        ┌────────────v────────────┐
        │ Download Handler        │
        │                         │
        │ S2A_Shop_2026-05.xlsx   │
        └─────────────────────────┘
```

---

## 7. FEATURE COMPARISON: BEFORE vs AFTER

```
┌─────────────────────────────────────────────────────────────┐
│            FEATURE BEFORE vs AFTER EXPORT                   │
└─────────────────────────────────────────────────────────────┘

BEFORE (MVP - Phase 1)
┌──────────────────────────┐
│ ✓ Quick daily entry      │
│ ✓ Auto code generation   │
│ ✓ Tax rate assignment    │
│ ✓ Daily dashboard        │
│ ✓ Basic reports          │
│ ✗ CSV export only        │
│ ✗ No tax summary         │
│ ✗ Hard to use for filing │
│ ✗ Not Ministry compliant │
└──────────────────────────┘

AFTER (Phase 2 - with Excel Export)
┌──────────────────────────┐
│ ✓ Quick daily entry      │
│ ✓ Auto code generation   │
│ ✓ Tax rate assignment    │
│ ✓ Daily dashboard        │
│ ✓ Basic reports          │
│ ✓ CSV export             │
│ ✓ EXCEL export ← NEW!    │
│ ✓ Tax summary sheet      │
│ ✓ Professional format    │
│ ✓ Ministry S2a-HKD ✓     │
│ ✓ Multi-sheet support    │
│ ✓ Gross revenue tracking │
│ ✓ Easy tax filing        │
└──────────────────────────┘
```

---

## 8. TAX CALCULATION EXAMPLE

```
┌─────────────────────────────────────────────────────────────┐
│           TAX CALCULATION WALKTHROUGH                       │
└─────────────────────────────────────────────────────────────┘

SAMPLE MONTH: May 2026

CATEGORY 1: RETAIL (4.5% tax rate)
  Transaction 1: 5,000,000 VND
  Transaction 2: 4,800,000 VND
  Transaction 3: 5,200,000 VND
  ─────────────────────────
  Subtotal:    15,000,000 VND
  
CATEGORY 2: E-COMMERCE (4.5% tax rate, same as retail)
  Transaction 4: 10,000,000 VND
  ─────────────────────────
  Subtotal:    10,000,000 VND

[BOTH 4.5% - GO IN SAME SHEET]

TOTAL FOR 4.5% RATE:   25,000,000 VND
TAX AMOUNT (4.5%):      1,125,000 VND ← Calculation: 25M × 0.045

─────────────────────────────────────────────────────────────

CATEGORY 3: CONSULTING SERVICES (7% tax rate)
  Transaction 5:  2,000,000 VND
  Transaction 6:  3,000,000 VND
  ─────────────────────────
  Subtotal:       5,000,000 VND

[7% - GOES IN SEPARATE SHEET]

TOTAL FOR 7% RATE:      5,000,000 VND
TAX AMOUNT (7%):          350,000 VND ← Calculation: 5M × 0.07

─────────────────────────────────────────────────────────────

SUMMARY SHEET:
  Sheet 1 (4.5%): 25,000,000 VND → Tax: 1,125,000 VND
  Sheet 2 (7%):    5,000,000 VND → Tax:   350,000 VND
  ───────────────────────────────────────────────
  TOTAL:          30,000,000 VND → TAX: 1,475,000 VND
```

---

## 9. QUALITY ASSURANCE FLOW

```
┌─────────────────────────────────────────────────────────────┐
│                 QA TESTING FLOW                             │
└─────────────────────────────────────────────────────────────┘

CODE WRITTEN
      │
      v
┌──────────────────┐
│  Unit Tests      │ ✓ Each function tested
│  (90% coverage)  │ ✓ Edge cases
│                  │ ✓ Error handling
└────────┬─────────┘
         │
    ┌────v────┐
    │  PASS?  │
    └────┬────┘
         │
    NO   │   YES
    ├────┴────┐
    │         v
    │    ┌─────────────────┐
    │    │ Integration Test│ ✓ Multi-sheet export
    │    │ (Full workflow) │ ✓ Data accuracy
    │    └────────┬────────┘
    │             │
    │         ┌───v────┐
    │         │ PASS?  │
    │         └────┬───┘
    │              │
    │         NO   │  YES
    │         ├────┴────┐
    │         │         v
    │         │    ┌──────────────────┐
    │         │    │ Browser Compat   │ ✓ Chrome, Firefox, Safari
    │         │    │ (Cross-browser)  │ ✓ Mobile browsers
    │         │    └────────┬─────────┘
    │         │             │
    │         │         ┌───v────┐
    │         │         │ PASS?  │
    │         │         └────┬───┘
    │         │              │
    │         │          NO  │  YES
    │         │         ├────┴────┐
    │         │         │         v
    │         │         │    ┌──────────────────┐
    │         │         │    │ Beta Testing     │ ✓ 5 real users
    │         │         │    │ (Real users)     │ ✓ Feedback
    │         │         │    └────────┬─────────┘
    │         │         │             │
    │         │         │         ┌───v────┐
    │         │         │         │PASS &  │
    │         │         │         │ Good?  │
    │         │         │         └────┬───┘
    │         │         │              │
    │         │         │          NO  │ YES
    │         │         │         ├────┴────┐
    │         │         │         │         v
    │         │         │         │   ┌───────────┐
    │         │         │         │   │ READY FOR │
    │         │         │         │   │ PRODUCTION│
    │         │         │         │   └───────────┘
    │         │         │         │
    └─────────┴─────────┴─────────┘
              FIX ISSUES
              TRY AGAIN
```

---

## 10. USER ADOPTION FORECAST

```
┌─────────────────────────────────────────────────────────────┐
│         USER ADOPTION FORECAST (Year 1)                     │
└─────────────────────────────────────────────────────────────┘

MONTH 1 (Feb): Feature Launch
  Total Users:      500
  Export Usage:     30% (150 users)
  Monthly Exports:  150-250
  Growth Rate:      -

MONTH 2 (Mar): Word of Mouth
  Total Users:      800
  Export Usage:     50% (400 users)
  Monthly Exports:  400-500
  Growth Rate:      +150-200%

MONTH 3 (Apr): Marketing Push
  Total Users:     1,500
  Export Usage:     60% (900 users)
  Monthly Exports:  900-1,200
  Growth Rate:      +100-150%

MONTH 4+ (May onwards): Stable Growth
  Total Users:     2,500+
  Export Usage:     70%+ (1,750+ users)
  Monthly Exports:  1,750+ per month
  Growth Rate:      +20-30% month-over-month

VISUALIZATION:
                         ▲ Export Usage %
                         │
                    70%  │       ╱─────
                         │      ╱
                    60%  │     ╱
                         │    ╱
                    50%  │   ╱╱
                         │  ╱╱
                    40%  │ ╱╱
                         │╱╱
                    30%  ├─
                         │
                    0%   └─────────────────► Months
                         1  2  3  4  5  6
```

---

**End of Visual Diagrams**