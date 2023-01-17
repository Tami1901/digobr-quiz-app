import { AuthorizationError, NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db from "db"

export const getGroupSchema = z.object({ id: z.coerce.number() })

const getGroup = resolver.pipe(
  resolver.zod(getGroupSchema),
  resolver.authorize(),
  async ({ id }, ctx) => {
    return await db.group.findUniqueOrThrow({
      where: { id, groupUsers: { some: { userId: ctx.session.userId } } },
      include: {
        groupUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            solutions: {
              include: {
                question: {
                  select: { category: true },
                },
              },
            },
          },
        },
      },
    })
  }
)

export default getGroup
