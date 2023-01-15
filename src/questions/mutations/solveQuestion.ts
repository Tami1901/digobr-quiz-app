import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db from "db"
import { NotFoundError } from "blitz"

export const solveQuestionSchema = z.object({
  groupId: z.number(),
  questionId: z.number(),
  answerIndex: z.number(),
})

const solveQuestionFn = resolver.pipe(
  resolver.zod(solveQuestionSchema),
  resolver.authorize(),
  async ({ groupId, answerIndex, questionId }, ctx) => {
    const group = await db.group.findUnique({
      where: { id: groupId, users: { some: { id: ctx.session.userId } } },
    })

    if (!group) {
      throw new NotFoundError("Group not found")
    }

    await db.questionSolution.create({
      data: {
        answerIndex,
        group: { connect: { id: groupId } },
        question: { connect: { id: questionId } },
        user: { connect: { id: ctx.session.userId } },
      },
    })
  }
)

export default solveQuestionFn
