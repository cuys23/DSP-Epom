# Clone lại trang Campaigns (Epom DSP)

Nguồn: `Campaigns ｜ Epom Market (7_28_2026 1：48：27 PM).html` → cập nhật theo `Campaigns ｜ Epom Market (7_28_2026 2：03：40 PM).html`
Bản lưu cũ chụp lúc tài khoản còn **0 campaign** (chỉ có empty state). Bản này đã có **1 campaign thật** nên trang hiện bảng đầy đủ kèm sub-table creatives đang mở.

## Files

| File | Vai trò |
| --- | --- |
| `src/components/CampaignsListView.tsx` | Viết lại: bảng campaign dạng flex-grid + accordion creatives + phân trang |
| `src/components/CampaignFilters.tsx` | Chuyển sang controlled (`value` / `onChange`) để list lọc được; thêm tooltip `Show advanced filters` |
| `src/components/FoldersPanel.tsx` | Không đổi, chỉ truyền `allCount = 1` |
| `src/components/SortLabel.tsx` | Dùng lại cho caret sort của header |

## Dữ liệu thật lấy từ DOM

- Campaign `weigh loss`, id `dadb539e-a65a-45bf-8764-ffc55d87506d`, **On**, Video (`smart_display`), CPM, eCPM/Win rate = `-`, tạo `28/07/26`

> **Sai khác so với bản lưu (cố ý):** clone giữ nguyên `weigh loss` ở đầu bảng nhưng bổ sung 7 campaign dựng từ performance sheet, folder panel gom theo product, và nút Preview mở creative thật. Xem `docs/research/DEMO_DATA_REVIEW.md`.
- **Budget delivery** (bản 2:03 — bản 1:48 còn `-`): `$100 per day` / `10,000 Impressions per day` / `Scheduled (4 days left)`
- Creative `home fitness 2.mp4`, **On**, `1920x1440`, `$0.03`, trạng thái `status-pending_approval` (chấm tròn 16px màu `--palette-warning-50` = `#987100`)
- Folder `Unsorted (1)`, `All campaigns (1)`

## Tính năng (đã test trực tiếp trên browser)

- Search theo tên; **Status** lọc thật (`Active, Inactive` / `Active` / `Inactive` / `Archived`); Budget đổi giá trị
- Sort mọi cột bằng caret CSS (`SortLabel`)
- Accordion `keyboard_arrow_right` xoay 90° mở/đóng bảng creatives (tooltip `Show/Hide creative details`)
- Slide-toggle On/Off cho campaign và cho từng creative
- Actions campaign: `arrow_forward` (View campaign), `assessment` (Show Analytics → `/analytics`), `content_copy` (Copy → nhân bản), `archive` (Archive/Restore)
- Actions creative: Edit / Copy / Archive (archive ẩn creative khỏi bảng)
- `Add new Creative`, `Create new Campaign` → `/campaigns/new/creative-type`
- Hết campaign khớp filter → hiện lại empty state `Get started by creating your first Campaign`
- Đếm `N items` + dropdown page size 10/25/50/100 + phân trang khi > 1 trang

## Design token trích từ CSS gốc

| Thành phần | Giá trị |
| --- | --- |
| `.page-content-grid` | `grid-template-columns: var(--sidebar-width) 1fr; gap 32`, sidebar 233px; `.main` `margin:-32px; padding:32px` |
| `.campaigns-header-container` | flex, space-between, `padding-bottom:16px` |
| `.campaigns-filters` | nền trắng, padding 16, radius 4, `margin-bottom:16`; `.campaigns-filters-grid` max-width **714**, gap 12; search + 2 select đều **230px** |
| `.campaigns-table` | viền 1px `#c4c6d0`, radius 4, `font-size:12px`, `line-height:1.5`, `overflow-x:auto; overflow-y:hidden` |
| `.campaigns-table-header` | nền `#e1e2ec`, 600, `border-radius:3px 3px 0 0`; cell cao **34px** |
| Bề rộng cột | name `0 0 250px`, status `120`, mediaType `100` (mặc định), pricing `75`, budget `200`, eCPM/eCPC `130`, winRate `110`, creationDate `110`, actions `1 0 185px` căn phải |
| `.campaigns-table-cell` (trong row) | `padding: 16px 8px 0`, `align-items: flex-start`; `.campaign-item-inner` `padding-bottom:12px` |
| `.campaign-info-wrap` | `grid-template-columns: 32px 1fr; gap 10; padding-left 10; margin-top -2px` |
| `.campaign-name` | 14px/600 lh1.5, link primary + underline |
| Hover row | lớp phủ `.campaign-item-wrap:after` `inset: 0 0 -3000px`, nền `on-main-neutral-4`, fade 0.2s (nên phủ cả phần tràn ngang) |
| `.campaigns-table-config` | `margin: 0 6px 0 16px`; `.campaigns-table-col-info` `margin-right: 6px` |
| Caret sort | `.sortable .campaigns-table-col-name:before/:after` — tam giác 4px, `right:0`, `top:11px` / `top:5px`, hiện khi `:hover` hoặc `.active` |
| `.campaign-creatives-wrapper` | `padding: 0 16px 16px 52px` |
| Bảng creatives | `tr.mat-header-row` 34px, `tr.mat-row` 52px, `th.mat-header-cell` nền `#e1e2ec` 12/600, cell 12px; cột đầu `.mat-column-filteredStatus` **48px**, bo góc trái/phải 4px ở cell đầu/cuối, `border-bottom: 1px #0000001f` |
| `.status > i.status-icon` | 16×16, `border-radius:11px`, `margin-right:10px`; `pending_approval` → nền `#987100` |
| `mat-slide-toggle` | bar 36×20 radius 30, thumb 16px, checked: bar `--themePrimButtonsBg`, thumb trắng, dịch `13px`; chữ On/Off 12px |
| `.add-creative-wrapper` | flex, `margin-top:4px`, gap 4 |
| `.budget-spent` | `font-weight: 600` |
| `.budget-status` | `padding-left:15px`; `:before` chấm tròn 8px `left:1px`, căn giữa dọc; `delivering` `#006d3e`, `paused`/`stopped` `#74777f`, `scheduled` `var(--scheduled-default-color)` |

## Điểm phải suy đoán

1. **Options của Status / Budget** giữ nguyên bản clone cũ (`Active, Inactive` / `Active` / `Inactive` / `Archived`, `All` / `Delivering` / `Scheduled` / `Paused` / `No current budget`) — dropdown vẫn đóng trong DOM.
2. **Nút `more_horiz` cạnh tiêu đề** bản gốc `disabled` → clone để mờ 0.5 và không có menu.
3. Link `View campaign` trỏ `/campaigns/edit/<id>` — đã clone ở `CAMPAIGN_SETTINGS_PAGE_CLONE.md`.
4. `--creativesTableBg-background-color` không có trong CSS đã lưu → dùng nền trắng của card.
5. `--scheduled-default-color` cũng không có trong CSS lưu → dùng `#005bc0` (xanh info của theme). `delivering`/`paused`/`stopped` thì CSS gốc ghi rõ màu nên chính xác.

## Kiểm chứng

`npm run check` pass. So text render của clone với text trích từ HTML gốc: **trùng 1:1** (kể cả thứ tự icon và các ô `-`).
Test browser: đóng/mở creatives, tắt campaign → `Off`, đổi Status sang `Active` → danh sách rỗng và hiện lại empty state, `0 items`.
