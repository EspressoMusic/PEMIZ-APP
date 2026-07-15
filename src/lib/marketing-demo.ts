/** Email that receives demo / training requests from the marketing site. */
export function demoNotifyEmail(): string | null {
  return (
    process.env.MARKETING_DEMO_NOTIFY_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.PLATFORM_SUPPORT_CONTACT?.trim() ||
    null
  );
}
