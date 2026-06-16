"use client";

import { useEffect, useState } from "react";
import { isNativeCapacitorApp } from "@/lib/native-app";

export function useNativeApp(): boolean {
  const [native, setNative] = useState(false);
  useEffect(() => {
    setNative(isNativeCapacitorApp());
  }, []);
  return native;
}
