import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db from "db"

export const joinGroupSchema = z.object({ slug: z.string() })

const joinGroupFn = resolver.pipe(
  resolver.zod(joinGroupSchema),
  resolver.authorize(),
  async ({ slug }, ctx) => {
    const group = await db.group.findUnique({ where: { slug } })
    if (!group) {
      throw new NotFoundError("Group not found")
    }

    await db.group.update({
      where: { id: group.id },
      data: { users: { connect: { id: ctx.session.userId } } },
    })

    return true
  }
)

export default joinGroupFn
