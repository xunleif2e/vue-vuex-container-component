<template>
  <CommentList
    :fetch="fetchComments"
    :comments="comments"
  ></CommentList>
</template>

<script>
import CommentList from '@/components/CommentListNew'

export default {
  name: 'CommentListContainer',

  components: {
    CommentList
  },

  computed: {
    comments () {
      return this.$store.state.comments
    }
  },

  methods: {
    fetchComments () {
      return this.$store.dispatch('fetchComments')
    }
  }
}
</script>
