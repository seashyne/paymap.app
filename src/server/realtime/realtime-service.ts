import { subscribeToEventStream } from "@/server/events/event-stream"

type RealtimeMessage = {
  channel: string
  at: string
  payload: Record<string, unknown>
}

type ChannelHandler = (message: RealtimeMessage) => void

const subscribers = new Map<string, Set<ChannelHandler>>()
let wired = false

function ensureEventBridge() {
  if (wired) return
  wired = true
  subscribeToEventStream((event) => {
    const workspaceId = typeof event.payload.workspaceId === "string" ? event.payload.workspaceId : undefined
    if (workspaceId) {
      publish(`workspace:${workspaceId}`, { type: event.name, ...event.payload })
    }
    publish("global", { type: event.name, ...event.payload })
  })
}

export function publish(channel: string, payload: Record<string, unknown>) {
  const message: RealtimeMessage = { channel, at: new Date().toISOString(), payload }
  const handlers = subscribers.get(channel)
  if (!handlers?.size) return message
  for (const handler of handlers) handler(message)
  return message
}

export function subscribe(channel: string, handler: ChannelHandler) {
  ensureEventBridge()
  const set = subscribers.get(channel) ?? new Set<ChannelHandler>()
  set.add(handler)
  subscribers.set(channel, set)
  return () => {
    const current = subscribers.get(channel)
    if (!current) return
    current.delete(handler)
    if (!current.size) subscribers.delete(channel)
  }
}

export const realtime = { publish, subscribe }
