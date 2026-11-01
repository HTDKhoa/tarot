import { PageShell } from "@/components/ui/PageShell";

export const metadata = { title: "Quyền riêng tư · Ngôi Nhà Trong Rừng" };

export default function Privacy() {
  return (
    <PageShell title="Quyền riêng tư" lead="Bản nháp, cần rà soát theo quy định bảo vệ dữ liệu cá nhân của Việt Nam trước khi ra mắt.">
      <div className="prose-dark">
        <h2>Chúng tôi lưu gì</h2>
        <ul>
          <li>Tên và email từ tài khoản Google của cậu.</li>
          <li>Câu hỏi, các lá đã rút, lời giải và ghi chú trong nhật ký.</li>
          <li>Lịch sử thanh toán (mã đơn, số tiền, trạng thái). Không lưu thông tin thẻ hay tài khoản ngân hàng.</li>
        </ul>
        <h2>Dùng để làm gì</h2>
        <p>Để hiện lại nhật ký cho cậu, để Nguyệt nhớ chuyện cũ khi cậu quay lại, và để quản lý gói. Không bán dữ liệu, không dùng để quảng cáo.</p>
        <h2>Bên thứ ba</h2>
        <p>Dữ liệu được lưu trên Supabase. Khi tính năng AI được bật, câu hỏi sẽ được xử lý qua dịch vụ AI của Anthropic.</p>
        <h2>Quyền của cậu</h2>
        <p>Cậu xem và sửa ghi chú trong Nhật ký. Mỗi phiên có nút &quot;Xóa phiên này&quot;; cuối trang Nhật ký có nút &quot;Xóa toàn bộ dữ liệu của tôi&quot;, xóa hẳn mọi câu hỏi, lá bài, lời giải, ghi chú và hồ sơ.</p>
        <p>Sau khi xóa, chúng tôi chỉ giữ: lịch sử thanh toán (theo yêu cầu kế toán), gói đang dùng, thời điểm các lượt trải bài trong tháng (để tính hạn mức, không kèm câu hỏi hay lá bài) và tài khoản đăng nhập Google.</p>
      </div>
    </PageShell>
  );
}
