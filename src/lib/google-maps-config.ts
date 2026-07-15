export type GoogleMapsClientConfig = {
  apiKey: string;
};

export function readGoogleMapsClientConfig(): GoogleMapsClientConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) return null;
  return { apiKey };
}

export function isGoogleMapsConfigured(): boolean {
  return readGoogleMapsClientConfig() !== null;
}
