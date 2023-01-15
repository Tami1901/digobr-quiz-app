import { BlitzPage } from "@blitzjs/next"
import Layout from "src/core/layouts/Layout"
import { LoginForm } from "src/auth/components/LoginForm"
import { useRouter } from "next/router"
import { Box, SimpleGrid, VStack } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"

const LoginPage: BlitzPage = () => {
  const router = useRouter()
  const client = useQueryClient()

  const headerDeljnina = "148px"

  return (
    <Layout title="Login" removeMarginTop>
      <SimpleGrid
        columns={2}
        minH={`calc(100vh - ${headerDeljnina})`}
        maxH={`calc(100vh - ${headerDeljnina})`}
        paddingRight="12"
      >
        <LoginForm
          onSuccess={async (_user) => {
            await client.invalidateQueries()

            const next = router.query.next ? decodeURIComponent(router.query.next as string) : "/"
            return router.push(next)
          }}
        />

        <Box
          // marginTop="-"
          backgroundImage="/img-faq.png"
          width="100%"
          height="100%"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          backgroundSize="contain"
        />
      </SimpleGrid>
    </Layout>
  )
}

LoginPage.redirectAuthenticatedTo = "/"

export default LoginPage
