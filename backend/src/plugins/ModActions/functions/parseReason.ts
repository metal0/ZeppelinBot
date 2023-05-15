export function parseReason(config: any, reason: string): string {
  if (!reason) return reason;
  if (config?.reason_aliases) {
    reason = config.reason_aliases![reason.toLowerCase()] ?? reason;
  }

  return reason;
}
