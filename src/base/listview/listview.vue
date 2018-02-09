<template>
    <!-- 通过父级传入歌手列表数据到本组件(listview)，再由本组件传向scroll组件中计算滚动距离-->
    <scroll class="listview" :data="data">
        <ul>
            <!-- 渲染数据：第一层，title和items -->
            <li v-for="(group,index) in data" class="list-group" :key="index">
                <!-- 分类的名称 -->
                <h2 class="list-group-title">{{group.title}}</h2>
                <ul>
                    <!-- 渲染歌手数据:第二层数据，items中的name和avatar -->
                    <li v-for="(item,index) in group.items" class="list-group-item" :key="index">
                        <img class="avatar" v-lazy="item.avatar" />
                        <span class="name" v-html="item.name"></span>
                    </li>
                </ul>
            </li>
        </ul>
        <div class="list-shortcut">
            <ul>
                <li v-for="(item,index) in shortcutList" class="item" :key="index">{{item}}</li>
            </ul>
        </div>
    </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from "@/base/scroll/scroll";

export default {
    name: "listview",
    props: {
        data: {
            type: Array,
            default: []
        }
    },
    computed: {
        // 获取右侧入口文字
        shortcutList() {
            //歌手列表数据使用map()方法。map() 方法返回一个新数组，数组中的元素为原始数组元素调用函数处理后的值。
            return this.data.map(group => {
                //获取title属性并且只去这个值的第一个字符
                return group.title.slice(0, 1);
            });
        }
    },
    components: {
        Scroll
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.listview {
    font-size: @font-size-medium-x;
    position: relative;
    .list-group {
        .list-group-title {
            font-size: @font-size-medium;
            line-height: 30px;
            background: rgba(97, 96, 96, 0.5);
            padding-left: 20px;
            color: @text-color-white;
        }
        .list-group-item {
            display: flex;
            padding: 10px 20px;
            .avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                flex: 0 0 60px;
                margin-right: 20px;
            }
            .name {
                flex: 1;
                line-height: 60px;
            }
        }
    }
    .list-shortcut {
        position: absolute;
        right: 5px;
        top: 50px;
        padding: 16px 2px;
        background: rgba(19, 18, 18, 0.5);
        border-radius: 10px;
        .item{
            text-align: center;font-size: @font-size-medium;color: @text-color-white;line-height: 20px;
        }
    }
}
</style>