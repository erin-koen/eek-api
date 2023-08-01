import { VercelRequest, VercelResponse } from '@vercel/node';
import { gql, GraphQLClient } from 'graphql-request'
import { loadEnv } from '../utils/loadEnv';
import { formatUnits } from 'ethers';

const endpoint = loadEnv('TALLY_URL')
const apiKey = loadEnv('TALLY_API_KEY')
const key = "Api-key"
console.log({ endpoint })
interface responseFormat {

  "governanceBySlug": {
    "delegates":
    {
      "participation": {
        "stats": {
          "votingPower": {
            "net": string
          }
        },
        "account": {
          "name": string,
          "address": string
        }
      }
    }[],
  }
}



const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    [key]: apiKey
  }
}
)



export default async (request: VercelRequest, response: VercelResponse) => {

  const query = gql`
    query {governanceBySlug(slug: "uniswap") {
        delegates(sort: {field: VOTING_WEIGHT, order: DESC}, pagination: {limit: 100}) {
            participation {
                stats {
                    votingPower {
                        net
                    }
                }
                account {
                    name
                    address
                }
            }
        }
    }}
`

  const data = await graphQLClient.request<responseFormat>(query)

  const formattedData: { name: string, address: string, votes: number }[] = data.governanceBySlug.delegates.map((item) => {

    return {
      name: item.participation.account.name,
      address: item.participation.account.address,
      votes: Number(formatUnits(item.participation.stats.votingPower.net, 18))
    }

  })

  // response.send(formattedData)
  response.send(formattedData)

};
