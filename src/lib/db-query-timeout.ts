const DEFAULT_MS = 4_000;

/** Avoid hanging the dev server when Supabase is unreachable. */
export async function withDbTimeout<T>(
  promise: Promise<T>,
  ms = DEFAULT_MS
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("DB_TIMEOUT")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
