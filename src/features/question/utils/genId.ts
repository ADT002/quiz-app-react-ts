/**
 * Generate a 24-hex string for new option/blank/item IDs created client-side.
 * Server may overwrite via ensureItemIDs, but having a stable client ID lets
 * React render keys remain consistent during edit.
 */
export function genId(): string {
  let s = '';
  const chars = '0123456789abcdef';
  for (let i = 0; i < 24; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}
