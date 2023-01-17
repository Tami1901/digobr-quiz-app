import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db, { Difficulty } from "db"
import { NotFoundError } from "blitz"
import { generateRandomQuestions } from "src/groups/generateQuestions"

export const solveQuestionSchema = z.object({
  groupId: z.number(),
  questionId: z.number(),
  answerIndex: z.number(),
})

const scoreToNewQuestions = {
  0: { EASY: 1 },
  1: { MEDIUM: 1, EASY: 1 },
  2: { MEDIUM: 2, HARD: 1 },
}

const solveQuestionFn = resolver.pipe(
  resolver.zod(solveQuestionSchema),
  resolver.authorize(),
  async ({ groupId, answerIndex, questionId }, ctx) => {
    const groupUser = await db.groupUser.findUnique({
      where: { userId_groupId: { userId: ctx.session.userId, groupId } },
      include: {
        solutions: {
          include: {
            question: true,
          },
        },
      },
    })

    const solution = groupUser?.solutions.find((s) => s.question.id === questionId)
    if (!groupUser || !solution) {
      throw new NotFoundError()
    }

    if (solution.answerIndex !== null) {
      return
    }

    const initialQuestionsOfThisCategory = groupUser.solutions.filter(
      (s) => s.question.category === solution.question.category && s.isInitial
    )

    if (solution.isInitial && initialQuestionsOfThisCategory.every((s) => s.answerIndex !== null)) {
      const scoreOnInit = initialQuestionsOfThisCategory.filter((s) => s.answerIndex === 0).length
      if (scoreOnInit < 0 || scoreOnInit > 2) {
        throw new Error("Invalid scoreOnInit")
      }

      const newCreateObj = await Promise.all(
        Object.entries(scoreToNewQuestions[scoreOnInit as 0 | 1 | 2]).map(
          async ([difficulty, take]) => {
            return await generateRandomQuestions({
              ignoreIds: initialQuestionsOfThisCategory.map((q) => q.id),
              singleCategory: solution.question.category,
              difficulty: difficulty as Difficulty,
              take,
            })
          }
        )
      )

      const mergedCreateObj = newCreateObj.flatMap((o) => o.create)
      await db.groupUser.update({
        where: { userId_groupId: { userId: ctx.session.userId, groupId } },
        data: {
          solutions: {
            create: mergedCreateObj,
          },
        },
      })
    }

    const isLastQuestion = groupUser.solutions.every(
      (s) => s.answerIndex !== null || s.questionId === questionId
    )

    if (isLastQuestion) {
      await db.groupUser.update({
        where: { userId_groupId: { userId: ctx.session.userId, groupId } },
        data: {
          quizSolved: true,
        },
      })
    }

    await db.questionSolution.update({
      where: { id: solution.id },
      data: {
        answerIndex,
      },
    })

    return answerIndex === 0
  }
)

export default solveQuestionFn
