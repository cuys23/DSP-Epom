# Dữ liệu campaign — nguồn, cách dựng & review

Tài khoản gốc chỉ có **1 campaign chưa chạy** (`weigh loss`) nên mọi chỉ số đều bằng 0, không đánh giá được UI. Nay bản clone được đổ **7 campaign có traffic thật**, dựng từ file performance sheet và creative lấy từ Drive.

> **Không còn `?demo=1`.** Dữ liệu campaign là mặc định ở mọi trang. Campaign `weigh loss` vẫn giữ nguyên trạng thái 0/`Scheduled` như bản gốc.

## Nguồn dữ liệu

| Nguồn | Dùng để làm gì |
| --- | --- |
| [Google Sheet](https://docs.google.com/spreadsheets/d/1BLQ5MfxCBshSl0WcAM1F6NY_x6_U1Ae6vZ8NseiCTH0) — 7 tab offer | Danh sách campaign + **clicks** và **conversions** theo ngày |
| [Google Drive](https://drive.google.com/drive/folders/11C5uf9EeawNMNCd1Jx9FShvdSJR8KCrF) — **chỉ** 2 thư mục `Home Fitness For Weight Loss` và `Weight Loss Walking by Skimlit` | Creative (video mp4 + ảnh jpg) |

Các thư mục Drive khác (`LandingPage`, `LandingPage_Home_Weightloss_v2`, `Image 4_3`, `VeePN VPN`) **không đụng tới**, đúng yêu cầu.

## Pipeline

| File | Vai trò |
| --- | --- |
| `scripts/fetch-creatives.mjs` | Tải creative về `public/creatives/<product>/`. `npm run fetch:creatives` |
| `scripts/build-campaigns.mjs` | Đọc sheet → sinh `src/lib/campaigns.ts`. `npm run build:campaigns` |
| `src/lib/campaigns.ts` | **File sinh tự động** — roster 7 campaign + `days: [date, clicks, conversions]` |
| `src/lib/demo-data.ts` | Suy ra phần còn lại của phễu + 26 formatter (`CELL`) + 26 series (`SERIES`) |
| `src/lib/campaign-stats.ts` | Roll-up dùng chung: flight status, budget cap, số liệu tuần báo cáo |
| `src/lib/audiences.ts` | Roster audience, sinh từ `product` của campaign — nguồn của cột **Linked Campaigns** và filter Audience |
| `src/lib/funnel.ts` | Chia phễu RTB thành các stage cho `/traffic-funnel` — không sinh số mới |
| `src/lib/transactions.ts` | Sổ cái billing: debit = spend thật theo ngày, credit = deposit đủ để trả |
| `scripts/check-demo-data.mjs` | Kiểm tra ràng buộc. `npm run check:demo` |

Cả hai script đều đọc Drive/Sheet qua link public, không cần API key.

## Ánh xạ offer → campaign

Gom theo `OffIDNet` (id offer phía network — ổn định kể cả khi tên offer bị đổi tag giữa chừng). Tên campaign = `<tên offer đã bỏ tag> — <network>`.

| Campaign | OffIDNet | Flight | Ngày | Clicks | Conv | Creative pool |
| --- | --- | --- | --- | --- | --- | --- |
| Home Fitness for Weight Loss — RevoluteTech | 113067 | 08.05 → 30.06 | 53 | 1,423 | 125 | Home Fitness |
| Home Fitness for Weight Loss — Adeo_Affise | 129 | 01.04 → 28.04 | 26 | 376 | 0 | Home Fitness |
| Weight Loss Walking by Slimkit — RevoluteTech | 112890 | 05.05 → 21.06 | 46 | 2,675 | 171 | Slimkit Walking |
| Slimkit Weight Loss — OmegAds | 28255 | 05.05 → 09.06 | 27 | 2,914 | 0 | Slimkit Walking |
| 240 Weight Loss (FRT) — Adeo_Affise | 240 | 08.04 → 23.06 | 67 | 6,247 | 694 | Slimkit Walking |
| 241 Weight Loss (PKL) — Adeo_Affise | 241 | 08.04 → 23.06 | 67 | 3,612 | 594 | Slimkit Walking |
| WeightLoss — Adeo_Affise | 8 | 01.04 → 20.04 | 20 | 1,185 | 67 | Slimkit Walking |

## Số nào thật, số nào suy ra

**Thật (lấy nguyên từ sheet):**
- `clicks` ← cột `Total Lead`
- `conversions` ← cột `Event` — đúng yêu cầu "events sẽ là conversions"

**Suy ra** (deterministic theo `campaignId + date`, cùng ngày luôn ra cùng số):

```
impressions  = clicks / CTR        (CTR 0.22%–0.45%)
wins         = impressions / 0.90–0.98
bidResponses = wins / 0.07–0.14
bidRequests  = bidResponses / 0.58–0.76
spend        = impressions/1000 × eCPM campaign × 0.85–1.25
revenue      = conversions × payout CPA của campaign ($18–32)
```

Lấy **click làm mốc rồi suy ngược lên** nên phễu không bao giờ lộn ngược. **Chỉ lưu counter, không lưu tỉ lệ** — mọi %/eCPM/eCPC/CPA/ROAS/ROI đều tính lại từ counter, nhờ vậy hàng **Total** đúng (counter thì cộng, tỉ lệ thì tính lại chứ không cộng phần trăm).

Budget cap (`$X per day`, `N Impressions per day`) làm tròn lên từ ngày cao nhất của chính campaign đó, nên **spend không bao giờ vượt limit đang hiển thị**.

## Kết quả (toàn bộ flight)

| Campaign | Impressions | Clicks | CTR | Spend | eCPM | Conv | CPA | ROAS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Weight Loss Walking by Slimkit | 854,518 | 2,675 | 0.31% | $1,674 | $1.96 | 171 | $9.79 | 2.18 |
| Home Fitness — RevoluteTech | 416,436 | 1,423 | 0.34% | $1,479 | $3.55 | 125 | $11.83 | 2.54 |
| Home Fitness — Adeo_Affise | 124,076 | 376 | 0.30% | $381 | $3.07 | 0 | - | 0.00 |
| 240 Weight Loss (FRT) | 1,900,566 | 6,247 | 0.33% | $3,667 | $1.93 | 694 | $5.28 | 4.49 |
| 241 Weight Loss (PKL) | 1,103,418 | 3,612 | 0.33% | $2,987 | $2.71 | 594 | $5.03 | 3.59 |
| Slimkit Weight Loss — OmegAds | 846,923 | 2,914 | 0.34% | $2,161 | $2.55 | 0 | - | 0.00 |
| WeightLoss — Adeo_Affise | 355,234 | 1,185 | 0.33% | $985 | $2.77 | 67 | $14.71 | 1.81 |

Quy mô: **$440–$2,400 chi tiêu/tháng mỗi campaign**, đỉnh ~89k impression và $182/ngày. Đủ để UI có số đẹp mà không "phồng" đến mức trông giả.

## 3 vấn đề của dữ liệu gốc và cách xử lý

1. **`Total Lead` trống nhưng `Event` vẫn có** (40 ngày, cuối flight của offer 112890/240/241). Lấy nguyên số 0 sẽ khiến `conversions > clicks` → lộn phễu. Đã **back-fill clicks** từ chính conversion rate của campaign đó trên những ngày có đủ 2 cột. **Số conversion không bị đụng vào.**
2. **`defaultPrice` không phải eCPM.** Ban đầu lấy `defaultPrice × 1000` làm eCPM → ra $18–45 CPM, spend vọt lên $502/ngày. Đã tách riêng: `defaultPrice` chỉ là **trần bid/impression** để hiển thị (giữ đúng format `0.025$` của bản gốc), còn giá clear thực tế là `ecpm` riêng ($1.80–3.40).
3. **Tab bị lặp.** Offer 240/241 xuất hiện ở cả tab thường lẫn tab ROI. Chỉ đọc 1 nguồn cho mỗi offer để không cộng đôi; tab `486224779` chỉ dùng cho 2 offer CLICKDIRRECT mà nơi khác không có.

## Ràng buộc đang kiểm (`npm run check:demo` — 7 campaign, 306 ngày)

- `clicks` và `conversions` **khớp đúng sheet** (không bị biến dạng khi qua pipeline)
- Phễu không bao giờ ngược: `responses ≤ requests`, `wins ≤ responses`, `impressions ≤ wins`, `clicks ≤ impressions`, `conversions ≤ clicks`
- `spend > 0`, `spend ≤ $250/ngày`, `impressions ≤ 120k/ngày` — chặn trường hợp suy diễn phình số
- CTR mỗi ngày trong khoảng 0.15%–0.6%
- Video quartile giảm dần: `Q1 ≥ Mid ≥ Q3 ≥ Video 100%`, và `Q1 ≤ impressions`
- Campaign có conversion → ROAS cả flight > 1; campaign không có conversion → ROAS = `0.00` (không giả vờ có doanh thu)
- Cùng campaign + cùng ngày → cùng số (deterministic)
- Tổng toàn tài khoản = tổng các campaign (không sinh series riêng cho account)
- Hàng Total: counter = tổng; `CTR` Total tính lại từ `clicks/impressions`, **khác** tổng CTR từng dòng
- 26 cột đều có formatter và series; mọi series ra số hữu hạn
- Ngày ngoài flight vẫn render đúng trạng thái rỗng: `Bid Rate = 0.00%`, `ROAS = -`, `CPA = -`, `Imp-to-Bid = 0`

## Creative

`fetch-creatives.mjs` duyệt 2 thư mục Drive, lấy **1 file cho mỗi tỉ lệ khung hình** (`1_1`, `3_4`, `4_3`, `9_16`) + vài ảnh nữa. Video gốc nặng 5–25MB nên script **HEAD trước để đo size** và chọn file nhỏ nhất còn dưới **10MB** cho mỗi tỉ lệ — repo còn ~50MB thay vì 166MB.

Kích thước creative (`1080x1920`, `1920x1440`…) **đo trực tiếp từ file** (JPEG SOF marker / MP4 `tkhd` box), không đoán theo tên thư mục. Nút 👁 Preview mở modal phát video / xem ảnh thật.

## Trang bị ảnh hưởng

| Trang | Thay đổi |
| --- | --- |
| `/campaigns` | 8 campaign (7 mới + `weigh loss`), folder panel gom theo product, preview creative |
| `/campaigns/edit/[id]` | Đọc campaign theo id thay vì hardcode; nhiều creative; chart theo campaign |
| `/analytics` | Mặc định mở tuần báo cáo hiện tại; `?cid=` lọc theo campaign |
| `/dashboard` | Bỏ empty state "You don't have campaigns yet", thay bằng chart + tổng hợp tuần |
| `/billing` | 94 giao dịch dựng từ spend thật; balance `$664.49` hiển thị luôn ở top bar |
| `/traffic-funnel` | Có báo cáo phễu thật thay cho `No Data`; filter Campaign/Audience/Creative lấy từ roster |
| `/audience` | 3 audience (2 sinh từ product + `Test` gốc), cột Linked Campaigns có dữ liệu |

## Còn tồn đọng

- **2/7 campaign có `conversions = 0`** (offer 129 và 28255) vì sheet không track event cho 2 offer đó. ROAS hiển thị `0.00`, CPA hiển thị `-`. Đây là phản ánh trung thực nguồn dữ liệu, không phải bug.
- **`Pixalate Postbid Markup` luôn 0** — đúng bản gốc, tài khoản chưa bật Pixalate.
- **Format `Imp-to-Bid` / `Click-to-Bid`** vẫn là suy đoán: bản gốc ở trạng thái 0 in ra `0` (không có `%`), nên clone in số 2 chữ số thập phân không kèm `%`. Nếu bản gốc thực ra là dạng `1:N` thì phải sửa formatter.
- **Traffic Funnel**: tỉ lệ rơi giữa các stage targeting là **phần duy nhất được bịa** (`TARGETING_STAGES` trong `funnel.ts`). Tổng của chúng bị ép bằng đúng `bidRequests - bidResponses`, nên đầu và cuối phễu vẫn khớp Analytics tuyệt đối. Sheet không có breakdown theo lý do reject nên không thể lấy số thật.
- **Billing**: lịch top-up (mốc nạp, mệnh giá, phương thức) là bịa; **debit thì không** — bằng đúng spend từng ngày. Vì thế `deposits − spend = balance` và balance chưa bao giờ âm (`check:demo` assert cả 3).
- **Toast "Balance is too low to bid"** giờ gắn với `BALANCE_TOO_LOW` (balance < $100). Bản gốc chụp lúc balance = $0 nên trang nào cũng có toast; clone có $664.49 nên toast tắt.
