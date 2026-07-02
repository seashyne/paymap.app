export interface DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  name: string
  occurredAt: string
  payload: TPayload
}

export type DomainEventHandler<TPayload extends Record<string, unknown> = Record<string, unknown>> = (
  event: DomainEvent<TPayload>
) => Promise<void> | void
