import { cacheDelete, cacheGet, cacheSet, getOrSet } from "./cache-service"

export const globalCache = {
  get: cacheGet,
  set: cacheSet,
  del: cacheDelete,
  getOrSet,
}
