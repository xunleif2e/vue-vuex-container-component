import Vue from 'vue'
import Vuex from 'vuex'
import VuexConnector from '@xunlei/vuex-connector'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    comments: []
  },

  mutations: {
    setComments (state, comments) {
      state.comments = comments
    }
  },

  actions: {
    fetchComments ({ commit }) {
      setTimeout(() => {
        commit('setComments', [
          {
            body: '霸气侧漏',
            author: '雷叔',
            id: 1123
          },
          {
            body: '机智如我',
            author: '蕾妹',
            id: 1124
          }
        ])
      })
    }
  }
})

export const connector = new VuexConnector(store)

export default store
