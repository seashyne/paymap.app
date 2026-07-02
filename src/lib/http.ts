export type ApiEnvelope<T = unknown> = {
  success: boolean;
  message?: string;
  error?: string;
  details?: Record<string, string[]>;
  data?: T;
};

export async function readApi<T = unknown>(res: Response): Promise<ApiEnvelope<T>> {
  try {
    return (await res.json()) as ApiEnvelope<T>;
  } catch {
    return { success: res.ok, error: res.ok ? undefined : "Unexpected response" };
  }
}

export function firstError(details?: Record<string, string[]>) {
  if (!details) return undefined;
  for (const values of Object.values(details)) {
    if (values?.[0]) return values[0];
  }
  return undefined;
}
