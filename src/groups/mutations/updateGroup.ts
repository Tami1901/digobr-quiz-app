import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db from "db"
import { createGroupSchema } from "./createGroup"

export const updateGroupSchema = z.object({
  id: z.coerce.number(),
  data: createGroupSchema.partial(),
})

const updateGroupFn = resolver.pipe(
  resolver.zod(updateGroupSchema),
  resolver.authorize(),
  async ({ id, data }, ctx) => {
    const group = await db.group.findUniqueOrThrow({ where: { id } })
    if (!group || group.createdById !== ctx.session.userId) {
      throw new Error("Not authorized to update this group")
    }

    await db.group.update({ where: { id }, data })
  }
)

export default updateGroupFn
