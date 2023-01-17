import { useParam, BlitzPage } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons"
import {
  Box,
  Button,
  CircularProgress,
  Heading,
  HStack,
  Text,
  Tag,
  VStack,
  Flex,
  Divider,
} from "@chakra-ui/react"
import { LinkButton } from "chakra-next-link"
import router, { Router, useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { Category } from "src/core/components/Category"
import Layout from "src/core/layouts/Layout"
import getQuestionsToSolve from "src/groups/queries/getQuestionsToSolve"
import explainAnswerFn from "src/questions/mutations/explainAnswer"
import solveQuestionFn from "src/questions/mutations/solveQuestion"

const Quiz: BlitzPage = () => {
  const groupId = useParam("groupId", "number")!
  const [questions, { refetch }] = useQuery(getQuestionsToSolve, { groupId })
  const [index, setIndex] = useState(questions.filter((q) => q.solutions.length !== 0).length)
  const [explanation, setExplanation] = useState<undefined | string>(undefined)
  const router = useRouter()
  const question = questions[index]

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
  const [explain] = useMutation(explainAnswerFn)

  const onSolve = (answerIndex: number) => async () => {
    // await solve({ answerIndex, questionId: question!.id, groupId })
    // await refetch()

    setExplanation(await explain({ answerIndex, questionId: question!.id }))
    // if (index === questions.length - 1) {
    //   await router.push(`/`)
    // } else {
    //   setIndex(index + 1)
    // }
  }

  if (!question) {
    return null
  }

  return (
    <Layout>
      <Box
        width="100%"
        display="flex"
        backgroundImage="url('/art.png')"
        backgroundSize="cover"
        backgroundRepeat="no-repeat"
        justifyContent="center"
        minHeight="calc(100vh - 96px)"
        height="calc(100vh - 96px)"
        alignItems="center"
      >
        <Box
          backgroundColor="white"
          height="70vh"
          borderLeftRadius="2xl"
          shadow="2xl"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="space-around"
          ml="10"
        >
          <Category name="History" color="gray" isFirst={true} />
          <Category name="Art" color="orange" isSelect />
          <Category name="Sport" color="blue" />
          <Category name="Movies" color="teal" />
          <Category name="Books" color="purple" isLast={true} />
        </Box>
        <Box
          key={question.id}
          width="80%"
          backgroundColor="white"
          marginLeft="4"
          h="70vh"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          borderRadius="2xl"
          borderLeftRadius={0}
          shadow="2xl"
          p="10"
          mr="10"
          position="relative"
        >
          {/* <HStack mb={8} width="80%">
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
          </HStack> */}

          <Heading maxW="80%" textAlign="center" size="xl" mb="10">
            {index + 1}. {question.question}{" "}
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
          <Box px="20" display="flex" w="full" justifyContent="space-between">
            <Button
              onClick={() => explain({ answerIndex: 0, questionId: 2 })}
              colorScheme="yellow"
              disabled={explanation === undefined}
              px="20"
            >
              Explain me!
            </Button>
            <LinkButton colorScheme="blue" px="20">
              Next
            </LinkButton>
          </Box>
          <Box>{explanation}</Box>
        </Box>
      </Box>
    </Layout>
  )
}

export default Quiz
