"use client";

import Script from "next/script";
import { useRef, useState } from "react";
import { Input } from "@/components/ui";
import type { CustomerLocale } from "@/lib/customer-preferences";
import { readGoogleMapsClientConfig } from "@/lib/google-maps-config";

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: {
              fields?: string[];
              types?: string[];
              componentRestrictions?: { country: string | string[] };
            }
          ) => GoogleMapsPlacesAutocomplete;
        };
      };
    };
  }
}

interface GoogleMapsPlacesAutocomplete {
  addListener: (
    eventName: "place_changed",
    handler: () => void
  ) => { remove: () => void };
  getPlace: () => {
    formatted_address?: string;
    place_id?: string;
    geometry?: {
      location?: { lat: () => number; lng: () => number };
    };
  };
}

export type SelectedAddress = {
  text: string;
  lat: number | null;
  lng: number | null;
  placeId: string | null;
};

export function AddressAutocompleteInput({
  label,
  value,
  onValueChange,
  onSelect,
  locale,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  onSelect: (place: SelectedAddress) => void;
  locale: CustomerLocale;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<GoogleMapsPlacesAutocomplete | null>(null);
  const [mapsKey] = useState(() => readGoogleMapsClientConfig());

  function attachAutocomplete() {
    const places = window.google?.maps?.places;
    if (!places || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "geometry", "place_id"],
      componentRestrictions: { country: "il" },
    });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const text = place.formatted_address ?? inputRef.current?.value ?? "";
      onValueChange(text);
      onSelect({
        text,
        lat: place.geometry?.location?.lat() ?? null,
        lng: place.geometry?.location?.lng() ?? null,
        placeId: place.place_id ?? null,
      });
    });
    autocompleteRef.current = autocomplete;
  }

  return (
    <>
      {mapsKey ? (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
            mapsKey.apiKey
          )}&libraries=places&loading=async`}
          strategy="afterInteractive"
          onLoad={attachAutocomplete}
        />
      ) : null}
      <Input
        ref={inputRef}
        label={label}
        labelClassName="text-center"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="text-center"
        dir={locale === "he" ? "rtl" : "ltr"}
        autoComplete="off"
      />
    </>
  );
}
