import { Plus_Jakarta_Sans, Rubik, Sora } from "next/font/google";

/** Hebrew marketing / landing */
export const marketingRubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-marketing-hebrew",
});

export const marketingPlusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-marketing-body-en",
});

export const marketingSora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-marketing-display-en",
});

export function marketingSiteFontClass(locale: "en" | "he") {
  if (locale === "he") {
    return `${marketingRubik.className} ${marketingRubik.variable}`;
  }
  return `${marketingPlusJakarta.className} ${marketingPlusJakarta.variable} ${marketingSora.variable}`;
}

export function homeLandingFontClass(locale: "en" | "he") {
  if (locale === "he") {
    return `${marketingRubik.className} ${marketingRubik.variable}`;
  }
  return `${marketingPlusJakarta.className} ${marketingPlusJakarta.variable}`;
}

export function marketingPublicPageClassName() {
  return `marketing-site ${marketingPlusJakarta.className} ${marketingPlusJakarta.variable} ${marketingSora.variable}`;
}
