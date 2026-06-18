export function isPlatformOwnerMessageUnread(
  message: string | null | undefined,
  messageAt: Date | string | null | undefined,
  readAt: Date | string | null | undefined
): boolean {
  if (!message?.trim() || !messageAt) return false;
  if (!readAt) return true;
  return new Date(messageAt).getTime() > new Date(readAt).getTime();
}
