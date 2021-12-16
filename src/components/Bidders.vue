<template>
  <h1>Find my Foundation Bidders</h1>

  <form action="#" @submit.stop.prevent="fetchBids">
    <input type="text" v-model="seller" name="seller" placeholder="Seller Address (0x...)">
    <button type="submit">Search</button>
  </form>

  <p v-if="loading">Loading...</p>
  <p v-else-if="! bids.length">No bidders found</p>
  <article v-else>
    <div class="actions">
      Found {{ bids.length }} bids from {{ bidders.length }} bidders.
      <button @click="download">Download as CSV</button>
    </div>
    <ul>
      <li
        v-for="bidder in bidders"
        :key="bidder.id"
      >
        <p>
          {{ bidder.bids.length }} Bids by
          <a :href="`https://etherscan.io/address/${bidder.id}`" target="_blank">
            {{ bidder.id }}
          </a>
        </p>
        <p>Earliest: <Bid :bid="bidder.earliestBid" value date tx /></p>
        <p>Latest: <Bid :bid="bidder.latestBid" value date tx /></p>
        <p>Highest:  <Bid :bid="bidder.highestBid" value date tx /></p>
        <p class="bids">
          on:
          <Bid
            v-for="bid in bidder.bids"
            :key="bid.id"
            :bid="bid"
          />
        </p>
      </li>
    </ul>

    <!-- <h1>Bids</h1>
    <ul>
      <li
        v-for="bid in bids"
        :key="bid.id"
      >
        <p>
          <a :href="`https://etherscan.io/address/${bid.bidder.id}`">
            By {{ bid.bidder.id }}
          </a>
        </p>
        <p>
          <a :href="`https://ipfs.io/ipfs/${bid.nft.tokenIPFSPath}`" target="_blank">
            NFT: {{ bid.nft.id }}
          </a>
        </p>
        <p>
          <a :href="`https://etherscan.io/tx/${bid.transactionHashPlaced}`">
            Transaction on Etherscan
          </a>
        </p>
        <p>Amount: {{ bid.amountInETH }} ETH</p>
      </li>
    </ul> -->
  </article>
</template>

<script>
import { fetchBids } from '../api'
import { arrayToCsv } from '../helpers/csv'
import { format } from '../helpers/date'
import { downloadBlob } from '../helpers/download'
import Bid from './Bid.vue'
const params = new URLSearchParams(window.location.search)

export default {
  components: {
    Bid,
  },

  data () {
    const seller = params.get('seller')

    return {
      loading: false,
      seller,
      bids: [],
    }
  },

  computed: {
    bidders () {
      const bidders = this.bids.reduce((bidders, bid) => {
        if (! bidders[bid.bidder.id]) {
          bidders[bid.bidder.id] = {
            id: bid.bidder.id,
            earliestBid: bid,
            latestBid: bid,
            highestBid: bid,
            bids: [],
          }
        }

        bidders[bid.bidder.id].bids.push(bid)

        // Add earlier bid
        if (bid.datePlaced < bidders[bid.bidder.id].earliestBid.datePlaced) {
          bidders[bid.bidder.id].earliestBid = bid
        }

        // Add later bid
        if (bid.datePlaced > bidders[bid.bidder.id].latestBid.datePlaced) {
          bidders[bid.bidder.id].latestBid = bid
        }

        // Add higher bid
        if (parseFloat(bid.amountInETH) > parseFloat(bidders[bid.bidder.id].highestBid.amountInETH)) {
          bidders[bid.bidder.id].highestBid = bid
        }

        return bidders
      }, {})

      return Object.values(bidders)
        .sort((a, b) => a.bids.length > b.bids.length ? -1 : 1)
        .filter(i => !! i.bids.length)
    }
  },

  created () {
    if (this.seller) this.fetchBids()
  },

  methods: {
    async fetchBids (_, seller = this.seller.toString()) {
      this.loading = true

      // fetch bids
      this.bids = await fetchBids(seller)

      // update seller query param
      params.set('seller', seller);
      history.replaceState(null, null, "?"+params.toString())

      this.loading = false
    },

    download () {
      const csv = arrayToCsv(
        ([
          [
            'address', 'bids', 'earliest_date', 'earliest_amount',
            'latest_date', 'latest_amount', 'highest_bid'
          ]
        ]).concat(
          this.bidders.map(b => [
            b.id,
            b.bids.length,
            format(b.earliestBid.datePlaced),
            parseFloat(b.earliestBid.amountInETH),
            format(b.latestBid.datePlaced),
            parseFloat(b.latestBid.amountInETH),
            parseFloat(b.highestBid.amountInETH),
          ])
        )
      )

      downloadBlob(csv, `bidders-${this.seller}.csv`)
    }
  },
}
</script>

<style scoped>
  h1 {
    margin-top: 0;
  }
  form {
    margin-bottom: 1rem;
  }
  input {
    width: 25rem;
  }
  article {
    text-align: left;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li {
    margin-bottom: 1rem;
  }
  p {
    margin: 0;
  }

  .bids {
    font-size: 0.8em;
  }

  .bid {
    display: inline-block;
    margin-right: 0.1em;
  }
  .bid:not(:last-child):after {
    content: ','
  }

  .actions {
    margin: 1rem 0;
  }
</style>
