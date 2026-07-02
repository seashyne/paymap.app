# API Contract

Preferred response envelope:

```ts
export type ApiSuccess<T> = { ok: true; data: T }
export type ApiFailure = { ok: false; error: string; code?: string }
export type ApiResult<T> = ApiSuccess<T> | ApiFailure
```

Rules:
- Validate all request input
- Keep route handlers thin
- Perform auth + permission check before writes
- Return stable response shapes
