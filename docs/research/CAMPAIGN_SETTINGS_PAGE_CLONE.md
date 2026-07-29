# Clone trang Campaign settings (Epom DSP)

Nguồn: `Campaign settings ｜ Epom Market (7_28_2026 1：55：29 PM).html` → cập nhật theo `… (7_28_2026 2：08：53 PM).html` (đã cấu hình budget)
Đây là trang xem/chỉnh 1 campaign — live URL `/campaigns/edit/<id>?viewMode=true`, breadcrumb `home / Campaigns / weigh loss`.

## Files

| File | Vai trò |
| --- | --- |
| `src/app/campaigns/edit/[id]/page.tsx` | Route + `metadata.title = "Campaign settings \| Epom Market"` |
| `src/components/CampaignSettingsView.tsx` | Toàn bộ UI + logic |
| `src/components/LineChart.tsx` | **Mới**: tách biểu đồ SVG khỏi `AnalyticsView`, thêm prop `width/height/bottom/spread/tiltLabels` để dùng cho cả 2 trang |
| `src/app/campaigns/new/bidding-strategy/page.tsx` | Đổi `<a>` → `<Link>` (route `[id]` mới làm ESLint bắt lỗi `no-html-link-for-pages`) |

## Dữ liệu thật lấy từ DOM

Campaign `weigh loss` (`dadb539e-a65a-45bf-8764-ffc55d87506d`), Video, **On** · Name `weigh loss`, Folder `Unsorted` · Pricing Model `CPM`, Default Price `0.025$` · Audience `Test` (`30e2719a-…`) · Bidding strategy chưa cấu hình · Traffic source: `Included` → `AdView Display` · Risk tolerance level `High` · Creative `home fitness 2.mp4` (`bb2b3f9e-…`, 1920x1440, `$0.025`, On, trạng thái pending approval).

**Budgets** (bản 2:08 — bản 1:55 còn "Budgets are not configured." + banner lỗi): `circle Delivering` · Flight dates `28.07.2026 07:03 – 31.07.2026 23:59`, Time Zones `UTC+00:00 London, GBR; Reykjavik, ISL; Dakar, SEN` · Limits: Type `Daily`, Spend limit **$100** per day, Imp limit **10,000** per day, Even Pacing `Off` (chấm xám) · `Impression-to-Bid rate Auto Adjust Enabled: On`.

## Tính năng (đã test trên browser)

- Slide-toggle **Status** của campaign và của creative (On/Off)
- Dropdown **Select Audience**; nút `Open Traffic Funnel` bị khoá cho tới khi chọn audience (đúng trạng thái `disabled` của bản gốc)
- Dropdown **Metric** của biểu đồ
- Archive creative → bảng về `No available data to show.`
- Link: audience `Test` → `/audience/edit/<id>`, `Open` → `/analytics?cid=…`, `Add new Creative`, breadcrumb `Campaigns`
- Bố cục 2 cột, gộp 1 cột dưới **1400px** (đúng media query gốc)

## Design token trích từ CSS gốc

| Thành phần | Giá trị |
| --- | --- |
| `.campaign-info-container` | radius 4, nền trắng, `padding: 16px 24px`, `gap: 44px`, flex center |
| `.campaign-type` | 12px muted, gap 8; `.campaign-type-name` 600 + `text-transform: capitalize`; icon 18px `margin-right: 4px` |
| `.form-control-wrapper.switcher-status` | flex, gap 8; label 400, `margin-bottom: 0` |
| `.page-content` | `display:flex; gap:16px; justify-content:space-between; margin-top:16px`; `@media (max-width:1400px)` → `flex-direction: column` |
| `.info-content` / `.additional-info` | đều `flex:1`; `.additional-info` `min-width: 560px` |
| `.form-box` | flex column, padding **24**, radius 4, nền trắng |
| `.headline-with-edit` | `display:flex; justify-content:space-between; margin:0` |
| `.button-link` | 12px/600 lh18, màu primary, gap 4, `margin-left: 6px`; icon 16px |
| `.option-info` | flex gap 4, lh 21, wrap; label muted, value `#1a1c1e` |
| `.optimization-view-block-content` | flex column gap **32**, `margin-top:16`; sub-block gap 12 |
| `div.info-banner.small` | flex, gap 4, `padding: 4px 8px`, radius 4, 12px lh18, `max-width:720`, `width: fit-content`; icon 16px |
| `.status-wrapper` | flex center 12/400 lh18; icon `circle` 10px `margin-right:4`; `-success` màu `--success-default-color` |
| `a.link-component-md` | 14px/600 lh21, primary + underline |
| `.traffic-funnel` | flex, gap 8, `align-items: flex-end`; select `flex:1; min-width:200px`; nút cao 36 |
| `.creative-wrapper` | form-box, `width:100%`, `margin-bottom:16` |
| `.creatives-container-header` | flex space-between; `.add-creative-wrapper` `margin-left:16`, gap 4 |
| `.list-wrapper` | `margin-top: 12px`; `.creative-table` `display:block; overflow:auto; max-height:570px`; `.table-flex` `width: max-content; min-width:100%` |
| `.actions-list button.icon-btn` | 32×32, radius 50px, màu muted, hover nền `#fafafa` + chữ primary |
| `.analytics-wrapper` | nền trắng, radius 4; `.campaign-page.page-header` `padding: 24px 24px 0`; `.component-charts-dashboard-container.campaign-page` `padding:16`, `border-top: 1px solid #c4c6d0`, bỏ radius |
| `.status-wrapper-cancelled` | màu `--light-basic-outline` (#74777f) — dùng cho Even Pacing `Off` |
| `.text-semi-bold` | 600 — bọc riêng con số `$100` / `10,000`, phần " per day" vẫn 400 |
| Biểu đồ | SVG 480×400, plot `x31 y10 w439 h289`, điểm trải **từ mép tới mép** (khác trang Analytics), nhãn trục X xoay **-45°** neo cuối tại `y=323`, nhãn Y `0` |

## Điểm phải suy đoán

1. **Options dropdown Metric** — panel đóng trong DOM; tạm dùng 8 chỉ số chính.
2. **Các nút `Edit`** của từng khối chưa dẫn đi đâu (live mở form chỉnh sửa tương ứng, chưa có bản lưu).
3. Màu nền banner lỗi `--error-container-color` không có trong CSS lưu → dùng `#ffdad6` (Material 3 error container, khớp tông `#ba1a1a`).
4. Link creative / `Add new Creative` trỏ `/campaigns/<id>/creatives/video…` — chưa clone nên ra 404 nội bộ.

## Fake data (`?demo=1`)

Trang nhận `?demo=1` để đổ dữ liệu giả vào biểu đồ (xem `docs/research/DEMO_DATA_REVIEW.md`). Mặc định vẫn là dữ liệu thật (toàn 0).

## Kiểm chứng

`npm run check` pass. Diff text render với text trích từ HTML gốc: **trùng 1:1** (chỉ khác thứ tự DOM của cặp label/select `Audience`, vốn là `flex-direction: column-reverse` nên hiển thị giống hệt).
Test browser: bật/tắt toggle campaign + creative, chọn audience → nút `Open Traffic Funnel` bật, archive creative → empty state.
