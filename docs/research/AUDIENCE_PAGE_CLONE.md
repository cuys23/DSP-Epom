# Clone trang Audience (Epom DSP)

Nguồn: 2 file HTML lưu từ `dsp.epom.market`

- `Audience ｜ Epom Market (7_28_2026 10：57：59 AM).html` — trang danh sách Audience
- `Audience ｜ Test ｜ Epom Market (7_28_2026 11：07：40 AM).html` — trang edit 1 Audience

---

## 1. Đã hoàn thành: trang danh sách `/audience`

### Files

| File | Vai trò |
| --- | --- |
| `src/app/audience/page.tsx` | Route + `metadata.title = "Audience \| Epom Market"` |
| `src/components/AudienceListView.tsx` | Toàn bộ UI + logic (client component) |
| `src/components/CampaignFilters.tsx` | Sửa: export `FilterSelect`, thêm prop `className`, `onPick(option)` — tái dùng dropdown thay vì viết mới |

Tái dùng sẵn có: `AppShell` (sidebar + topbar + breadcrumb), `MaterialIcon`, `cn()`.
Sidebar đã có sẵn mục `Audience → /audience` trong `src/lib/nav-data.ts` nên không phải sửa nav.

### Tính năng (đã test trực tiếp trên browser)

- Search theo tên (lọc live, reset về trang 1)
- Filter `Status:` — `Active` / `Archived`
- Sort cột **Name** và **Created** (đúng 2 cột live gắn class `.sort`), toggle asc/desc, mặc định chưa sort nên không hiện mũi tên
- Row actions: **Edit** (→ `/audience/edit/<id>`), **Clone** (nhân bản row, tên `... (copy)`, ngày hôm nay), **Archive/Restore** (đổi status + cập nhật cột Edited)
- **Create new Audience** → thêm row mới
- Bộ đếm `N item(s)`, dropdown page size 10/25/50/100, thanh phân trang chỉ hiện khi > 1 trang
- Empty state `No available data to show.`
- Tooltip Edit / Clone / Archive, hover row đổi nền `#fafafa`

### Design token trích từ CSS gốc

| Thành phần | Giá trị |
| --- | --- |
| `thead th` | bg `#e1e2ec`, 12px/600, line-height 18, padding `8px 16px`, `vertical-align: middle`, nowrap |
| `tbody td` | 12px/400, line-height 18, padding 16, `max-width: 600px`, break-words |
| Row hover | `#fafafa` |
| Khung bảng | border 1px `#c4c6d0` (`--neutral-outline-variant-color`), radius 3px, nền trắng |
| Link trong bảng | primary + underline + font-weight 600, line-height 18 |
| Status | flex + icon `circle` 10px, mr-4px; Active = `#006d3e` (`--success-default-color`) |
| Actions | `ul` flex, height 18, justify-end, `li:not(:first-child) { margin-left: 12px }`, nút tròn 32px |
| Filters card | padding 16, radius 4, nền trắng, `gap: 12px`, search `min-width 200 / max-width 324` |
| Paginator | `margin-top: 16px; padding-right: 16px`, chữ 12px `#74777f`, nút page-size cao 36 viền primary |

### Điểm phải suy đoán (HTML không chứa)

1. **Options của dropdown Status** — dropdown đang đóng lúc save trang → dùng `Active` / `Archived` (khớp với action Archive).
2. **Hành vi nút Create** — live app điều hướng sang trang create mà chưa có HTML → tạm thêm row tại chỗ.
3. Link Edit trỏ `/audience/edit/<id>` sẽ 404 cho tới khi clone xong trang edit.

### Kiểm chứng

`npm run lint`, `npm run typecheck`, `npm run build` đều pass (`/audience` prerender static).
Đã chạy thử trên `localhost:3001`: clone 2 lần, sort Name, archive, đổi filter sang Archived, search rỗng kết quả, mở dropdown page size — tất cả hoạt động đúng.

---

## 2. Đã hoàn thành: trang edit `/audience/edit/[id]`

### Files

| File | Vai trò |
| --- | --- |
| `src/app/audience/edit/[id]/page.tsx` | Route + `metadata.title = "Audience \| Test \| Epom Market"` |
| `src/components/AudienceEditView.tsx` | Toàn bộ form + modal chọn + summary rail (client component) |
| `src/app/globals.css` | Thêm token `--color-epom-error: #ba1a1a` cho trạng thái Exclude |
| `public/images/{macos,ios,safari}.png`, `chrome.svg` | Icon summary tách từ base64 trong HTML (đã resize 32px) |

### Tính năng (đã test trực tiếp trên browser)

- Sửa tên audience tại chỗ (icon `edit`) — breadcrumb cập nhật theo
- **Operation System / Browser** mở modal 3 cột **Target / Condition / Version** đúng như bản gốc: checkbox-button có icon, dropdown điều kiện (`=> this or newer` / `<= this or older` / `= exactly this`) và ô Version chỉ bật khi target được chọn; footer `Cancel` (viền xám) + `OK`
- 12 nút `Select ...` còn lại mở modal danh sách: search, checkbox, Escape để đóng, empty state `No available data to show.`; số đếm trên nút đổi theo lựa chọn (`(Any)` hoặc `(0)` khi rỗng, đúng như bản gốc)
- Toggle **Include / Exclude** cho Operation System, Browser, App Store Categories (xanh/đỏ)
- Radio Traffic Type, checkbox Device Type (grid 4 cột), checkbox Connection Type (`Any` loại trừ các giá trị còn lại)
- 2 accordion **Retargeting** / **Advanced settings** mở-đóng được, icon `arrow_right` ↔ `arrow_drop_down`
- **Summary rail** dựng động từ state: chỉ hiện mục có giá trị, kèm nhãn `Included`/`Excluded` và icon OS/browser — trạng thái mặc định khớp 1:1 bản gốc
- Footer: `Cancel` / `Save & Exit` quay về `/audience`, `Save` hiện toast `Audience has been saved.`

### Design token trích từ CSS gốc

| Thành phần | Giá trị |
| --- | --- |
| `.page-block` | radius 4, padding 24, nền trắng; `.content-block` max-width 720 |
| `.button` | 14px/600, padding `7.5px 16px`, radius 4, min-width 96; `.button-outlined` viền + chữ primary, padding `6.5px 15px`; `.button-fw` width 100% max 720 |
| `.audience-name-header` | h 36, gap 8, 20px/700, lh 24, ellipsis |
| `.headline-3 / .headline-4` | 16/700 lh24 / 14/700 lh21, `margin-bottom 16` |
| `.audience-block-header` | 14/700 lh21 | 
| `.control-label` | 12/600 lh18, màu `#74777f`, flex gap 4 (có icon hint) |
| `.device-type-checkboxes` | `grid-template-columns: repeat(4, 1fr)`, gap 8 |
| `.checkbox-button` | h 36, radius 4, viền `#c4c6d0`, padding `0 12px`; checked: viền primary + nền primary-8 |
| `.switchers-group` radio | h 36, padding `7px 12px 8px 36px`, ô radio 16px cách trái 9px; `switchers-group-fw` flex gap 12, mỗi ô `flex: 1` |
| `.include-exclude-section` | w 202, h 36, outline 1px `#c4c6d0`; active: outline + chữ theo `success`/`error`, nền 12% |
| `.block-toggle-big` | 16/700 lh24, icon `20px` cách phải 8 |
| `.page-footer` | flex, justify-end, gap 16, margin-top 16 |
| `.audience-summary-*` | title 16/700, subtitle 14/600, block-title 12/600, description 12/400 muted; block padding 24, `+ block` có `border-top #e1e2ec`; icon 16×16 `object-fit: contain`; `.included/.excluded:before` chấm tròn 10px |

### Điểm phải suy đoán (HTML không chứa)

1. **Nội dung các modal chọn** — live app nạp qua API, HTML lưu không có → dùng danh sách thực tế hợp lý (browser, quốc gia, IAB categories, carrier, ISP, proxy type…). Riêng *Custom Locations* và *Retargeting Lists* để rỗng vì tài khoản chưa tạo. Danh sách OS (`Windows / Linux / macOS / Android / iOS`) và bố cục modal OS lấy từ ảnh chụp màn hình bản gốc user gửi; modal các trường khác chưa có ảnh nên dùng dạng danh sách + search.
   Icon Windows / Linux / Android là SVG tự vẽ (không có trong HTML lưu); macOS, iOS, Chrome, Safari là ảnh thật tách từ base64.
2. **Nội dung 2 accordion** — cả hai đang đóng lúc save trang; dựng lại từ chính summary rail: Retargeting → chọn list; Advanced settings → `Stores` + `App Store Categories` (Include/Exclude).
3. **`--error-default-color`** không có trong CSS đã lưu → dùng `#ba1a1a` (Material 3 error, khớp tông theme).
4. **Save không gọi API** — chỉ hiện toast; state không lưu qua reload.
5. Trang luôn render audience tên `Test` (dữ liệu thật duy nhất) bất kể `id` trên URL, vì list chỉ sống trong state client.

### Kiểm chứng

`npm run check` (lint + typecheck + build) pass. Test trên `localhost:3001`: đổi tên, mở modal Taxonomies chọn 2 mục → nút thành `(2)` và rail thêm block *Content Categories*, mở accordion Advanced settings, bấm Exclude → rail đổi sang `Excluded` đỏ, bấm Save → toast hiện.

---

## Phụ lục: cấu trúc trang edit trích từ HTML gốc

- Breadcrumb: `home / Audience / Test`
- **Header tên audience**: `Test` + icon `edit` (tooltip "Edit Title")
- **Third-party Segments** (`.page-block > .content-block`): tiêu đề + đoạn mô tả Lotame DMP + nút outlined `Select Targeting Segments (0)`
- **Targeting** (`h3.headline-3`):
  - *Geo* — 2 cột: `Select Geo Position (Any)`, `Custom Locations` (có icon hint) + `Select Custom Location (Any)`
  - *Traffic environment* — radio group `Any` / `Websites` / `Mobile Apps` (label "Traffic Type", `Any` đang chọn)
  - *Device* — checkbox group `Desktop / Mobile / Tablet / Connected TV / Connected Device / Set Top Box`; `Operation System` và `Browser` mỗi cái có toggle **Include|Exclude** (Include active) + nút `Select Operation Systems (2)` / `Select Browsers (2)`; `Language` (icon hint) + `Select Language (Any)`; *Date and time* + `Select Day and Time Schedule (Any)`
  - *Connection* (`h4.headline-4`) — checkbox `Any / Ethernet / WIFI / Carrier`; 2 cột `Carrier` → `Select Carrier (0)`, `Proxy type` → `Proxy type (0)`; 1 cột `ISP` → `Select ISP (0)`
  - *Content Categories* — `Select Taxonomies (0)`
- **Retargeting** — accordion đóng (`arrow_right` + help icon)
- **Advanced settings** — accordion đóng
- **Page footer**: `Cancel` (outlined), `Save`, `Save & Exit` (primary)
- **Summary rail** bên phải:
  - `Targeting options` → `Device` → `Operation System:` *Included* → macOS, iOS (kèm icon PNG base64) → `Browser:` *Included* → Chrome, Safari
  - `Advanced settings` → `Stores` → `Stores: App Store` → `App Store Categories:` *Included* → Health & Fitness

### Ghi chú

- Rail bên phải không tái dùng `CampaignSummaryRail.tsx` được (type `SummarySection` không đỡ list có icon + nhãn Included/Excluded) → viết `SummaryRail` cục bộ trong `AudienceEditView.tsx`, cùng khung fixed 270px / `top-[57px]` / đường chia `#e1e2ec`.
- Icon OS/browser tách từ base64 trong HTML; `safari.png` gốc 452 KB (1024²) đã resize còn 32px/2.5 KB.
- File làm việc tạm (CSS + markup đã prettify) nằm trong scratchpad của session, không commit.
