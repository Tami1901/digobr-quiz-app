import { ErrorFallbackProps, ErrorComponent, ErrorBoundary, AppProps } from "@blitzjs/next"
import { AuthenticationError, AuthorizationError } from "blitz"
import React, { Suspense } from "react"
import { withBlitz } from "src/blitz-client"

import { ChakraProvider, Spinner } from "@chakra-ui/react"
import { ConfirmContextProvider } from "chakra-confirm"

function RootErrorFallback({ error }: ErrorFallbackProps) {
  if (error instanceof AuthenticationError) {
    return <div>Error: You are not authenticated</div>
  } else if (error instanceof AuthorizationError) {
    return (
      <ErrorComponent
        statusCode={error.statusCode}
        title="Sorry, you are not authorized to access this"
      />
    )
  } else {
    return (
      <ErrorComponent
        statusCode={(error as any)?.statusCode || 400}
        title={error.message || error.name}
      />
    )
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)
  return (
    <ChakraProvider>
      <ConfirmContextProvider>
        <ErrorBoundary FallbackComponent={RootErrorFallback}>
          <Suspense fallback={<Spinner />}>{getLayout(<Component {...pageProps} />)}</Suspense>
        </ErrorBoundary>
      </ConfirmContextProvider>
    </ChakraProvider>
  )
}

export default withBlitz(MyApp)
