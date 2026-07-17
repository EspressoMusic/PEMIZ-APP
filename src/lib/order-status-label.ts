/** Customer-facing order status copy — shared between the server (API responses) and the client (local order history). */
export function customerOrderStatusLabel(
  status: string | undefined,
  locale: "he" | "en"
): string {
  const isHe = locale !== "en";
  switch (status) {
    case "CONFIRMED":
      return isHe ? "אושר" : "Confirmed";
    case "COMPLETED":
      return isHe ? "הושלם" : "Completed";
    case "CANCELLED":
      return isHe ? "בוטל" : "Cancelled";
    case "REJECTED":
      return isHe ? "נדחתה" : "Declined";
    default:
      return isHe ? "ממתין לאישור" : "Pending";
  }
}

/** Text colour for a customer-facing status: settled-good green, settled-bad red, still-waiting neutral. */
export function customerOrderStatusToneClass(status: string | undefined): string {
  switch (status) {
    case "CONFIRMED":
    case "COMPLETED":
      return "text-bakery-success";
    case "CANCELLED":
    case "REJECTED":
      return "text-bakery-error";
    default:
      return "text-bakery-ink";
  }
}
