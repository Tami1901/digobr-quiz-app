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
  useDisclosure,
} from "@chakra-ui/react"
import { LinkButton } from "chakra-next-link"
import router, { Router, useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { Category } from "src/core/components/Category"
import { ExplainModal } from "src/core/components/ExplainModal"
import Layout from "src/core/layouts/Layout"
import getQuestionsToSolve from "src/groups/queries/getQuestionsToSolve"
import {
  CATEGORIES,
  categoriesColors,
  categoriesImages,
  categoriesLabels,
} from "src/questions/categories"
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
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [userAnswer, setUserAnswer] = useState<undefined | number>(undefined)
  const [explanation, setExplanation] = useState<undefined | string>(undefined)
  const [solve, { isLoading: isSolving }] = useMutation(solveQuestionFn)
  const [explain, { isLoading }] = useMutation(explainAnswerFn)

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
    await solve({ answerIndex, questionId: solution.questionId, groupId })
    setUserAnswer(answerIndex)
    await refetch()
  }

  const onNext = async () => {
    setUserAnswer(undefined)

    if (index === groupUser.solutions.length - 1) {
      await router.push(`/`)
    } else {
      setIndex(index + 1)
    }
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
        backgroundImage={`url(${categoriesImages[solution.question.category]})`}
        backgroundSize="cover"
        backgroundRepeat="no-repeat"
        justifyContent="center"
        minHeight="calc(100vh - 80px)"
        height="calc(100vh - 96px)"
        alignItems="center"
        position={"relative"}
        overflow="hidden"
      >
        {/* <Box position="absolute" opacity="0.6" left="0" top="0" width="100%" height="auto"></Box> */}
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
          {CATEGORIES.map((c, i) => (
            <Category
              key={c}
              name={categoriesLabels[c]}
              // color={c[1]}
              isSelect={c === solution.question.category}
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
          justifyContent="space-around"
          alignItems="center"
          borderRadius="2xl"
          borderLeftRadius={0}
          shadow="2xl"
          p="10"
          mr="10"
          position="relative"
        >
          <Heading maxW="80%" textAlign="center" size="xl" mb="10">
            <>
              {index + 1}. {solution.question.question}{" "}
            </>
          </Heading>
          <Box w="100%">
            {[0, 1].map((i) => (
              <HStack key={i} spacing="10" mb="10" px={20}>
                <Button
                  onClick={onSolve(answers[i * 2 + 0]!.index)}
                  py="10"
                  w="100%"
                  wordBreak="break-all"
                  colorScheme={getColor(answers[i * 2 + 0]!.index)}
                  disabled={isAnswered || isSolving}
                  _disabled={{ opacity: 1, cursor: "not-allowed" }}
                  position="relative"
                  maxW="100%"
                  whiteSpace="normal"
                  px="10"
                >
                  <Box position="absolute" left="4">
                    {i === 0 ? `a)` : `c)`}
                  </Box>
                  <Text>{answers[i * 2 + 0]!.text}</Text>
                </Button>
                <Button
                  onClick={onSolve(answers[i * 2 + 1]!.index)}
                  py="10"
                  maxW="100%"
                  w="100%"
                  colorScheme={getColor(answers[i * 2 + 1]!.index)}
                  disabled={isAnswered || isSolving}
                  _disabled={{ opacity: 1, cursor: "not-allowed" }}
                  position="relative"
                  wordBreak="break-word"
                >
                  <Box position="absolute" left="4">
                    {i === 0 ? `b)` : `d)`}
                  </Box>
                  <Text w="100%" wordBreak="break-all">
                    {answers[i * 2 + 1]!.text}
                  </Text>
                </Button>
              </HStack>
            ))}
          </Box>
          <Box px="20" display="flex" w="full" justifyContent="space-between">
            <Button
              onClick={async () => {
                onOpen()
                setExplanation(
                  await explain({
                    answerIndex: userAnswer!,
                    questionId: solution!.question.id,
                    answers,
                  })
                )
              }}
              colorScheme="yellow"
              disabled={!isAnswered}
              px="20"
            >
              Explain me!
            </Button>
            <Button colorScheme="blue" px="20" disabled={!isAnswered} onClick={onNext}>
              Next
            </Button>
          </Box>
        </Box>
      </Box>

      <ExplainModal
        isOpen={isOpen}
        onClose={onClose}
        explanation={explanation}
        isLoading={isLoading}
      />
    </Layout>
  )
}

export default Quiz
