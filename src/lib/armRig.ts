/**
 * Vị trí hai khuỷu tay Nguyệt trên màn (px CSS) và cỡ một pixel khung (frame) ở mặt bàn, do CameraRig chiếu
 * từ cảnh 3D mỗi khung khi đang ở góc mặt bàn. Lớp DOM (TableView) đọc để vẽ cánh tay vươn đúng từ người nàng,
 * cùng thang với cơ thể nàng, tới lá đang chỉ. Không phải state React: đọc trong vòng rAF, không gây render lại.
 */
export const armRig = {
  ready: false,
  /** px CSS cho một pixel khung ở mặt bàn */
  px: 1,
  left: { x: 0, y: 0 },
  right: { x: 0, y: 0 },
};
