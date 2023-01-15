import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db from "db"

export const createGroupSchema = z.object({
  name: z.string(),
})

const createGroupFn = resolver.pipe(
  resolver.zod(createGroupSchema),
  resolver.authorize(),
  async (data, ctx) => {
    const categories = await db.question.findMany({ distinct: ["category"] })
    const questionIds = (
      await db.$transaction(
        categories.map(
          (cat) =>
            db.$queryRaw<
              { id: number }[]
            >`SELECT id FROM "Question" WHERE "category" = ${cat.category} ORDER BY random() LIMIT 2`
        )
      )
    ).flatMap((q) => q)

    const group = await db.group.create({
      data: {
        ...data,
        questions: { connect: questionIds.map((q) => ({ id: q.id })) },
        slug: Array.from(new Array(5), () => Math.random().toString(36)[2]).join(""),
        createdBy: { connect: { id: ctx.session.userId } },
        users: { connect: { id: ctx.session.userId } },
      },
    })

    return group
  }
)

export default createGroupFn
