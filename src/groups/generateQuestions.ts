import db, { Difficulty, Prisma } from "db"

type GenerateRandomQuestionsArgs = {
  difficulty?: Difficulty
  take?: number
  ignoreIds?: number[]
  /**
   * Defaults to true
   */
  isInitial?: boolean
  singleCategory?: string | null
}

export const generateRandomQuestions = async (args: GenerateRandomQuestionsArgs) => {
  const {
    difficulty = "EASY",
    take = 2,
    ignoreIds = [],
    singleCategory = null,
    isInitial = true,
  } = args

  let categories: string[] = [singleCategory!]
  if (singleCategory === null) {
    const distinctCategories = await db.question.findMany({ distinct: ["category"] })
    categories = distinctCategories.map((q) => q.category)
  }

  const questionIds = (
    await db.$transaction(
      categories.map((cat) =>
        db.$queryRawUnsafe<{ id: number }[]>(`SELECT id FROM "Question"
            WHERE "category" = '${cat}'
              AND "difficulty" = '${difficulty}'
              ${ignoreIds.length > 0 ? `AND id NOT IN (${ignoreIds.join(", ")})` : ""}
            ORDER BY random() LIMIT ${take}`)
      )
    )
  ).flatMap((q) => q)

  return {
    create: questionIds.map((qObj) => ({
      isInitial,
      question: { connect: qObj },
    })),
  } // satisfies Prisma.QuestionSolutionCreateNestedManyWithoutGroupUserInput
}
