import { SecurePassword } from "@blitzjs/auth"
import axios from "axios"
import db from "./index"

const seed = async () => {
  const hashedPassword = await SecurePassword.hash("foobar123")
  const [admin, user] = await db.$transaction([
    db.user.create({
      data: { role: "ADMIN", email: "foo@bar.com", name: "Foo Bar", hashedPassword },
    }),
    db.user.create({
      data: { role: "USER", email: "bar@bar.com", name: "Bar Bar", hashedPassword },
    }),
  ])

  const object = {}
  for (let i = 0; i < 7; i++) {
    const res = await axios.get("https://opentdb.com/api.php?amount=50&type=multiple")
    res.data.results.forEach((q: any) => {
      object[q.question] = q
    })
  }

  const sanitize = (str) => {
    return str
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&eacute;/g, "é")
      .replace(/&ldquo;/g, "“")
      .replace(/&rdquo;/g, "”")
  }

  await db.$transaction(
    Object.values(object).map((q: any) => {
      const { question, correct_answer, incorrect_answers } = q
      const answers = [correct_answer, ...incorrect_answers]

      let rawCategory = q.category.split(":")[0].trim().split(" ")[0].trim()

      return db.question.create({
        data: {
          category: rawCategory,
          question: sanitize(question),
          ans1: sanitize(answers[0]),
          ans2: sanitize(answers[1]),
          ans3: sanitize(answers[2]),
          ans4: sanitize(answers[3]),
        },
      })
    })
  )

  // const categories = [
  //   "cars",
  //   "electronics",
  //   "fashion",
  //   "food",
  //   "health",
  //   "home",
  //   "music",
  //   "sports",
  //   "toys",
  //   "travel",
  // ]
  // const questions = await db.$transaction(
  //   Array.from(new Array(20), (_, i) =>
  //     db.question.create({
  //       data: {
  //         category: categories[i % categories.length]!,
  //         question: `Question ${i}`,
  //         ans1: "ans1",
  //         ans2: "ans2",
  //         ans3: "ans3",
  //         ans4: "ans4",
  //       },
  //     })
  //   )
  // )

  // await db.$transaction(
  //   Array.from(Array(2), (_, i) => {
  //     const tmpQuestions = questions.slice(10 * i, 10 * (i + 1))

  //     return db.group.create({
  //       data: {
  //         name: `Group ${i}`,
  //         slug: `group-${i}`,
  //         questions: { connect: tmpQuestions.map((q) => ({ id: q.id })) },
  //         createdBy: { connect: { id: admin.id } },
  //         users: { connect: [{ id: admin.id }, { id: user.id }] },
  //         solutions: {
  //           create: tmpQuestions.map((q) => ({
  //             question: { connect: { id: q.id } },
  //             user: { connect: { id: admin.id } },
  //             answerIndex: Math.floor(Math.random() * 4),
  //           })),
  //         },
  //       },
  //     })
  //   })
  // )
}

export default seed
