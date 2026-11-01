import { PageShell } from "@/components/ui/PageShell";

export const metadata = { title: "Điều khoản · Ngôi Nhà Trong Rừng" };

export default function Terms() {
  return (
    <PageShell title="Điều khoản sử dụng" lead="Bản nháp, cần rà soát pháp lý trước khi ra mắt.">
      <div className="prose-dark">
        <h2>Mục đích</h2>
        <p>Ngôi Nhà Trong Rừng là sản phẩm giải trí và tự chiêm nghiệm. Các lời giải bài không phải lời tiên tri, không phải lời khuyên y tế, pháp lý, tài chính hay tâm lý chuyên môn.</p>
        <h2>Nhân vật và lá bài</h2>
        <p>Nguyệt là một nhân vật hư cấu. Lá bài được rút ngẫu nhiên bằng bộ sinh số ngẫu nhiên mật mã trên máy chủ.</p>
        <h2>Độ tuổi</h2>
        <p>Dịch vụ dành cho người từ 18 tuổi trở lên.</p>
        <h2>Gói trả phí</h2>
        <ul>
          <li>Gói tháng 69.000đ (30 ngày) và gói năm 399.000đ (365 ngày), thanh toán một lần qua VietQR, không tự gia hạn.</li>
          <li>Mỗi gói có hạn mức 30 lần trải bài mỗi tháng. Lá bài của ngày không giới hạn.</li>
        </ul>
        <h2>Khi cậu cần giúp đỡ</h2>
        <p>Nếu cậu đang gặp nguy hiểm hoặc có ý định tự làm hại bản thân, hãy gọi 115 hoặc tới cơ sở y tế gần nhất, và liên hệ một người cậu tin tưởng.</p>
      </div>
    </PageShell>
  );
}
