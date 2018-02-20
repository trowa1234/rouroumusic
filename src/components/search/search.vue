<template>
    <div class="search">
        <div class="search-box-wrapper">
            <!-- 接收search-box组件派发处理的query事件 -->
            <search-box ref="searchBox" @query="onQueryChange"></search-box>
        </div>
        <!-- 当搜索栏无内容时显示热门搜索 -->
        <div class="shortcut-wrapper" ref="shortcutWrapper" v-show="!query">
            <!-- 使用scroll组件使热门搜索和搜索历史可以滚动 -->
            <scroll class="shortcut" :data="shortcut" ref="shortcut">
                <!-- 注意scroll组件里面只能有1个子元素来滚动，所以需要包裹1层div -->
                <div>
                    <div class="hotkey">
                        <h2 class="tit">热门搜索</h2>
                        <ul>
                            <!-- 添加点击是就把关键词作为参数传入 -->
                            <li @click="addQuery(item.k)" class="item" v-for="(item,index) in hotKey" :key="index">
                                <span>{{item.k}}</span>
                            </li>
                        </ul>
                    </div>
                    <div class="search-history" v-show="searchHistory.length">
                        <h1 class="title">
                            <span class="text">搜索历史</span>
                            <!-- 点击弹出对话框，确认是否清空 -->
                            <span class="icon" @click="showConfirm">
                                <i class="iconfont icon-empty"></i>
                            </span>
                        </h1>
                        <!-- 接收搜索历史列表点击事件select，把选中的字符添加到搜索栏 -->
                        <!-- 接收“×”图标点击事件delete，把对应的搜索结果行删除 -->
                        <search-list @select="addQuery" @delete="deleteOne" :searches="searchHistory"></search-list>
                    </div>
                </div>
            </scroll>
        </div>
        <!-- 当搜索栏有内容时显示搜索结果 -->
        <div class="search-result" v-show="query" ref="searchResult">
            <!-- search组件中监听这个滚动开始事件listScroll，通过了两层传递 -->
            <!-- 接收select事件保存当前搜索字段(query值) -->
            <suggest ref="suggest" :query="query" @listScroll="blurInput" @select="saveSearch"></suggest>
        </div>
        <!-- 绑定了清空按钮事件，点击后情况搜索列表 -->
        <confirm @confirm="deleteAll" ref="confirm" text="是否清空所有搜索历史？" confirmBtnText="清空"></confirm> 
        <router-view></router-view>
    </div>
</template>

<script type="text/ecmascript-6">
import SearchBox from "@/base/search-box/search-box";
import { getHotKey } from "@/api/search";
import { ERR_OK } from "@/api/config";
import Suggest from "@/components/suggest/suggest";
import { mapActions, mapGetters } from "vuex";
import SearchList from "@/base/search-list/search-list";
import Confirm from "@/base/confirm/confirm";
import Scroll from "@/base/scroll/scroll";
import {playlistMixin} from "@/common/js/mixin"

export default {
    mixins:[playlistMixin],
    name: "search",
    data() {
        return {
            hotKey: [], //接收热搜词
            query: "" //接收search-box传递处理的搜索字符
        };
    },
    computed: {
        //计算搜索热点和搜索列表的的数据之和的高度，传递给scroll组件计算高度
        shortcut(){
            return this.hotKey.concat(this.searchHistory);
        },
        ...mapGetters([
            "searchHistory" //从vuex中的getters中拿到searchHistory
        ])
    },
    components: {
        SearchBox,
        Suggest,
        SearchList,
        Confirm,
        Scroll
    },
    methods: {
        //调用了vuex的actions中的方法，那当前搜索的字符提交给state，并且缓存在了本地localStorage中
        saveSearch() {
            this.saveSearchHistory(this.query);
        },
        //点击关键次，把关键词添加到搜索栏
        addQuery(query) {
            this.$refs.searchBox.setQuery(query);
        },
        //接收searchbox派发的query事件，并且把里面传递出来的新query值赋值给query
        onQueryChange(query) {
            this.query = query;
        },
        //监听滚动开始事件listScroll
        blurInput() {
            //调用searchBox中的blur()，使输入框失去焦点
            this.$refs.searchBox.blur();
        },
        //点击“×”按钮事件
        deleteOne(item){
            this.deleteSearchHistory(item); //vuex的方法
        },
        //点击垃圾桶图标弹出对话框
        showConfirm(){
            this.$refs.confirm.show();
        },
        //点击对话框清空按钮后执行清空所有搜索列表
        deleteAll(){
            this.clearSearchHistory();
        },
        //当歌曲列表有歌曲时重新设置bottom值
        handlePlaylist(playlist){
            const bottom = playlist.length > 0 ? "60px" : "";

            //设置热门搜索滚动的bottom
            this.$refs.shortcutWrapper.style.bottom = bottom;
            this.$refs.shortcut.refresh();//重新计算滚动列表高度

            //设置搜索列表的bottom
            this.$refs.searchResult.style.bottom = bottom;
            this.$refs.suggest.refresh();//重新计算滚动列表高度
        },
        _getHotKey() {
            getHotKey().then(res => {
                if (res.code === ERR_OK) {
                    //只取热搜词前10条
                    this.hotKey = res.data.hotkey.slice(0, 10);
                    //console.log(this.hotKey);
                }
            });
        },
        ...mapActions([
            "saveSearchHistory", //映射vuex的actions中的添加方法
            "deleteSearchHistory", //删除方法
            "clearSearchHistory" //清空方法
        ])
    },
    created() {
        this._getHotKey();
    },
    watch:{
        query(newQuery){
            if(!newQuery){
                setTimeout(() => {
                    this.$refs.shortcut.refresh(); //这个实际重新计算scroll高度
                },20)
            }
        }
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.search {
    width: 100%;
    .search-box-wrapper {
        margin: 20px;
    }
    .shortcut-wrapper {
        position: fixed;
        top: 178px;
        bottom: 0;
        width: 100%;
        .shortcut {
            height: 100%;
            overflow: hidden;
            .hotkey {
                margin: 0 20px 20px 20px;
                .tit {
                    font-size: @font-size-medium;
                    color: @text-color-lighter;
                    margin-bottom: 20px;
                    font-weight: bold;
                }
                .item {
                    display: inline-block;
                    padding: 5px 10px;
                    margin: 0 15px 10px 0;
                    border-radius: 6px;
                    background: @body-bg-blacker;
                    font-size: @font-size-medium;
                    color: @text-color-lighter;
                    line-height: 14px;
                }
            }
            .search-history {
                margin: 0 20px 20px 20px;
                .title {
                    display: flex;
                    align-items: center;
                    height: 40px;
                    .text {
                        flex: 1;
                        font-size: @font-size-medium;
                        color: @text-color-lighter;
                        font-weight: bold;
                    }
                    .icon {
                        .extend-click();
                        .iconfont {
                            font-size: @font-size-medium-x;
                            color: @text-color-lighter;
                        }
                    }
                }
            }
        }
    }
    .search-result {
        position: fixed;
        top: 178px;
        bottom: 0;
        width: 100%;
    }
}
</style>