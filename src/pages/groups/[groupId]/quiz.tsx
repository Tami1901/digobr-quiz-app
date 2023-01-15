import { useParam, BlitzPage } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Box, Button, Heading, HStack, Tag, VStack } from "@chakra-ui/react"
import router, { Router, useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import Layout from "src/core/layouts/Layout"
import getQuestionsToSolve from "src/groups/queries/getQuestionsToSolve"
import solveQuestionFn from "src/questions/mutations/solveQuestion"

const Quiz: BlitzPage = () => {
  const groupId = useParam("groupId", "number")!
  const [questions, { refetch }] = useQuery(getQuestionsToSolve, { groupId })
  const [index, setIndex] = useState(questions.filter((q) => q.solutions.length !== 0).length)
  const router = useRouter()
  const question = questions[index]

  console.log("questions", question, questions, index)

  useEffect(() => {
    if (!question) {
      void router.push(`/`)
    }
  }, [question, router])

  const answers = useMemo(
    () =>
      [
        { text: question?.ans1, index: 0 },
        { text: question?.ans2, index: 1 },
        { text: question?.ans3, index: 2 },
        { text: question?.ans4, index: 3 },
      ].sort(() => Math.random() - 0.5),
    [question]
  )

  const [solve] = useMutation(solveQuestionFn)

  const onSolve = (answerIndex: number) => async () => {
    await solve({ answerIndex, questionId: question!.id, groupId })
    await refetch()

    if (index === questions.length - 1) {
      await router.push(`/`)
    } else {
      setIndex(index + 1)
    }
  }

  if (!question) {
    return null
  }

  return (
    <Layout>
      <Box
        key={question.id}
        width="100%"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <HStack mb={8}>
          {questions.map((q) => (
            <Box
              w="4"
              h="4"
              borderRadius="50%"
              bgColor={
                q.solutions.length === 0
                  ? "gray.300"
                  : q.solutions[0]?.answerIndex === 0
                  ? "green"
                  : "red"
              }
              key={q.id}
            />
          ))}
        </HStack>

        <Heading mb={20}>
          <VStack spacing={6}>
            <Heading maxW="80%" textAlign="center" size="xl">
              {index + 1}. {question.question}{" "}
            </Heading>
            <Tag backgroundColor="orange.200" size="md">
              {question.category}
            </Tag>
          </VStack>
        </Heading>
        {[0, 1].map((i) => (
          <HStack key={i} spacing="10" mb="10" w="100%" px={20}>
            <Button onClick={onSolve(answers[i * 2 + 0]!.index)} py="10" w="100%">
              {answers[i * 2 + 0]!.text}
            </Button>
            <Button onClick={onSolve(answers[i * 2 + 1]!.index)} py="10" w="100%">
              {answers[i * 2 + 1]!.text}
            </Button>
          </HStack>
        ))}
      </Box>
    </Layout>
  )
}

export default Quiz
