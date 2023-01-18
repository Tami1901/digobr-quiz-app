import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  Button,
  ModalFooter,
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { Form, FORM_ERROR, InputField } from "chakra-form"
import { useRouter } from "next/router"
import LabeledTextField from "src/core/components/LabeledTextField"
import signup from "../mutations/signup"
import { Signup } from "../validations"

export const SignUpForm = ({ modalProps }) => {
  const router = useRouter()

  const [signupMutation] = useMutation(signup)
  const client = useQueryClient()

  return (
    <Modal {...modalProps}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create account</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box py="4" px="8" width="100%">
            <Form
              schema={Signup}
              initialValues={{ name: "", email: "", password: "" }}
              onSubmit={async (values) => {
                try {
                  await signupMutation(values)
                  await client.invalidateQueries()

                  await router.push(Routes.Home())
                } catch (error: any) {
                  if (error.code === "P2002" && error.meta?.target?.includes("email")) {
                    // This error comes from Prisma
                    return { email: "This email is already being used" }
                  } else {
                    return { [FORM_ERROR]: error.toString() }
                  }
                }
              }}
            >
              <InputField name="name" width="100%" />
              <InputField name="email" />
              <InputField name="password" mb="6" />
              <Button type="submit" width="100%" colorScheme="blue">
                Create Account
              </Button>
            </Form>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={modalProps.onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
