import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db from "db"

export const getQuestionsToSolveSchema = z.object({ groupId: z.number() })

const getQuestionsToSolve = resolver.pipe(
  resolver.zod(getQuestionsToSolveSchema),
  resolver.authorize(),
  async ({ groupId }, ctx) => {
    const group = await db.group.findUniqueOrThrow({
      where: { id: groupId, users: { some: { id: ctx.session.userId } } },
      select: {
        questions: {
          include: {
            solutions: {
              where: { userId: ctx.session.userId, groupId },
            },
          },
        },
      },
    })

    return group.questions
  }
)

export default getQuestionsToSolve
