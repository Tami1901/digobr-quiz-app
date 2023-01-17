import { SecurePassword } from "@blitzjs/auth"
import axios from "axios"
import { categoryMap } from "src/questions/categories"
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
  for (let i = 0; i < 20; i++) {
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
      if (!categoryMap[rawCategory]) {
        rawCategory = "Other"
      } else {
        rawCategory = categoryMap[rawCategory]
      }

      return db.question.create({
        data: {
          category: rawCategory,
          difficulty: (q.difficulty as string).toUpperCase() as "EASY" | "MEDIUM" | "HARD",
          question: sanitize(question),
          ans1: sanitize(answers[0]),
          ans2: sanitize(answers[1]),
          ans3: sanitize(answers[2]),
          ans4: sanitize(answers[3]),
        },
      })
    })
  )
}

export default seed
