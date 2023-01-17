import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db from "db"
import { generateRandomQuestions } from "../generateQuestions"

export const createGroupSchema = z.object({
  name: z.string(),
})

const createGroupFn = resolver.pipe(
  resolver.zod(createGroupSchema),
  resolver.authorize(),
  async (data, ctx) => {
    return db.group.create({
      data: {
        ...data,
        slug: Array.from(new Array(5), () => Math.random().toString(36)[2]).join(""),
        createdBy: { connect: { id: ctx.session.userId } },
        groupUsers: {
          create: {
            solutions: await generateRandomQuestions({}),
            user: { connect: { id: ctx.session.userId } },
          },
        },
      },
    })
  }
)

export default createGroupFn
