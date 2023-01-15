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

  return (
    <Box w="100%" h="100vh" backgroundColor="white">
      <Box
        w="100%"
        display="flex"
        py={6}
        px={20}
        mb={removeMarginTop ? undefined : "16"}
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
              <Button onClick={onOpenJoin}>Join group</Button>
              <Button onClick={onOpen} colorScheme="purple">
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
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box py="4" px="10" margin="0 auto" width="fit-content">
              <Form
                initialValues={{ name: "" }}
                onSubmit={async (values) => {
                  try {
                    await createGroupMutation({ name: values.name })
                    await invalidateQuery(getGroups)
                    onClose()
                    // await router.push(Routes.Home())
                  } catch (error: any) {}
                }}
              >
                <LabeledTextField name="name" label="Name" placeholder="Name" />

                <Button type="submit" width="100%" colorScheme="blue" mt="6">
                  Create Group
                </Button>
              </Form>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpenJoin} onClose={onCloseJoin}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Join group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box py="4" px="10" margin="0 auto" width="fit-content">
              <Form
                initialValues={{ slug: "" }}
                onSubmit={async (values) => {
                  try {
                    await joinGroupMutation({ slug: values.slug })
                    await invalidateQuery(getGroups)
                    onCloseJoin()
                  } catch (error: any) {}
                }}
              >
                <LabeledTextField name="slug" label="Slug" placeholder="Slug" />

                <Button type="submit" width="100%" colorScheme="blue" mt="6">
                  Join Group
                </Button>
              </Form>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onCloseJoin}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Layout
