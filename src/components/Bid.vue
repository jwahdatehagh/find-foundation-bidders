<template>
<span class="bid">
  <a
    :href="`https://opensea.io/assets/${contract}/${id}`"
    target="_blank"
  >#{{ id }}</a>
  <span v-if="value"> for {{ bid.amountInETH }} ETH </span>
  <span v-if="date"> on {{ formattedDate }}</span>
  <span v-if="tx">
    (<a :href="`https://etherscan.io/tx/${bid.transactionHashPlaced}`" target="_blank">tx</a>)
  </span>
</span>
</template>

<script>
export default {
  props: {
    bid: Object,
    value: Boolean,
    date: Boolean,
    tx: Boolean,
  },

  computed: {
    foundationNFTId () {
      return this.bid.nft.id.split('-')
    },

    contract () {
      return this.foundationNFTId[0]
    },

    id () {
      return this.foundationNFTId[1]
    },

    formattedDate () {
      return (new Date(this.bid.datePlaced * 1000)).toLocaleDateString()
    },
  },
}
</script>
