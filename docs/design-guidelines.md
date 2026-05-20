# Design Guidelines (Dino Cloud FE)

> Mục tiêu: thống nhất UI/UX cho Dino Cloud FE và tăng tốc làm màn mới.

## 1) Reference library

- Thư viện tham khảo UI đã được đưa vào: `docs/design-md/`
- Nguồn: https://github.com/VoltAgent/awesome-design-md

**Quy tắc dùng reference**
- Mỗi feature/màn hình mới: chọn tối đa 2 reference (brand/page) trong `docs/design-md/`.
- Ghi lại ở task/PR: link file reference + screenshot/đoạn áp dụng.
- Không copy nguyên xi; chỉ lấy pattern (layout, spacing, hierarchy, components).

## 2) UI Principles

- Rõ ràng: ưu tiên hierarchy (title/subtitle/body), khoảng trắng, và CTA.
- Nhất quán: cùng một loại component phải có cùng states (default/hover/active/disabled/loading).
- Truy cập: focus-visible rõ, contrast đủ, label cho form.

## 3) Component checklist (mỗi component)

- Props rõ ràng (variant/size/state)
- Disabled + Loading state
- Empty + Error states (nếu có data)
- Keyboard navigation (Tab/Enter/Esc) khi phù hợp

## 4) Screen checklist (mỗi màn hình)

- Trạng thái: Loading / Empty / Error
- Responsive: tối thiểu 2 breakpoint (mobile + desktop)
- Copywriting: tiêu đề/CTA rõ hành động

## 5) Nơi bổ sung sau

Khi bạn sẵn sàng, mình có thể tạo thêm:
- `docs/ui/` (tokens: colors/typography/spacing)
- `docs/components/` (spec theo component)
