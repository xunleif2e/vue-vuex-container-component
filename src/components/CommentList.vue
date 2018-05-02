<template>
  <ul>
    <li v-for="comment in comments"
      :key="comment.id"
    >
      {{comment.body}}—{{comment.author}}
    </li>
  </ul>
</template>

<script>
export default {
  name: 'CommentList',

  computed: {
    comments () {
      return this.$store.state.comments
    }
  },

  mounted () {
    this.$store.dispatch('fetchComments')
  }
}
</script>
