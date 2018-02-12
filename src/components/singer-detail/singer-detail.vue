<template>
    <!-- 使用transition标签实现页面跳转动画 -->
    <transition name="slide">
        <div class="singer-detail"></div>
    </transition>
</template>

<script type="text/ecmascript-6">
//vuex提供的语法糖.这里引入的是mapGetters，所以就要在computed计算中添加
import {mapGetters} from 'vuex'

export default {
    name: "singer-detail",
    computed:{
        //getters对应的就是计算属性computed，需要注意的是mapGetters()中是数组
        ...mapGetters([
            //在这里引入singer，注意是字符串形式，这个singer就是getters中通过映射state.singer曝露出来的
            'singer'
        ])
    },
    created(){
        //通过上面的操作在本页面直接使用this.singer就可以获取到state中singer的数据
        console.log(this.singer);
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.singer-detail {
    position: fixed;
    z-index: 100;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: @body-bg-grayer;
}
.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s;
}
.slide-enter,
.slide-leave-to {
    transform: translate3d(100%, 0, 0);
}
</style>