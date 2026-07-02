import { subscribe } from "@/server/realtime/realtime-service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const workspaceId = searchParams.get("workspaceId")
  const channel = workspaceId ? `workspace:${workspaceId}` : "global"

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      const write = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      write({ type: "connected", channel, at: new Date().toISOString() })
      const unsubscribe = subscribe(channel, (message) => write(message))
      const heartbeat = setInterval(() => write({ type: "heartbeat", channel, at: new Date().toISOString() }), 15000)

      const abort = () => {
        clearInterval(heartbeat)
        unsubscribe()
        try { controller.close() } catch {}
      }

      request.signal.addEventListener("abort", abort)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
