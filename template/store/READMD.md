store 的写和 nuxt 保持一致，以便开发者容易迁移

参考链接：https://nuxtjs.org/guide/vuex-store


1. 采用统一入口的方法，由 `store/index.js` 作为入口对外输出所有 store

```javascript
import Vuex from 'vuex';

const createStore = () => {
    return new Vuex.Store({
        state: {
            counter: 0
        }
    });
};

export default createStore;
```

2. 每个文件作为一个模块，由 lavas 统一处理，支持嵌套

```javascript
// appshell.js
export const state = () => {
    return {
        counter: 0
    };
};
```
