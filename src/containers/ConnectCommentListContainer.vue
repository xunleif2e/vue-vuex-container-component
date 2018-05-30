<script>
import CommentListNew from '@/components/CommentListNew'
import { connector } from '@/store'

export default connector.connect({
  mapStateToProps: {
    comments: (state) => state.comments
  },
  mapDispatchToProps: {
    fetch: 'fetchComments'
  }
})(CommentListNew)
</script>
