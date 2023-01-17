import { ChevronRightIcon } from "@chakra-ui/icons"
import { Box, CircularProgress, Divider, Heading } from "@chakra-ui/react"

type CategoryProps = {
  name: string
  isSelect?: boolean
  color?: string
  isLast?: boolean
  isFirst?: boolean
}

export const Category = ({
  name,
  isSelect = false,
  color,
  isLast = false,
  isFirst = false,
}: CategoryProps) => {
  return (
    <>
      <Box
        display="flex"
        width="100%"
        height="100%"
        alignItems="center"
        borderTopLeftRadius={isFirst ? "2xl" : ""}
        borderBottomLeftRadius={isLast ? "2xl" : ""}
        px={!isSelect ? "40px" : ""}
        minW="260px"
        backgroundColor={isSelect ? `${color}.200` : "white"}
      >
        {isSelect && <ChevronRightIcon width="40px" height="40px" color={`${color}.600`} />}
        <CircularProgress />
        <Heading marginLeft={4} size="md">
          {name}
        </Heading>
      </Box>
      {!isLast && <Divider />}
    </>
  )
}
