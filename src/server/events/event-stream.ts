import { eventBus, type PayMapEvent } from "./event-bus"

type StreamHandler = (event: PayMapEvent) => void

const subscribers = new Set<StreamHandler>()
let bound = false

function ensureBound() {
  if (bound) return
  bound = true
  eventBus.on("*", (event) => {
    for (const handler of subscribers) handler(event)
  })
}

export function subscribeToEventStream(handler: StreamHandler) {
  ensureBound()
  subscribers.add(handler)
  return () => subscribers.delete(handler)
}
