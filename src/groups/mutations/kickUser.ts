import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db from "db"
import { NotFoundError } from "blitz"

export const kickUserSchema = z.object({ id: z.number(), userId: z.number() })

const kickUserFn = resolver.pipe(
  resolver.zod(kickUserSchema),
  resolver.authorize(),
  async ({ id, userId }, ctx) => {
    const group = await db.group.findUniqueOrThrow({ where: { id } })
    if (!group) {
      throw new NotFoundError("Group not found")
    }

    if (group.createdById !== ctx.session.userId && ctx.session.userId !== userId) {
      throw new Error("Not authorized to kick users from this group")
    }

    await db.$transaction([
      db.questionSolution.deleteMany({ where: { groupUser: { groupId: id, userId } } }),
      db.groupUser.delete({ where: { userId_groupId: { userId, groupId: id } } }),
    ])
  }
)

export default kickUserFn
