
# 致敬 React: 为 Vue 引入容器组件和展示组件

如果你使用过 Redux 开发 React，你一定听过 容器组件（Smart/Container Components） 或 展示组件（Dumb/Presentational Components），这样划分有什么样的好处，我们能否能借鉴这种划分方式来编写 Vue 代码呢，今天我会演示为什么我们应该采取这种模式，以及如何在 Vue 中编写这两种组件。

## Table Of Contents

<!-- TOC -->

- [Table Of Contents](#table-of-contents)
- [为什么要使用容器组件?](#为什么要使用容器组件)
    - [components/CommentList.vue](#componentscommentlistvue)
    - [store/index.js](#storeindexjs)
- [什么是容器组件](#什么是容器组件)
- [容器组件 和 展示组件 的区别](#容器组件-和-展示组件-的区别)
- [用 容器组件/展示组件 模式改造上面的例子](#用-容器组件展示组件-模式改造上面的例子)
    - [概要设计](#概要设计)
        - [展示组件](#展示组件)
        - [容器组件](#容器组件)
    - [编码实现](#编码实现)
    - [components/CommentListNew.vue](#componentscommentlistnewvue)
    - [containers/CommentListContainer.vue](#containerscommentlistcontainervue)
- [使用 @xunlei/vuex-connector 实现容器组件](#使用-xunleivuex-connector-实现容器组件)
    - [手动实现容器组件存在的不足](#手动实现容器组件存在的不足)
        - [代码比较繁琐](#代码比较繁琐)
        - [无法透传其他 props 给展示组件](#无法透传其他-props-给展示组件)
        - [容器组件无法统一进行优化](#容器组件无法统一进行优化)
        - [无法控制展示组件不去获取 store](#无法控制展示组件不去获取-store)
    - [使用 @xunlei/vuex-connector](#使用-xunleivuex-connector)
        - [代码非常简洁](#代码非常简洁)
            - [comonents/ConnectCommentListContainer.vue](#comonentsconnectcommentlistcontainervue)
            - [问题来了，connector 是什么？](#问题来了connector-是什么)
        - [支持透传其他 props 给展示组件](#支持透传其他-props-给展示组件)
        - [统一封装方便后续统一优化](#统一封装方便后续统一优化)
        - [可以控制展示组件无法直接与 store 通信](#可以控制展示组件无法直接与-store-通信)
- [引入容器组件/展示组件模式带来的好处](#引入容器组件展示组件模式带来的好处)
    - [可复用性](#可复用性)
    - [健壮性](#健壮性)
        - [Vue 组件 props 验证](#vue-组件-props-验证)
        - [TypeScript 类型系统](#typescript-类型系统)
    - [可测试性](#可测试性)
- [引入容器组件/展示组件模式带来的限制](#引入容器组件展示组件模式带来的限制)
    - [学习和开发成本](#学习和开发成本)
- [延伸阅读](#延伸阅读)
- [代码示例](#代码示例)

<!-- /TOC -->

## 为什么要使用容器组件?

假如我们要写一个组件来展示评论，在没听过容器组件之前，我们的代码一般都是这样写的：

### components/CommentList.vue

```html
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
```

### store/index.js

```js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    comments: [],
  },

  mutations: {
    setComments(state, comments) {
      state.comments = comments;
    },
  },

  actions: {
    fetchComments({commit}) {
      setTimeout(() => {
        commit('setComments', [
          {
            body: '霸气侧漏',
            author: '雷叔',
            id: 1123,
          },
          {
            body: '机智如我',
            author: '蕾妹',
            id: 1124,
          },
        ]);
      });
    },
  },
});
export default store;
```

这样写看起来理所当然，有没有可以什么问题，或者可以优化的地方呢？

有一个很显而易见的问题，由于 CommentList.vue 与 项目的 Vuex store 产生了耦合，导致脱离当前的项目很难复用。

有没有更好的组件的组织方式，可以解决这个问题呢？是时候了解下 React 社区的容器组件的概念了。

## 什么是容器组件

在 React.js Conf 2015 ，有一个 [Making your app fast with high-performance components](https://www.youtube.com/watch?v=KYzlpRvWZ6c&t=1351) 的主题介绍了容器组件。

![什么是容器组件](https://upload-images.jianshu.io/upload_images/64173-ccc810bbb968078e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

容器组件专门负责和 store 通信，把数据通过 props 传递给普通的展示组件，展示组件如果想发起数据的更新，也是通过容器组件通过 props 传递的回调函数来告诉 store。

由于展示组件不再直接和 store 耦合，而是通过 props 接口来定义自己所需的数据和方法，使得展示组件的可复用性会更高。

## 容器组件 和 展示组件 的区别

|                | 展示组件                   | 容器组件                           |
| -------------- | -------------------------- | ---------------------------------- |
| 作用           | 描述如何展现（骨架、样式） | 描述如何运行（数据获取、状态更新） |
| 直接使用 store | 否                         | 是                                 |
| 数据来源       | props                      | 监听 store state                   |
| 数据修改       | 从 props 调用回调函数      | 向 store 派发 actions              |

> 来自 Redux 文档 https://cn.redux.js.org/docs/basics/UsageWithReact.html

## 用 容器组件/展示组件 模式改造上面的例子

针对最初的例子，如何快速按照这种模式来划分组件呢？我们主要针对 CommentList.vue 进行拆分,首先是基本的概要设计：

### 概要设计

#### 展示组件

* **`components/CommentListNew.vue`** 这是一个新的评论展示组件，用于展示评论
  * `comments: Array` prop 接收以 `{ id, author, body }` 形式显示的 comment 项数组。
  * `fetch()` 接收更新评论数据的方法

展示组件只定义外观并不关心数据来源和如何改变。传入什么就渲染什么。

comments、fetch 等这些 props 并不关心背后是否是由 Vuex 提供的，你可以使用 Vuex，或者其他状态管理库，甚至是一个 EventBus，都可以复用这些展示组件。

同时，可以利用 props 的类型和验证来约束传入的内容，比如验证传入的 comments 是否是一个含有指定字段的对象，这在之前混合组件的情况是下是没有的，提高了代码的健壮性。

#### 容器组件

* **`containers/CommentListContainer.vue`** 将 CommentListNew 组件连接到 store

容器组件可以将 store 对应的 state 或者 action 等封装传入展示组件。

### 编码实现

> Talk is cheap, show me the code!

### components/CommentListNew.vue

这个文件不再依赖 store，改为从 props 传递。

值得注意到是 comments 和 fetch 分别定义了 type 、default 和 validator，用以定义和验证 props。

```html
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
  name: 'CommentListNew',

  props: {
    comments: {
      type: Array,
      default () {
        return []
      },
      validator (comments) {
        return comments.every(comment =>
          'body' in comment &&
          'author' in comment &&
          'id' in comment
        )
      }
    },
    fetch: {
      type: Function,
      default: () => {}
    }
  },

  mounted () {
    this.fetch()
  }
}
</script>
```

### containers/CommentListContainer.vue

容器组件的职责

* 通过 computed 来获取到状态更新，传递给展示组件
* 通过 methods 定义回调函数，回调函数内部调用 store 的 dispatch 方法，传递给展示组件

```html
<template>
  <CommentList
    :comments="comments"
    :fetch="fetchComments"
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
```

## 使用 @xunlei/vuex-connector 实现容器组件

上面演示的容器组件的代码非常简单，实际上如果直接投入生产环境，会产生一些问题。

### 手动实现容器组件存在的不足

#### 代码比较繁琐

在上面的例子中，每次传递一个 state 都要定义一个 computed，每传递一个 mutation 或者 action 都需要定一个方法，而且还要注意这个方法的参数要透传过去，同时还要处理返回值，比如异步的 action 需要返回 promise 的时候，定义的这个 method 也得把 action 的返回值返回出去。

#### 无法透传其他 props 给展示组件

比如展示组件新增了一个 prop 叫做 type，可以传递一个评论的类型，用来区分是热门还是最新，如果用上面的容器实现方式，首先需要在容器组件这层新增一个 prop 叫做 type 接受外部传来的参数，然后在展示组件内部同样定义一个 叫做 type 的 prop，然后才能传递下去。

需要透传的 prop 必须定义两遍，增加了维护的成本。

```html
<CommentListContainer type="热门"></CommentListContainer>
```

```html
  <CommentList
    :fetch="fetchComments"
    :comments="comments"
    :type="type"
  ></CommentList>
```

#### 容器组件无法统一进行优化

每一个手动实现的容器组件实质上代码逻辑非常近似，但是没有经过同一层封装，如果目前实现的容器组件存在一些性能优化的地方，需要每个容器组件都进行统一的修改。

#### 无法控制展示组件不去获取 store

因为容器组件是通过 this.$store 获取 store 的，展示组件内部实质上也可以直接跟 store 通信，如果没有约束，很难统一要求展示组件不得直接和 store 通信。

### 使用 @xunlei/vuex-connector

@xunlei/vuex-connector 借鉴了 react redux 的 connect 方法，在 vuex 基础上进行的开发。

有以下几个特点

#### 代码非常简洁

下面是上面例子中手动实现的容器组件的改造版本：

##### comonents/ConnectCommentListContainer.vue

```html
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
```

通过 connector 的 connnect 方法，传入要映射的配置，支持 mapStateToProps, mapGettersToProps, mapDispatchToProps, mapCommitToProps 这四种，每一种都是只要配置一个简单的 map 函数，或者字符串即可。

然后在返回的函数中传入要连接的展示组件，是不是非常的简洁，同时借鉴了 redux 优雅的函数式风格。

##### 问题来了，connector 是什么？

connector 实际上是一个能获取到 store 实例的连接器，可以在初始化 vuex store 的时候进行初始化。

```js
import Vue from 'vue';
import Vuex from 'vuex';
import VuexConnector from '@xunlei/vuex-connector';

Vue.use(Vuex);

const store = new Vuex.Store({
  // your store
});

export const connector = new VuexConnector(store);

export default store;
```

一个 Vue 程序实际上只需要初始化一次即可。

#### 支持透传其他 props 给展示组件

VuexConnector 实现的时候采用了函数式组件( `functional: true` )

函数式组件是无状态 (没有响应式数据)，无实例 (没有 this 上下文)。

在作为包装组件时函数式组件非常有用，比如，当你需要做这些时：

- 程序化地在多个组件中选择一个
- 在将 children, props, data 传递给子组件之前操作它们。

另外，函数式组件只是一个函数，所以渲染开销也低很多。然而，对持久化实例的缺乏也意味着函数式组件不会出现在 Vue devtools 的组件树里。

因此需要透传的 props 可以直接透传，需要通过 map 方式从 store 里进行获取的 props 直接会根据配置生成。

#### 统一封装方便后续统一优化

VuexConnector.connect 方法将本来需要重复做的事情进行了抽象，也带来了后期进行统一优化和升级的便利。

#### 可以控制展示组件无法直接与 store 通信

VuexConnector 不依赖 this.$store，而是依赖初始化传入的 store 实例，容器组件可以用 connect 将展示组件与 store 进行连接。

由于不依赖 this.$store，我们在程序入口 new Vue 的时候，就不需要传入 store 实例了。

比如，之前我们是通过下面的方式进行初始化：

```js
import Vue from 'vue';
import App from './App';
import store from './store';

new Vue({
  el: '#app',
  components: {App},
  template: '<App/>',
  store,
});
```

使用了 VuexConnector 之后，在最初 new Vue 的时候就不需要也最好不要传递 store 了，这样就避免了 this.$store 泛滥导致代码耦合的问题。


## 引入容器组件/展示组件模式带来的好处

### 可复用性

容器组件/展示组件的划分，采用了单一职责原则的设计模式，容器组件专门负责和 store 通信，展示组件只负责展示，解除了组件的耦合，可以带来更好的可复用性。

### 健壮性

由于展示组件和容器组件是通过 prop 这种接口来连接，可以利用 props 的校验来增强代码的可靠性，混合的组件就没有这种好处。

另外对 props 的校验可以采取一下几种方式：

#### Vue 组件 props 验证

可以验证prop的类型，默认可以校验是否是以下类型：

- String
- Number
- Boolean
- Function
- Object
- Array
- Symbol

如果你的prop是类的一个实例，type 也可以是一个自定义构造器函数，使用 instanceof 检测。

如果还是不满足需求，可以自定义验证函数：

```js
// 自定义验证函数
propF: {
  validator: function (value) {
    return value > 10
  }
}
```

#### TypeScript 类型系统


Vue 组件 props 验证对于对象或者其他复杂的类型校验还是不太友好，所以很多人也推荐大家的prop尽量采取简单类型，不过如果你有在用 TypeScript 开发 Vue 应用，可以利用 TypeScript 静态类型检查来声明你的props。

```js
@Component
export default class Hello extends Vue {
  @Prop
  info: IHelloInfo; // 这里可以用你自定义的 interface
}
```

### 可测试性

由于组件做的事情更少了，使得测试也会变得容易。

容器组件不用关心UI的展示，只关心数据和更新。

展示组件只是呈现传入的props，写单元测试的时候也非常容易mock数据层。


## 引入容器组件/展示组件模式带来的限制

### 学习和开发成本

因为容器组件/展示组件的拆分，初期会增加一些学习成本，不过当你看完这篇文章，基本上也就入门了。

在开发的时候，由于需要封装一个容器，包装一些数据和接口给展示组件，会增加一些工作量， @xunlei/vuex-connector 通过配置的方式可以减轻不少你的工作量。

另外，在展示组件内对 props 的声明也会带来少量的工作。

总体来说，引入容器组件/展示组件模式投入产出比还是比较值得的。


## 延伸阅读

- Redux 文档 https://cn.redux.js.org/docs/basics/UsageWithReact.html
- Making your app fast with high-performance components https://www.youtube.com/watch?v=KYzlpRvWZ6c&t=1351

## 代码示例
