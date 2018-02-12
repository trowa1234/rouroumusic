//state拿到数据后通常会在getters中做映射，做一个简单的包装，组件就从这个getters中取数据

//把state.singer曝露出去
export const singer = state => state.singer     //跟下面语句效果一样，箭头函数更简洁
// export const singer = function(state){return state.singer}
