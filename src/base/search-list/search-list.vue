<template>
    <div class="search-list" v-show="searches.length">
        <!-- 使用动画组，在删除歌曲是添加动画效果。tag=ul就是把transition-group标签渲染成ul -->
        <transition-group name="list" tag="ul">
            <!-- 绑定点击事件，是搜索历史的字符可以直接添加至搜索框里面 -->
            <!-- 注意由于使用了动画组，所以必须绑定key值，且key不能为index值，它会重新渲染dom是动画无效 -->
            <li @click="selectItem(item)" class="search-item" v-for="item in searches" :key="item">
                <span class="text">{{item}}</span>
                <!-- 给“×”图标绑定点击事件 -->
                <span class="icon" @click.stop="deleteOne(item)">
                    <i class="iconfont icon-delete"></i>
                </span>
            </li>
        </transition-group>
    </div>
</template>

<script type="text/ecmascript-6">
export default {
    name: "search-list",
    props: {
        searches: {
            type: Array,
            default: []
        }
    },
    methods: {
        //搜索历史列表点击事件
        selectItem(item) {
            //只负责把事件派发出去
            this.$emit("select", item);
        },
        //点击“×”图标
        deleteOne(item) {
            //只负责把事件派发出去
            this.$emit("delete", item);
        }
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.search-list {
    .search-item {
        display: flex;
        align-items: center;
        height: 40px;
        overflow: hidden;
        &.list-enter-active,
        &.list-leave-active {
            transition: all 0.2s linear;
        }
        &.list-enter,
        &.list-leave-to {
            transform: translate3d(-100%, 0, 0);
            height: 0;
        }
        .text {
            flex: 1;
            font-size: @font-size-medium;
            color: @text-color-lighter;
        }
        .icon {
            .extend-click();
            .iconfont {
                font-size: 18px;
                color: @text-color-lighter;
            }
        }
    }
}
</style>