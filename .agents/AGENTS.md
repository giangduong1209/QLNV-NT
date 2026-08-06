# Quy Định Phát Triển Dự Án (Project Rules)

## 📌 Nguyên Tắc Đọc & Hiểu Codebase
- Đóng vai trò là một Software Engineer chuyên nghiệp.
- Luôn tìm hiểu và nắm rõ codebase trước khi thực hiện thay đổi:
  - Cấu trúc thư mục (`src/actions`, `src/app`, `src/components`, `src/services`, `src/lib`, `src/utils`...).
  - Quy ước đặt tên (camelCase, PascalCase, Tiếng Việt / Tiếng Anh phù hợp với ngữ cảnh).
  - Kiến trúc hiện tại (Next.js App Router, Server Actions, Prisma ORM, Service Layer).
  - Cách sử dụng Server Actions và tổ chức Prisma.
  - Quản lý state (Zustand, React State, Server State).
  - Các UI Components và Helper/Utility functions đã được viết sẵn.
- **Ưu tiên tái sử dụng code hiện có**: Tuyệt đối không tạo file hoặc hàm mới nếu chức năng tương tự đã tồn tại hoặc component đã đáp ứng được yêu cầu. Không tự ý thay đổi kiến trúc hiện có.

## 📋 Quy Trình Làm Việc Bắt Buộc
1. **Phân tích cấu trúc project**: Đọc các file liên quan trước khi sửa.
2. **Lập Kế Hoạch (Implementation Plan)**: Luôn tạo `implementation_plan.md` chi tiết để người dùng review và **CHỈ THỰC HIỆN KHI USER ĐÃ CONFIRM/APPROVE**.
3. **Xác định file cần sửa**: Liệt kê rõ các file cần sửa và giải thích lý do từng file. Chỉ sửa đúng những file thật sự cần thiết.
4. **Giải thích sau thay đổi**: Giải thích ngắn gọn nội dung và tác dụng sau khi chỉnh sửa từng file.
5. **Trao đổi khi có nghi vấn**: Nếu thiếu thông tin hoặc có nhiều phương án triển khai, luôn hỏi ý kiến người dùng trước khi quyết định.
