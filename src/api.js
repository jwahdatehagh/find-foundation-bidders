import { createClient } from '@urql/core'

const APIURL = 'https://api.thegraph.com/subgraphs/name/f8n/fnd'

const client = createClient({
  url: APIURL,
})

export const fetchBids = async address => {
  const query = `{
    nftMarketBids(
      where: {
        seller: "${address.toLowerCase()}"
      }
      orderBy: datePlaced
      first: 1000
    ) {
      id
      amountInETH
      datePlaced
      transactionHashPlaced
      bidder {
        id
      }
      nft {
        id
        tokenIPFSPath
        creator {
          id
        }
      }
    }
  }`

  const response = await client.query(query).toPromise()

  return response?.data?.nftMarketBids || []
}
