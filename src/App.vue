<template>
  <div class="wrapper">
    <h1>容器组件-展示组件模式</h1>

    <h2>没有容器组件</h2>
    <CommentList type="热门"></CommentList>

    <h2>手动实现容器组件与store连接</h2>
    <CommentListContainer type="热门"></CommentListContainer>

    <h2>通过 @xunlei/vuex-connector 实现容器组件</h2>
    <ConnectCommentListContainer type="热门"></ConnectCommentListContainer>
  </div>
</template>

<script>
import CommentList from '@/components/CommentList';
import CommentListContainer from '@/containers/CommentListContainer';
import ConnectCommentListContainer from '@/containers/ConnectCommentListContainer';

export default {
  components: {
    CommentList,
    CommentListContainer,
    ConnectCommentListContainer,
  },
};
</script>

<style>
body {
  font-family: 'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #34495e;
  background-color: #fff;
  margin: 0;
}

.wrapper {
  width: 320px;
  margin: 0 auto;
}

h1 {
  font-weight: 300;
  margin: 30px 0;
  font-size: 2em;
}

h2 {
  color: #42b983;
  font-size: 1.5em;
  font-weight: 400;
  margin: 0;
  padding: 0.5em 0;
}
</style>
