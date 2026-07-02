import { registerDefaultDomainSubscribers } from "./subscribers"

let bootstrapped = false

export function bootstrapDomainEvents() {
  if (bootstrapped) return
  bootstrapped = true
  registerDefaultDomainSubscribers()
}
