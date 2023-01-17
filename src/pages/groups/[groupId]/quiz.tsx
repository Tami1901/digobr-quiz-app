import { useParam, BlitzPage } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { ChevronLeftIcon, ChevronRightIcon, QuestionIcon } from "@chakra-ui/icons"
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
import { categoriesColors } from "src/questions/categories"
import explainAnswerFn from "src/questions/mutations/explainAnswer"
import solveQuestionFn from "src/questions/mutations/solveQuestion"

const randomWithSeed = (seed: string) => {
  const numberSeed = seed
    .split("")
    .map((c) => c.charCodeAt(0))
    .reduce((a, b) => a + b, 0)

  const x = Math.sin(numberSeed) * 10000
  return x - Math.floor(x)
}

const Quiz: BlitzPage = () => {
  const groupId = useParam("groupId", "number")!
  const [groupUser, { refetch }] = useQuery(getQuestionsToSolve, { groupId })
  const [index, setIndex] = useState(
    groupUser.solutions.filter((sol) => sol.answerIndex !== null).length
  )

  const [userAnswer, setUserAnswer] = useState<undefined | number>(undefined)
  const [explanation, setExplanation] = useState<undefined | string>(undefined)
  const [solve] = useMutation(solveQuestionFn)
  const [explain] = useMutation(explainAnswerFn)

  const solution = groupUser.solutions[index]
  const answers = useMemo(() => {
    if (!solution) {
      return []
    }

    return [
      { text: solution.question.ans1, index: 0, order: randomWithSeed(solution.question.ans1) },
      { text: solution.question.ans2, index: 1, order: randomWithSeed(solution.question.ans2) },
      { text: solution.question.ans3, index: 2, order: randomWithSeed(solution.question.ans3) },
      { text: solution.question.ans4, index: 3, order: randomWithSeed(solution.question.ans4) },
    ].sort((a, b) => a.order - b.order)
  }, [solution])

  if (!solution) {
    return <h1>Solution not found</h1>
  }

  const onSolve = (answerIndex: number) => async () => {
    // const response = await solve({ answerIndex, questionId: solution.questionId, groupId })
    setUserAnswer(answerIndex)
    // await refetch()

    // setExplanation(await explain({ answerIndex, questionId: solution!.id }))
    // if (index === questions.length - 1) {
    //   await router.push(`/`)
    // } else {
    //   setIndex(index + 1)
    // }
  }

  const onNext = () => {
    setUserAnswer(undefined)
  }

  const isAnswered = userAnswer !== undefined
  const getColor = (index: number) => {
    if (userAnswer === undefined) {
      return undefined
    }

    if (index === 0) {
      return "green"
    }

    if (index === userAnswer) {
      return "red"
    }

    return undefined
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
          {Object.entries(categoriesColors).map((c, i) => (
            <Category
              key={c[0]}
              name={c[0]}
              color={c[1]}
              isSelect={c[0] === solution.question.category}
              isFirst={i === 0}
              isLast={i === 4}
            />
          ))}
        </Box>
        <Box
          key={solution.id}
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
            <>
              {index + 1}. {solution.question.question}{" "}
            </>
          </Heading>
          {[0, 1].map((i) => (
            <HStack key={i} spacing="10" mb="10" w="100%" px={20}>
              <Button
                onClick={onSolve(answers[i * 2 + 0]!.index)}
                py="10"
                w="100%"
                colorScheme={getColor(answers[i * 2 + 0]!.index)}
                disabled={isAnswered}
                _disabled={{ opacity: 1, cursor: "not-allowed" }}
              >
                {answers[i * 2 + 0]!.text}
              </Button>
              <Button
                onClick={onSolve(answers[i * 2 + 1]!.index)}
                py="10"
                w="100%"
                colorScheme={getColor(answers[i * 2 + 1]!.index)}
                disabled={isAnswered}
                _disabled={{ opacity: 1, cursor: "not-allowed" }}
              >
                {answers[i * 2 + 1]!.text}
              </Button>
            </HStack>
          ))}
          <Box px="20" display="flex" w="full" justifyContent="space-between">
            <Button
              onClick={() => explain({ answerIndex: 0, questionId: 2 })}
              colorScheme="yellow"
              disabled={!isAnswered}
              px="20"
            >
              Explain me!
            </Button>
            <LinkButton colorScheme="blue" px="20" disabled={!isAnswered}>
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
