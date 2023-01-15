import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db from "db"

export const getGroupsSchema = z.void()

const getGroups = resolver.pipe(
  resolver.zod(getGroupsSchema),
  resolver.authorize(),
  async (_, ctx) => {
    return db.group.findMany({
      where: {
        users: {
          some: {
            id: ctx.session.userId,
          },
        },
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
        users: true,
        solutions: {
          where: {
            userId: ctx.session.userId,
          },
        },
      },
    })
  }
)

export default getGroups
