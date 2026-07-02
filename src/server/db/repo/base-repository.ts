import { prisma } from "@/server/db/prisma"

export abstract class BaseRepository {
  protected db = prisma
}
