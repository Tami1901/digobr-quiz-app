import { Configuration, OpenAIApi } from "openai"

const Text = (props) => {
  console.log(props)
  return <div>Test</div>
}

export const getServerSideProps = async (context) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
  const openai = new OpenAIApi(configuration)
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: "Why I must go to college?",
  })

  console.log(completion.data.choices[0]?.text)

  return {
    props: completion.data,
  }
}

export default Text
