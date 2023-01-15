import { AuthenticationError, PromiseReturnType } from "blitz"
import Link from "next/link"
import { LabeledTextField } from "src/core/components/LabeledTextField"
import login from "src/auth/mutations/login"
import { Login, Signup } from "src/auth/validations"
import { useMutation } from "@blitzjs/rpc"
import { Routes } from "@blitzjs/next"
import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import signup from "../mutations/signup"
import router from "next/router"
import { Form, FORM_ERROR, InputField } from "chakra-form"
import { SignUpForm } from "./SignUpForm"

type LoginFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof login>) => void
}

export const LoginForm = (props: LoginFormProps) => {
  const [loginMutation] = useMutation(login)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const onSubmit = async (values) => {
    try {
      const user = await loginMutation(values)
      props.onSuccess?.(user)
    } catch (error: any) {
      if (error instanceof AuthenticationError) {
        return { [FORM_ERROR]: "Sorry, those credentials are invalid" }
      } else {
        return {
          [FORM_ERROR]:
            "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
        }
      }
    }
  }

  return (
    <Flex h="100%" w="100%" justify="center" align="center">
      <VStack spacing="8" w="full" px="40" pl="20" align="flex-start">
        <Heading marginBottom="2" color="#240070">
          {" "}
          Sign in to your account{" "}
        </Heading>
        <Form
          schema={Login}
          initialValues={{ email: "", password: "" }}
          onSubmit={onSubmit}
          wrapProps={{ align: "flex-start", spacing: 4 }}
        >
          <InputField name="email" />
          <InputField name="password" />

          <Link href="/forgot-password">
            <Text cursor="pointer">Forgot Password?</Text>
          </Link>
          <Button type="submit" width="100%" colorScheme="teal">
            LogIn
          </Button>
        </Form>

        <Divider borderColor="#adadad" />

        <Button onClick={onOpen} cursor="pointer" width="100%" colorScheme="pink">
          Sign Up
        </Button>
      </VStack>

      <SignUpForm modalProps={{ isOpen, onOpen, onClose }} />
    </Flex>
  )
}

export default LoginForm
