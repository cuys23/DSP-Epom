# Clone trang Analytics (Epom DSP)

Nguồn: `Analytics ｜ Epom Market (7_28_2026 1：14：38 PM).html`

## Files

| File | Vai trò |
| --- | --- |
| `src/app/analytics/page.tsx` | Route + `metadata.title = "Analytics \| Epom Market"` |
| `src/components/AnalyticsView.tsx` | Toàn bộ UI + logic (client component), gồm `LineChart` SVG, `DateRange`, `ColumnsDialog` |
| `src/components/form/Dialog.tsx` | **Mới**: tách `Dialog` + hằng `BTN_PRIMARY / BTN_OUTLINED / BTN_OUTLINED_GREY` ra khỏi `AudienceEditView` để dùng chung |
| `src/components/CampaignFilters.tsx` | Sửa: `FilterSelect` cắt chữ (`truncate`) để dropdown Time offset dài không xuống dòng |

Tái dùng sẵn có: `AppShell`, `FilterSelect` (Group by / Time offset / Metric), `MaterialIcon`, `cn()`.
Sidebar đã có mục `Analytics → /analytics` nên không phải sửa nav.

## Tính năng (đã test trực tiếp trên browser)

- **Date range**: ô đọc-only `dd.mm.yyyy - dd.mm.yyyy` + icon `event`, click mở popover 2 ô `<input type="date">` (From/To ràng buộc lẫn nhau)
- **Group by** 12 dimension, **Time offset** 7 múi giờ, **Metric** 26 chỉ số
- **Get Report**: bảng + biểu đồ chỉ cập nhật khi bấm nút này (đúng mô hình pending/applied của bản gốc)
- **↑ Hide Chart / ↓ Show Chart** ẩn hiện khối biểu đồ
- **Export to CSV** tải file `analytics-<from>_<to>.csv` dựng từ đúng các cột đang hiện
- **Add Dimension Filter** → thêm ô lọc có nhãn + nút ×, kèm nút **Reset filters**; icon `filter_list` trên mỗi dòng thêm nhanh filter theo giá trị dòng đó
- **Table configuration** (icon `settings` ở header cột đầu) → dialog chọn hiển thị 26 cột
- Sort mọi cột (mũi tên hiện khi hover / khi đang sort), cột dimension **sticky** 280px + đường kẻ 1px sticky, hover đổi nền `#fafafa`
- Hàng **Total** ở `tbody` thứ hai, đếm `N items`, dropdown page size 10/25/50/100, phân trang khi > 1 trang
- Empty state `No available data to show.`

## Design token trích từ CSS gốc

| Thành phần | Giá trị |
| --- | --- |
| `.page-title h1` | 20px/700, lh 24, h 36 |
| `.filters-container` | padding 16, radius 4, nền trắng |
| `.analytic-head-container` | flex, space-between, gap 16, wrap; cột trái `flex:1` gap 12; `.analytic-head-actions` gap 12, `align-items:start` |
| `.dropdown-toggle` | h 36, viền `#c4c6d0`, padding `6px 12px 7px`, radius 4, 14/400 lh21; `.dropdown-title` muted `mr 8`; icon `arrow_drop_down` 20px `margin-left:auto` |
| `.select-title` (Time offset) | h 36, padding `6px 36px 7px 11px`, arrow `top 7 right 12`; wrapper rộng **364px** |
| `.dimension-filter` | `min-width: 200px`, h 36, `.button-outlined` (viền + chữ primary, 600) |
| `.component-charts-dashboard-container` | min-height 438, padding 24, radius 3, `margin-bottom 16`, nền trắng |
| `.linear-chart` | `margin-top: 16px`; SVG Highcharts 1088×400, plot `x31 y10 w1047 h332` |
| `.table-flex` | `display:block`, `overflow-x:auto`, viền 1px `#c4c6d0`, radius 3, nền trắng |
| `thead th` | bg `#e1e2ec`, 12/600, lh 18, padding `8px 16px`, `vertical-align:middle` |
| `tbody td` | 12/400, lh 18, padding 16; `.many-bodys` thêm `border-top: 1px solid #c4c6d0`; hover `#fafafa` |
| `.sticky` | `position:sticky; left:0; z-index:2; width/min/max 280px`; th nền `#e1e2ec`, td nền trắng, `.sticky-total` luôn trắng |
| `.line` | cột kẻ dọc: `position:sticky; left:280px; width:1px; padding:0 0 0 1px`, nền `#c4c6d0` |
| `.table-cell` | `flex-direction: row-reverse` + `justify-content: space-between` → giá trị bên trái, icon `filter_list` bên phải |
| `.button-settings` | 16px, màu primary, `top: 2px`; `.button-filter` 20px muted, hover primary |
| `tr.total > td` | 12px, `font-weight: 600`, lh 18.5 |
| `.pagination-info` | flex gap 8, chữ 12px muted cao 36; nút page size `padding 7.5px 8px; gap 4; h 36` |

## Điểm phải suy đoán (HTML không chứa)

1. **Options của Group by / Time offset / Metric / Add Dimension Filter** — tất cả dropdown đều đóng lúc save trang. Metric lấy đúng 26 cột của bảng; Group by và Add Dimension Filter dùng danh sách dimension hợp lý; Time offset dùng 7 múi giờ mẫu (bản gốc là danh sách UTC đầy đủ).
2. **Dữ liệu khi group by ≠ Date** — tài khoản không có traffic nên bảng trả rỗng; clone cũng cho rỗng (chỉ Date sinh 1 dòng/ngày trong khoảng đã chọn).
3. **`--diagrams-primary-color`** không có trong CSS đã lưu → dùng `#6f79dd` (màu link/diagram của theme violet).
4. **Biểu đồ**: bản gốc là Highcharts spline; clone vẽ SVG thuần theo đúng hình học của bản gốc (plot 1047×332, điểm cách đều `plotW/n`, marker r=4, nhãn trục 12px/10px). Chuỗi toàn 0 → đường nằm giữa và trục y chỉ có nhãn `0`, giống hệt bản gốc. Nếu có dữ liệu khác 0 thì clone vẽ đường gấp khúc chứ không nội suy spline.
5. **Không gọi API** — mọi state nằm trong React, không lưu qua reload.

## Kiểm chứng

`npm run check` (lint + typecheck + build) pass, `/analytics` prerender static.
Test trên `localhost:3001`: đổi From sang 26.07 → Get Report (bảng 7 → 3 dòng, chart 7 → 3 điểm), Hide Chart, Group by → Campaign → Get Report (header đổi tên, empty state, `0 items`), Table configuration bỏ 2 cột → bảng ẩn đúng 2 cột, Add Dimension Filter → Country hiện ô lọc + Reset filters.
Chưa bấm thử **Export to CSV** trên browser vì nút này tải file thật về máy.
