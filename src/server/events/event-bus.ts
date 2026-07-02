import { EventEmitter } from "events"

export type PayMapEventName =
  | "auth.login"
  | "auth.register"
  | "workspace.switched"
  | "billing.portal_opened"
  | "billing.checkout_created"
  | "planner.entry_created"
  | "planner.entry_updated"
  | "planner.entry_deleted"
  | "admin.viewed"
  | "domain.payroll.run.upserted"
  | "domain.payroll.run.posted"
  | "domain.merchant.sale.confirmed"
  | "domain.merchant.sale.posted"

export type PayMapEvent<T = Record<string, unknown>> = {
  name: PayMapEventName
  at: string
  payload: T
}

class PayMapEventBus {
  private emitter = new EventEmitter()

  emit<T extends Record<string, unknown>>(name: PayMapEventName, payload: T) {
    const event: PayMapEvent<T> = { name, at: new Date().toISOString(), payload }
    this.emitter.emit(name, event)
    this.emitter.emit("*", event)
    return event
  }

  on(name: PayMapEventName | "*", handler: (event: PayMapEvent) => void) {
    this.emitter.on(name, handler)
    return () => this.emitter.off(name, handler)
  }
}

export const eventBus = new PayMapEventBus()
