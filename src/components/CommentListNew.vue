<template>
  <ul>
    {{ type }} 评论
    <li v-for="comment in comments"
      :key="comment.id"
    >
      {{comment.body}}—{{comment.author}}
    </li>
  </ul>
</template>

<script>
export default {
  name: 'CommentListNew',

  props: {
    comments: {
      type: Array,
      default() {
        return [];
      },
      validator(comments) {
        return comments.every(
          comment => 'body' in comment && 'author' in comment && 'id' in comment
        );
      },
    },
    fetch: {
      type: Function,
      default: () => {},
    },
    type: {
      type: String,
    },
  },

  mounted() {
    this.fetch();
  },
};
</script>
