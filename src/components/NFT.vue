<template>
<span class="nft">
  <a
    :href="`https://opensea.io/assets/${contract}/${id}`"
    target="_blank"
  >#{{ id }}</a>
  <span v-if="count">
    ({{ nft.bids.length }}x)
  </span>
</span>
</template>

<script>import { format } from '../helpers/date'

export default {
  props: {
    nft: Object,
    count: Boolean,
  },

  computed: {
    foundationNFTId () {
      return this.nft.id.split('-')
    },

    contract () {
      return this.foundationNFTId[0]
    },

    id () {
      return this.foundationNFTId[1]
    },
  },
}
</script>
