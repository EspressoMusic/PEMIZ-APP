const PRODUCT_ADDED_SOUND = "/sounds/product-added.mp3";
const ORDER_COMPLETED_SOUND = "/sounds/order-completed.mp3";

let productAddedAudio: HTMLAudioElement | null = null;
let orderCompletedAudio: HTMLAudioElement | null = null;

/** Pop sound when a product is added to the cart. */
export function playProductAddedSound() {
  if (typeof window === "undefined") return;
  try {
    if (!productAddedAudio) {
      productAddedAudio = new Audio(PRODUCT_ADDED_SOUND);
      productAddedAudio.volume = 0.85;
    }
    productAddedAudio.currentTime = 0;
    void productAddedAudio.play().catch(() => {});
  } catch {
    /* ignore unsupported audio */
  }
}

/** Chime when an order completes successfully. */
export function playOrderCompletedSound() {
  if (typeof window === "undefined") return;
  try {
    if (!orderCompletedAudio) {
      orderCompletedAudio = new Audio(ORDER_COMPLETED_SOUND);
      orderCompletedAudio.volume = 0.85;
    }
    orderCompletedAudio.currentTime = 0;
    void orderCompletedAudio.play().catch(() => {});
  } catch {
    /* ignore unsupported audio */
  }
}

/** UI sounds disabled for performance and quieter UX. */
export function playUiPopupSound() {}
