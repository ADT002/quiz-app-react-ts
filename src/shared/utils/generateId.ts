/**
 * Sinh ID 24-ký-tự-hex (định dạng MongoDB ObjectId) ở client.
 * Dùng cho option/order_item/match/fill khi user thêm mới — backend đã chấp nhận format này.
 */
export function generateObjectId(): string {
  const timeHex = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const randHex = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
  return timeHex + randHex;
}
