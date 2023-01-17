import React, { Suspense } from "react"
import { BlitzLayout, Routes, useParam, useParams } from "@blitzjs/next"
import {
  Avatar,
  Box,
  Button,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import logout from "src/auth/mutations/logout"
import createGroupFn from "src/groups/mutations/createGroup"
import LabeledTextField from "../components/LabeledTextField"
import router, { useRouter } from "next/router"
import Form, { FORM_ERROR } from "../components/Form"
import { group } from "console"
import getGroups from "src/groups/queries/getGroups"
import joinGroupFn from "src/groups/mutations/joinGroup"
import { Link } from "chakra-next-link"
import { useConfirm, usePrompt } from "chakra-confirm"
import { NotFoundError } from "blitz"

const User = () => {
  const currentUser = useCurrentUser()
  const [logoutMutation] = useMutation(logout)

  return (
    currentUser && (
      <Menu>
        <MenuButton>
          <Avatar name={currentUser.name} />
        </MenuButton>
        <MenuList>
          <MenuItem as="text">{currentUser.name}</MenuItem>
          <MenuItem as="text">{currentUser.email}</MenuItem>
          <MenuItem
            onClick={async () => {
              await logoutMutation()
            }}
            backgroundColor="red.200"
          >
            Logout
          </MenuItem>
        </MenuList>
      </Menu>
    )
  )
}

const Layout: BlitzLayout<{
  title?: string
  children?: React.ReactNode
  removeMarginTop?: boolean
}> = ({ title, children, removeMarginTop = false }) => {
  const [createGroupMutation] = useMutation(createGroupFn)
  const [joinGroupMutation] = useMutation(joinGroupFn)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isOpenJoin, onOpen: onOpenJoin, onClose: onCloseJoin } = useDisclosure()

  const router = useRouter()
  const confirm = useConfirm()
  const prompt = usePrompt()
  const toast = useToast()

  const joinGroup = async () => {
    const isJoin = await prompt({
      title: "Join group",
      buttonText: "Join",
      buttonColor: "green",
    })
    if (isJoin === null) return

    try {
      await joinGroupMutation({ slug: isJoin })
      await invalidateQuery(getGroups)
      onCloseJoin()
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        toast({
          title: "Group not found",
          status: "error",
        })
      }
    }
  }

  const createGroup = async () => {
    const isCreate = await prompt({
      title: "Create group",
      buttonText: "Create",
      buttonColor: "blue",
    })
    if (isCreate === null) return

    try {
      await createGroupMutation({ name: isCreate })
      await invalidateQuery(getGroups)
      onClose()
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        toast({
          title: "Group not created",
          status: "error",
        })
      }
    }
  }

  return (
    <Box w="100%" h="100vh" backgroundColor="white">
      <Box
        w="100%"
        display="flex"
        py={4}
        px={20}
        // mb={removeMarginTop ? undefined : "16"}
        shadow="base"
        justifyContent="space-between"
      >
        <Link href="/">
          <Heading lineHeight="1" color="#240070">
            Quiz app
          </Heading>
        </Link>

        <HStack spacing={4}>
          {router.pathname === "/" && (
            <>
              <Button onClick={joinGroup}>Join group</Button>
              <Button onClick={createGroup} colorScheme="purple">
                Create group
              </Button>
            </>
          )}

          <Suspense fallback={<Spinner />}>
            <User />
          </Suspense>
        </HStack>
      </Box>
      {children}
    </Box>
  )
}

export default Layout
