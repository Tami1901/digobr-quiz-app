import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

import db from "db"
import { NotFoundError } from "blitz"
import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export const explainQuestionSchema = z.object({
  questionId: z.number(),
  answerIndex: z.number(),
  answers: z.array(z.object({ text: z.string(), index: z.number(), order: z.number() })),
})

const explainAnswerFn = resolver.pipe(
  resolver.zod(explainQuestionSchema),
  resolver.authorize(),
  async ({ questionId, answerIndex, answers }, ctx) => {
    const question = await db.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      throw new NotFoundError("Group not found")
    }

    const isCorrect = answerIndex === 0

    console.log(answers)

    const a = `Why is the answer ${question[`ans${answerIndex + 1}`]} ${
      isCorrect ? "correct" : "wrong"
    } for this question: ${question.question} and explain why?`

    return (
      await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Here is the question where we know that answer a is correct, user answered with ${
          "abcd"[answerIndex]
        }, explain why is it wrong and why is a correct

        ${question.question}
        a) ${answers}
        b) ${question.ans2}
        c) ${question.ans3}
        d) ${question.ans4}`,
        max_tokens: 100,
      })
    ).data.choices[0]?.text
  }
)

export default explainAnswerFn
