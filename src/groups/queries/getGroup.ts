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
      where: { id, users: { some: { id: ctx.session.userId } } },
      include: {
        users: {
          select: {
            id: true,
            name: true,
          },
        },
        solutions: {
          include: {
            question: {
              select: {
                category: true,
                question: true,
                ans1: true,
              },
            },
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })
  }
)

export default getGroup
