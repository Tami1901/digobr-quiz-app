import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  ModalFooter,
  Button,
  Spinner,
  Text,
} from "@chakra-ui/react"

export const ExplainModal = ({ isOpen, onClose, isLoading, explanation }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>AI Explanation</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>{isLoading ? <Spinner /> : <Text>{explanation}</Text>}</Box>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
