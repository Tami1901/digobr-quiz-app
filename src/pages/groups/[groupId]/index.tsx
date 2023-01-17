import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import getGroup from "src/groups/queries/getGroup"

const Radar = dynamic(() => import("react-chartjs-2").then((a) => a.Radar), { ssr: false })

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
  OrderedList,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react"
import { ArrowDownIcon, ArrowUpIcon, DownloadIcon } from "@chakra-ui/icons"
import Head from "next/head"

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
  const [group, { refetch }] = useQuery(getGroup, { id: groupId })
  const [isExpanded, setIsExpanded] = useState(false)

  //   const data = useMemo(() => {
  //     const userData = group.solutions.reduce<Record<string, Record<string, number>>>(
  //       (obj, solution) => {
  //         if (!obj[`${solution.userId}-${solution.user.name}`]) {
  //           obj[`${solution.userId}-${solution.user.name}`] = {}
  //         }
  //
  //         if (!obj[`${solution.userId}-${solution.user.name}`]![solution.question.category]) {
  //           obj[`${solution.userId}-${solution.user.name}`]![solution.question.category] = 0
  //         }
  //
  //         obj[`${solution.userId}-${solution.user.name}`]![solution.question.category] +=
  //           solution.answerIndex === 0 ? 1 : 0
  //         return obj
  //       },
  //       {}
  //     )
  //
  //     const labels = group.solutions
  //       .map((s) => s.question.category)
  //       .flatMap((c) => c.split(" "))
  //       .reduce<string[]>((arr, c) => (arr.includes(c) ? arr : [...arr, c]), [])
  //       .sort((a, b) => a.localeCompare(b))
  //
  //     const datasets: any[] = []
  //     Object.keys(userData).forEach((userId) => {
  //       const [id, name] = userId.split("-")
  //       const user = group.users.find((u) => u.id === Number(id))
  //       if (!user) return
  //
  //       datasets.push({
  //         label: name,
  //         data: labels.map((l) => userData[userId]?.[l] || 0),
  //         fill: true,
  //         backgroundColor: generateColor(user, "0.2"),
  //         borderColor: generateColor(user),
  //         pointBackgroundColor: generateColor(user),
  //         pointBorderColor: "#fff",
  //         pointHoverBackgroundColor: "#fff",
  //         pointHoverBorderColor: generateColor(user),
  //       })
  //     })
  //
  //     return { labels, datasets }
  //   }, [group])

  const size = "500px"

  return (
    <Layout>
      <Box width="100%" display="flex" justifyContent="space-between" px={20}>
        <Box>
          <Heading size="sm" color="gray.600" mb="2">
            Group:{" "}
          </Heading>
          <Heading pb={10}>{group.name}</Heading>
          <HStack mb="6">
            <Heading size="sm" color="gray.600">
              Members:{" "}
            </Heading>
            {isExpanded ? (
              <Button onClick={() => setIsExpanded(false)} aria-label="Collapse" size="xs">
                Show less
              </Button>
            ) : (
              <Button
                onClick={() => setIsExpanded(true)}
                aria-label="Expand"
                size="xs"
                colorScheme="orange"
              >
                Show all data
              </Button>
            )}
          </HStack>
          {/* {group.users.map((user) => (
            <VStack key={user.id} alignItems="flex-start">
              <HStack pb={6}>
                <Heading size="md"> - {user.name}</Heading>
              </HStack>
              {isExpanded && (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Category</Th>
                      <Th>Question</Th>
                      <Th>Answer</Th>
                      <Th>T/F</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {group.solutions
                      .filter((s) => s.userId === user.id)
                      .map((s) => (
                        <Tr key={s.id}>
                          <Td> {s.question.category}</Td>
                          <Td>{s.question.question}</Td>
                          <Td>{s.question.ans1}</Td>
                          <Td> {s.answerIndex === 0 ? "✅" : "❌"}</Td>
                        </Tr>
                      ))}
                  </Tbody>
                </Table>
              )}
            </VStack>
          ))} */}
        </Box>
        <Box>
          {/* <Radar
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
                    stepSize: 1,
                  },
                },
              },
            }}
          /> */}
        </Box>
      </Box>
    </Layout>
  )
}

export default GroupPage
