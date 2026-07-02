export async function jsonFetcher<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })

  const payload = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(payload?.error || `Request failed with status ${res.status}`)
  }
  return payload as T
}
