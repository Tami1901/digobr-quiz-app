import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db from "db"
import { generateRandomQuestions } from "../generateQuestions"

export const getGroupsSchema = z.void()

const getGroups = resolver.pipe(
  resolver.zod(getGroupsSchema),
  resolver.authorize(),
  async (_, ctx) => {
    return db.group.findMany({
      where: {
        groupUsers: {
          some: {
            userId: ctx.session.userId,
          },
        },
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
        groupUsers: { include: { user: { select: { id: true, name: true } } } },
      },
    })
  }
)

export default getGroups
