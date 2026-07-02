import { eventBus } from "@/server/events/event-bus"
import type { DomainEvent, DomainEventHandler } from "./types"

const handlers = new Map<string, DomainEventHandler[]>()
let wildcardForwarderBound = false

function ensureForwarderBound() {
  if (wildcardForwarderBound) return
  wildcardForwarderBound = true
  eventBus.on("*", (event) => {
    const domainHandlers = handlers.get(event.name) ?? []
    void Promise.all(domainHandlers.map((handler) => Promise.resolve(handler(event as unknown as DomainEvent))))
  })
}

export function registerDomainEventHandler<TPayload extends Record<string, unknown>>(
  eventName: string,
  handler: DomainEventHandler<TPayload>
) {
  ensureForwarderBound()
  const current = handlers.get(eventName) ?? []
  handlers.set(eventName, [...current, handler as DomainEventHandler])
}

export async function publishDomainEvent<TPayload extends Record<string, unknown>>(
  name: string,
  payload: TPayload
): Promise<DomainEvent<TPayload>> {
  ensureForwarderBound()
  return eventBus.emit(name as Parameters<typeof eventBus.emit>[0], payload) as unknown as DomainEvent<TPayload>
}
