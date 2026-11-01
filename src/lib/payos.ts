import "server-only";
import { PayOS } from "@payos/node";

export const isPayOSConfigured = () =>
  Boolean(process.env.PAYOS_CLIENT_ID && process.env.PAYOS_API_KEY && process.env.PAYOS_CHECKSUM_KEY);

let client: PayOS | null = null;
export function payos() {
  if (!isPayOSConfigured()) throw new Error("Chưa cấu hình payOS");
  client ??= new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
  });
  return client;
}

/** Mã đơn duy nhất dạng số (payOS yêu cầu số nguyên dương). */
export function newOrderCode() {
  const rand = new Uint16Array(1);
  crypto.getRandomValues(rand);
  return Math.floor(Date.now() / 1000) * 1000 + (rand[0] % 1000);
}
