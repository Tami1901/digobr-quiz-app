import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db from "db"
import { NotFoundError, RedirectError } from "blitz"

export const getQuestionsToSolveSchema = z.object({ groupId: z.number() })

const getQuestionsToSolve = resolver.pipe(
  resolver.zod(getQuestionsToSolveSchema),
  resolver.authorize(),
  async ({ groupId }, ctx) => {
    const groupUser = await db.groupUser.findUnique({
      where: { userId_groupId: { userId: ctx.session.userId, groupId } },
      include: {
        solutions: {
          include: {
            question: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!groupUser) {
      throw new NotFoundError("User is not in group")
    }

    if (groupUser.quizSolved) {
      throw new RedirectError(`/groups/${groupId}`)
    }

    return groupUser
  }
)

export default getQuestionsToSolve
