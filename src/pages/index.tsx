import { Suspense } from "react"
import Layout from "src/core/layouts/Layout"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import logout from "src/auth/mutations/logout"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { BlitzPage } from "@blitzjs/next"
import {
  Box,
  Text,
  HStack,
  IconButton,
  Table,
  TableCaption,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
  ListIcon,
  ListItem,
  List,
  useDisclosure,
} from "@chakra-ui/react"
import getGroups from "src/groups/queries/getGroups"
import { DeleteIcon, EditIcon, ExternalLinkIcon, MinusIcon, ViewIcon } from "@chakra-ui/icons"
import { useConfirm } from "chakra-confirm"
import kickUser from "src/groups/mutations/kickUser"
import { LinkButton } from "chakra-next-link"
import deleteGroupFn from "src/groups/mutations/deleteGroup"

const mailto = (slug: string) =>
  `mailto:name@gmail.com?body=Hi,I'm inviting you to join my quiz group on http://localhost:3000/. This is a join code:${slug}.`

const UserInfo = () => {
  const [logoutMutation] = useMutation(logout)
  const [deleteGroupMutation] = useMutation(deleteGroupFn)
  const [kickUserFn] = useMutation(kickUser)
  const currentUser = useCurrentUser()

  const [groups, { refetch }] = useQuery(getGroups, undefined)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const confirm = useConfirm()

  const onLeave = (groupId: number) => async () => {
    const isConfirm = await confirm({
      title: "Are you sure you want to leave this group?",
      buttonText: "Leave",
      buttonColor: "red",
    })
    if (isConfirm) {
      await kickUserFn({ id: groupId, userId: currentUser!.id })
      await refetch()
    }
  }

  const deleteGroup = (id: number) => async () => {
    const isConfirm = await confirm({
      title: "Are you sure you want to delete this group?",
      buttonText: "Delete",
      buttonColor: "red",
    })
    if (isConfirm) {
      await deleteGroupMutation({ id: id })
      await refetch()
    }
  }

  if (!currentUser) return null
  return (
    <Box px={16} width="100%" mt="10">
      <TableContainer>
        <Table variant="simple">
          <TableCaption>My groups</TableCaption>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Invite code</Th>
              <Th>Users</Th>
              <Th>Role</Th>
              <Th>Resolve</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {groups.map((g) => (
              <Tr key={g.id}>
                <Td>{g.name}</Td>
                <Td>
                  <LinkButton href={mailto(g.slug)} colorScheme="gray">
                    {g.slug}
                    <ExternalLinkIcon ml="4" />
                  </LinkButton>
                </Td>
                <Td>
                  <List spacing={4}>
                    {g.users.map((u) => (
                      <ListItem key={u.id}>{u.name}</ListItem>
                    ))}
                  </List>
                </Td>
                <Td>
                  <Tag
                    backgroundColor={g.createdById === currentUser.id ? "orange.200" : "gray.200"}
                  >
                    {g.createdById === currentUser.id ? "Admin" : "User"}
                  </Tag>
                </Td>

                <Td>
                  {g.solutions.filter((s) => s.userId === currentUser.id).length % 20 === 0 ? (
                    <LinkButton href={`/groups/${g.id}/quiz`} colorScheme="green">
                      Start
                    </LinkButton>
                  ) : (
                    <LinkButton href={`/groups/${g.id}`} colorScheme="orange">
                      Show results
                    </LinkButton>
                  )}
                </Td>
                <Td>
                  <HStack>
                    {/* <IconButton
                      aria-label={"Edit group"}
                      colorScheme="blue"
                      size="sm"
                      disabled={g.createdById !== currentUser.id}
                    >
                      <EditIcon />
                    </IconButton> */}
                    {g.createdById === currentUser.id ? (
                      <IconButton
                        aria-label={"Delete group"}
                        colorScheme="red"
                        size="sm"
                        onClick={deleteGroup(g.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        aria-label={"Leave group"}
                        colorScheme="red"
                        size="sm"
                        onClick={onLeave(g.id)}
                      >
                        <MinusIcon />
                      </IconButton>
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  )
}

const Home: BlitzPage = () => {
  return (
    <Layout title="Home">
      <Suspense fallback="Loading...">
        <UserInfo />
      </Suspense>
    </Layout>
  )
}

Home.authenticate = { redirectTo: "/auth/login" }
Home.suppressFirstRenderFlicker = true

export default Home
