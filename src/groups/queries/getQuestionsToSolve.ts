import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db from "db"

export const getQuestionsToSolveSchema = z.object({ groupId: z.number() })

const getQuestionsToSolve = resolver.pipe(
  resolver.zod(getQuestionsToSolveSchema),
  resolver.authorize(),
  async ({ groupId }, ctx) => {
    return db.groupUser.findUnique({
      where: { userId_groupId: { userId: ctx.session.userId, groupId } },
      include: {
        solutions: {
          include: {
            question: true,
          },
        },
      },
    })
  }
)

export default getQuestionsToSolve
