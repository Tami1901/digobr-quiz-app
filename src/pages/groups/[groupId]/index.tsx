import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import getGroup from "src/groups/queries/getGroup"

const Radar = dynamic(() => import("react-chartjs-2").then((a) => a.Radar), { ssr: false })
export const calcScores = (gu) => {
  return Object.entries(
    gu.solutions.reduce((acc, solution) => {
      if (!acc[solution.question.category]) {
        acc[solution.question.category] = []
      }

      acc[solution.question.category].push(solution.answerIndex === 0 ? 1 : 0)

      return acc
    }, {})
  )
    .map(([category, scores]: any) => {
      let sc = [...scores]
      if (sc.length < 5) {
        sc = [...sc, ...Array(5 - sc.length).fill(0)]
      }

      return [category, (scores.reduce((a, b) => a + b, 0) / scores.length) * 100]
    })
    .sort((a, b) => b[1] - a[1])
}

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js"
import Layout from "src/core/layouts/Layout"
import {
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  ListItem,
  OrderedList,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  UnorderedList,
  VStack,
} from "@chakra-ui/react"
import { ArrowDownIcon, ArrowUpIcon, DownloadIcon } from "@chakra-ui/icons"
import Head from "next/head"
import { T } from "@blitzjs/auth/dist/index-ced88017"
import { CATEGORIES } from "src/questions/categories"

if (typeof window !== "undefined") {
  ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler
  )
}

const generateColor = (user: { id: number; name: string }, opacity?: string) => {
  const hash = `${user.id}${user.name}`.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

  let color = "#"
  for (let i = 0; i < 3; i++) {
    color += ("00" + ((hash >> (i * 8)) & 0xff).toString(16)).slice(-2)
  }

  if (opacity) {
    color += opacity
  }

  color = color.slice(1)
  const values: number[] = []
  for (let i = 0; i < 3; i++) {
    values.push(parseInt(color.slice(i * 2, i * 2 + 2), 16))
  }

  if (opacity) {
    return `rgba(${values.join(", ")}, ${opacity})`
  } else {
    return `rgb(${values.join(", ")})`
  }
}

const GroupPage = () => {
  const router = useRouter()
  const groupId = useParam("groupId", "number")!
  const [rawGroups, { refetch }] = useQuery(getGroup, { id: groupId })

  const groupWithScores = useMemo(() => {
    return {
      ...rawGroups,
      groupUsers: rawGroups.groupUsers.map((gu) => ({ ...gu, scores: calcScores(gu) })),
    }
  }, [rawGroups])

  const data = useMemo(() => {
    const datasets = groupWithScores.groupUsers.map((gu) => {
      return {
        label: gu.user.name,
        data: CATEGORIES.map((c) => gu.scores.find((s) => s[0] === c)?.[1] || 0),
        fill: true,
        backgroundColor: generateColor(gu.user, "0.2"),
        borderColor: generateColor(gu.user),
        pointBackgroundColor: generateColor(gu.user),
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: generateColor(gu.user),
      }
    })

    return { labels: CATEGORIES, datasets }
  }, [groupWithScores])

  const size = "500px"

  return (
    <Layout>
      <Box width="100%" display="flex" justifyContent="space-between" px={20}>
        <Box>
          <Heading size="sm" color="gray.600" mb="2">
            Group:{" "}
          </Heading>
          <Heading pb={10}>{groupWithScores.name}</Heading>
          <HStack mb="6">
            <Heading size="sm" color="gray.600">
              Members:
            </Heading>
          </HStack>

          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>Score</Th>
                <Th>Best category</Th>
              </Tr>
            </Thead>
            <Tbody>
              {groupWithScores.groupUsers.map((gu, index) => {
                return (
                  <Tr key={gu.id}>
                    <Td>{index}</Td>
                    <Td>{gu.user.name}</Td>
                    <Td>
                      <UnorderedList>
                        {gu.scores.map(([category, score]) => (
                          <ListItem key={category}>
                            {category}: {score.toFixed(2)}%
                          </ListItem>
                        ))}
                      </UnorderedList>
                    </Td>

                    <Td>
                      {gu.scores[0]?.[0]}: {(gu.scores[0]?.[1] as any)?.toFixed(2)}%
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </Box>
        <Box>
          <Radar
            data={data}
            height={size}
            width={size}
            options={{
              scales: {
                r: {
                  angleLines: {
                    display: false,
                  },
                  suggestedMin: 0,
                  suggestedMax: 2,
                  ticks: {
                    // forces step size to be 50 units
                    stepSize: 10,
                    display: false,
                  },
                },
              },
            }}
          />
        </Box>
      </Box>
    </Layout>
  )
}

export default GroupPage
