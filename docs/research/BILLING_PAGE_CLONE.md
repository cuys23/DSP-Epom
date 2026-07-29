# Clone lại trang Billing / Transactions (Epom DSP)

Nguồn: `Transactions ｜ Epom Market (7_29_2026 10：07：49 AM).html` (route `/billing`, title `Transactions | Epom Market`).
Bản lưu chỉ chứa DOM **đã render**, nên toàn bộ nội dung dropdown và panel PayPal/Wire transfer được lấy bổ sung **trực tiếp trên site live** qua Chrome (tài khoản `Minh Do`, balance `$0`, chưa có giao dịch nào).

## Files

| File | Vai trò |
| --- | --- |
| `src/app/billing/page.tsx` | Route mới `/billing`, metadata `Transactions \| Epom Market` |
| `src/components/BillingView.tsx` | Toàn bộ trang: add-funds card + transaction history + bảng + `MultiSelect` |
| `src/components/DateRangePicker.tsx` | Tách ra từ `PageHeader` để dùng chung cho dashboard và billing |
| `src/components/PageHeader.tsx` | Rút gọn, dùng `DateRangePicker` |
| `public/images/{visa,mastercard,paypal,wire-transfer}.svg` | Icon thẻ, giải base64 từ `<img class="card-icon">` trong bản lưu |

## Cấu trúc DOM gốc

```
app-deposit
├── .page-header > .container > .page-title > h1   "Billing" + help_outline → help.dsp.epom.com/docs/billing
└── .container.billing-container
    └── .page-content (radius 8)
        └── .billing-wrapper (padding 24)
            ├── form > .switchers-group
            │   ├── label.control-label            "Payment Method"
            │   └── .payment-switchers             3 radio: stripe / paypal / wiretransfer
            └── .stripe-payment > app-stripe-setup
                ├── .balance-wrapper               "Balance:" + $0.00
                ├── .payment-amount-wrapper        input + label "Amount *"
                └── button.button-proceed-payment  "Proceed Payment"
app-transaction
├── .page-header > .container > .transaction-history-container   title + epom-daterange
├── .container > .transaction-history-option-block               search + 2 custom-select + Get transactions
└── .container > .component-table-data
    ├── .table-flex.no-data > table.table > thead                9 cột
    └── epom-spinner-table-no-data                               "No available data to show."
```

## Nội dung lấy thêm từ site live (không có trong bản lưu)

- **Select type** → multi-select checkbox: **Credit**, **Debit**. Chọn nhiều → title hiển thị `Credit,  Debit` (dấu phẩy + 2 space).
- **Select payment method** → panel **"No data"** (list build từ lịch sử giao dịch của chính tài khoản, đang rỗng).
- Có filter đang chọn → hiện link **`Reset Filter`** (icon `refresh`, màu primary) giữa select và nút `Get transactions`.
- **PayPal**: panel giống Stripe, nhưng khi nhập amount hợp lệ thì hiện dòng `Processing Fee ≈ 0` và nút PayPal `#009cde` thay cho `Proceed Payment`.
- **Wire transfer**: không có form, chỉ 1 dòng *"Please contact your account manager for details regarding the Wire transfer."*
- **Amount < 100**: viền input + dấu `*` + message chuyển `#BA1A1A`, message `Amount should not be lower than 100`, nút disable.
- **Date range**: mặc định `30.06.2026 - 29.07.2026`, preset đang active là `Last 30 days`; danh sách preset giống hệt dashboard.

## Design token trích từ CSS gốc

| Thành phần | Giá trị |
| --- | --- |
| `.page-content` | `border-radius: 8px`, nền trắng; `.billing-wrapper` padding `24px` |
| `.billing-container` | `margin-bottom: 16px` |
| `.payment-switchers` | flex, `gap: 12px`, khoảng cách xuống Balance đo thực tế **32px** |
| `.payment-method-option-label` | `min-width: 224px`, `height: 36px`, radius 4, `padding: 7px 12px 8px 36px` |
| radio `::before` / `::after` | vòng 16×16 tại `margin 9px` (checked: border 2px primary), chấm 8×8 tại `margin 13px` |
| radio checked (scoped c201) | `background-color: rgba(0,91,192,0.08)`, border primary — **không** phải tint primary |
| `.card-icon` | 30×18 |
| `label.control-label` | `12px / 18px / 600`, `#74777F`; `.required-item` màu primary, `margin-left 4px` |
| `.form-control` | h36, radius 4, `padding 8px 12px`, border `#C4C6D0`, hover `rgba(26,28,30,0.04)`, focus border primary |
| `.payment-amount-wrapper` | width cố định **396px** (nút Proceed Payment cũng 396px, `margin-top: 36px`) |
| `.button` | radius 4, `14px / 21px / 600`, `padding 7.5px 16px`, `min-width 96px` |
| `.button-primary:disabled` | nền `rgba(26,28,30,0.12)`, chữ `rgba(26,28,30,0.3)` |
| `.transaction-history-text` | `16px / 24px / 700` |
| `.transaction-history-option-block` | nền trắng, radius 4, `padding 16px`, `gap 10px`, `justify-content: space-between` |
| `.transaction-history-filters` | flex wrap, `gap 12px`; search và mỗi select đều **224px** |
| `.select-title` | h36, radius 4, border `#C4C6D0`, `padding 6px 36px 7px 11px`, placeholder `#74777F`; `.dropdown-arrow` 20px tại `top 7px / right 12px` |
| `.table > thead > tr > th` | nền `#E1E2EC`, `12px / 18px / 600`, `padding 8px 16px` → cao **34px** |
| `.table-flex` | border 1px `#C4C6D0`, radius 3; khi rỗng `border-radius: 3px 3px 0 0` |
| `.component-table-no-data` | cao **66px**, nền trắng, không border, chữ `12px / 21px` `#74777F` |

## Đối chiếu hình học (viewport 1440, đo bằng `getBoundingClientRect`)

| Element | Live | Clone |
| --- | --- | --- |
| h1 Billing | y 95 h 24 | y 95 h 24 |
| card | y 141 h 321 | y 141 h 321 |
| "Payment Method" | y 165 h 18 | y 165 h 18 |
| radio đầu tiên | y 191 h 36 w 224 | y 191 h 36 w 224 |
| Balance | y 259 | y 259 |
| Amount wrapper | y 308 h 58 w 396 | y 308 h 58 w 396 |
| Proceed Payment | y 402 h 36 | y 402 h 36 |
| Transaction history | y 478 h 36 | y 478 h 36 |
| filter block | y 530 h 68 | y 530 h 68 |
| table | y 614 h 36 (th 34) | y 614 h 36 (th 34) |
| no-data | y 650 h 66 | y 650 h 66 |
| card khi Wire transfer | y 141 h 163 | y 141 h 163 |
| card khi PayPal (amount hợp lệ) | fee y 370 / nút y 401 | fee y 370 / nút y 401 |
| card khi amount < 100 | error y 370 / nút y 424 | error y 370 / nút y 424 |

## Dữ liệu (thêm sau khi clone xong UI)

Xem `src/lib/transactions.ts`. Nguyên tắc: **debit là số thật, credit là hệ quả**.

- Mỗi ngày tài khoản có traffic → 1 dòng **Debit** `Campaigns daily spending`, số tiền = `dayMetrics(date).spend` (tổng spend của mọi campaign hôm đó). Tổng 89 dòng = **$13,335.51**, đúng bằng spend mà `/analytics` báo cáo.
- Sổ cái được duyệt tiến theo thời gian; khi số dư không đủ trả 14 ngày tới thì sinh 1 dòng **Credit** `Funds deposit via …` với mệnh giá tròn ($1,000 / $2,000 / $5,000). Ra **5 lần nạp, tổng $14,000**.
- Số dư cuối = `14,000 − 13,335.51 =` **$664.49** → hiển thị cả ở form deposit lẫn `Balance:` trên top bar (`ACCOUNT_BALANCE_CENTS`).
- Tiền lưu bằng **cents số nguyên**; cộng dồn bằng float qua 94 dòng sẽ lệch vài cent và cột Balance sẽ không cộng đúng.
- Dropdown **Select payment method** giờ có dữ liệu (`Credit Card / Wire transfer / PayPal`) vì nó dựng từ chính các phương thức đã dùng trong sổ cái — live hiện `No data` chỉ vì tài khoản chưa có giao dịch nào.
- Date range mặc định đổi từ `30.06.2026 - 29.07.2026` (snapshot) sang **30 ngày cuối của tài khoản** = `01.06.2026 - 30.06.2026`, nếu không thì range mặc định sẽ không chứa giao dịch nào.
- `Get transactions` commit filter đang chọn (search / type / payment method); `Reset Filter` xoá và commit luôn. Sort được trên Date / Description / Amount.

Ràng buộc được assert trong `npm run check:demo`: cột Balance đúng là running total, không bao giờ âm, `debit tổng == spend tài khoản`, `balance == deposits − spend`, credit luôn có method + invoice còn debit thì không.

## Sai khác cố ý

- **Nút PayPal** trên live là iframe của PayPal SDK, logo là ảnh raster không tái sử dụng được. Clone dùng nút `#009cde` với wordmark bằng chữ (`ponytail:` comment trong code). Đúng màu, đúng kích thước 396×36, đúng vị trí.
- **Balance $664.49 thay vì $0.** Kéo theo: toast `Your Balance is too low to bid!` (gắn `BALANCE_TOO_LOW`, ngưỡng $100) không còn hiện.
- **Lịch nạp tiền là bịa** — mốc nạp, mệnh giá, phương thức. Spend thì không.
- Date range vẫn là chuỗi tĩnh (suy từ `LATEST_DAY`), không tính theo `Date.now()` để tránh lệch hydration.
