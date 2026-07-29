# Clone trang Traffic Funnel (Epom DSP)

Nguồn: `Analytics ｜ Epom Market (7_28_2026 1：32：36 PM).html`
File mang tên Analytics nhưng nội dung là component `<traffic-funnel>` (mục con của Analytics) — tab title của live app không đổi khi chuyển route, nên `metadata.title` giữ nguyên `"Analytics | Epom Market"`; breadcrumb là `home / Traffic Funnel`.

## Files

| File | Vai trò |
| --- | --- |
| `src/app/traffic-funnel/page.tsx` | Route `/traffic-funnel` |
| `src/components/TrafficFunnelView.tsx` | Toàn bộ UI + logic, gồm `Select` (custom-select) và toast cảnh báo |
| `src/components/form/Dialog.tsx` | Sửa `BTN_OUTLINED_GREY` cho khớp `.button-outlined-grey` thật: viền `--neutral-outline-color` (#74777f) + style `:disabled` |

## Tính năng (đã test trực tiếp trên browser)

- **Add Filter** (w 172) mở dropdown 4 filter còn ẩn, chọn xong filter hiện ra trong `filters-list`; hết filter thì nút disabled
- **Campaign*** / **Audience*** là custom-select 312px; option lấy từ dữ liệu thật: Campaign = `weigh loss`, Audience = `Test`; chưa chọn thì hiện placeholder muted `Select option`
- **Apply Filters and Start** disabled cho tới khi cả 2 filter bắt buộc có giá trị (đúng trạng thái bản gốc: Campaign đã chọn, Audience trống → nút xám)
- Trạng thái `Data is not gathering` (đỏ) ↔ `Data is gathering` (xanh); **Start** chỉ bật khi đã Apply mà chưa chạy; **Reset data** (icon `restart_alt`) đưa về trạng thái dừng
- Vùng `No Data` co giãn chiếm hết chiều cao còn lại, căn giữa
- Toast cảnh báo góc phải dưới: `Your Balance is too low to bid! Please deposit funds`, đóng được bằng icon ×

## Design token trích từ CSS gốc

| Thành phần | Giá trị |
| --- | --- |
| `.traffic-funnel-dropdown` | `display:inline-block; width:172px` |
| `.filters-list` | `margin-top:16px; display:flex; flex-wrap:wrap; align-items:end; gap:16px`; mỗi `.form-group` rộng **312px**, `margin-bottom:0` |
| `.required-item` | 12px, 600, `margin-left:4px; margin-top:-2px`, màu primary |
| `.select-title .title` | placeholder 14/400 lh21, màu `#74777f` |
| `.button-outlined-grey` | viền 1px `--neutral-outline-color`, chữ `--neutral-on-main-neutral-color`, padding `6.5px 16px`; hover nền `on-main-neutral-8`; disabled viền + chữ `--neutral-on-disable-color` |
| `.action-panel` | `display:flex; align-items:center; height:36px`; `.action-buttons` `justify-content:end`; `.reset-button` flex gap 4; `.ml-16` giữa 2 nút |
| `.data-stopped` | màu `--error-default-color` |
| `.no-data-container` | `flex-grow:1; width:100%; flex; center`; `.no-data` 16px/700 |
| `.notifications-list` | `position:fixed; bottom:24px; right:24px; width:396px; z-index:100000001` |
| `.notifications-list li` | flex nowrap, gap 16, padding 16, radius 4, `margin-top:8px`, nền `#2f3033`, chữ `#f1f0f4`; `.notifications-text` `max-width:296px`; icon warning màu `--warning-container-color` (#ffefd5) |

## Điểm phải suy đoán (HTML không chứa)

1. **Tên 4 filter còn ẩn** — DOM chỉ có 4 `<div class="form-group filter-hide sf-hidden">` **rỗng** (Angular xoá nội dung khi ẩn) và dropdown Add Filter đóng. Số lượng 4 là chính xác, tên thì đang tạm dùng `Creative / Country / Device Type / Traffic Source` — sửa 1 chỗ duy nhất là mảng `FILTERS` trong `TrafficFunnelView.tsx`. Cần ảnh chụp dropdown **Add Filter** đang mở để sửa đúng.
2. **Option của 4 filter đó** để rỗng (tài khoản chưa có traffic) → dropdown hiện `No available data to show.`
3. **Luồng Start / Reset** — bản gốc chụp ở trạng thái dừng nên chỉ thấy `data-stopped`. Trạng thái đang chạy được dựng lại: chữ `Data is gathering` màu success, Start bị khoá khi đang chạy.
4. **Toast cảnh báo** là notifier cấp app (hiện ở mọi trang khi balance = 0) nhưng chỉ xuất hiện trong DOM của lần lưu này, nên tạm đặt riêng ở trang Traffic Funnel.

## Ghi chú

Filter Campaign chứa campaign thật tên **`weigh loss`** → tài khoản hiện đã có campaign, trong khi trang `/campaigns` đang clone theo bản lưu lúc còn 0 campaign (empty state "Get started by creating your first Campaign"). Nếu cần đồng bộ thì phải lưu lại trang Campaigns.

## Kiểm chứng

`npm run check` (lint + typecheck + build) pass, `/traffic-funnel` prerender static.
Test trên `localhost:3001`: chọn Audience = Test → nút Apply bật → bấm → `Data is gathering` (xanh); Add Filter → thêm Country; Reset data → quay lại `Data is not gathering` (đỏ).
