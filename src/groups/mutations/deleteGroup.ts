import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db from "db"

export const deleteGroupSchema = z.object({ id: z.coerce.number() })

const deleteGroupFn = resolver.pipe(
  resolver.zod(deleteGroupSchema),
  resolver.authorize(),
  async ({ id }, ctx) => {
    const group = await db.group.findUniqueOrThrow({ where: { id } })
    if (!group || group.createdById !== ctx.session.userId) {
      throw new Error("Not authorized to delete this group")
    }

    await db.$transaction([
      db.questionSolution.deleteMany({ where: { groupUser: { groupId: id } } }),
      db.group.delete({ where: { id } }),
    ])
  }
)

export default deleteGroupFn
