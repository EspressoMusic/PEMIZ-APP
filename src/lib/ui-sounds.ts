const UI_POPUP_SOUND = "/sounds/ui-popup.mp3";
const PRODUCT_ADDED_SOUND = "/sounds/product-added.wav";

let uiPopupAudio: HTMLAudioElement | null = null;
let productAddedAudio: HTMLAudioElement | null = null;

/** Pop sound — new seller message & new-deal confirm step only */
export function playUiPopupSound() {
  if (typeof window === "undefined") return;
  try {
    if (!uiPopupAudio) {
      uiPopupAudio = new Audio(UI_POPUP_SOUND);
      uiPopupAudio.volume = 0.8;
    }
    uiPopupAudio.currentTime = 0;
    void uiPopupAudio.play().catch(() => {});
  } catch {
    /* ignore unsupported audio */
  }
}

/** Click tone when a product is added */
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
