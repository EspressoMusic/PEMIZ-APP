import { Heebo, Inter, Outfit } from "next/font/google";

/** Hebrew marketing / landing — bold geometric (matches Heebo בולד preview) */
export const marketingHeebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-marketing-hebrew",
});

export const marketingInter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-marketing-body-en",
});

export const marketingOutfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-marketing-display-en",
});

export function marketingSiteFontClass(locale: "en" | "he") {
  if (locale === "he") {
    return `${marketingHeebo.className} ${marketingHeebo.variable}`;
  }
  return `${marketingInter.className} ${marketingOutfit.variable}`;
}

export function homeLandingFontClass(locale: "en" | "he") {
  if (locale === "he") {
    return `${marketingHeebo.className} ${marketingHeebo.variable}`;
  }
  return `${marketingInter.className} ${marketingInter.variable}`;
}
