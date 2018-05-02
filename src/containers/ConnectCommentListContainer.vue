<script>
import CommentListNew from '@/components/CommentListNew'
import { connector } from '@/store'

export default connector.connect({
  mapStateToProps: {
    comments: (state) => state.comments
  },
  mapActionToProps: {
    fetch: 'fetchComments'
  }
})(CommentListNew)
</script>
