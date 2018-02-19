<template>
    <div class="search">
        <div class="search-box-wrapper">
            <!-- 接收search-box组件派发处理的query事件 -->
            <search-box ref="searchBox" @query="onQueryChange"></search-box>
        </div>
        <!-- 当搜索栏无内容时显示热门搜索 -->
        <div class="shortcut-wrapper" v-show="!query">
            <div class="shortcut">
                <div class="hotkey">
                    <h2 class="tit">热门搜索</h2>
                    <ul>
                        <!-- 添加点击是就把关键词作为参数传入 -->
                        <li @click="addQuery(item.k)" class="item" v-for="(item,index) in hotKey" :key="index">
                            <span>{{item.k}}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- 当搜索栏有内容时显示搜索结果 -->
        <div class="search-result" v-show="query">
            <suggest :query="query"></suggest>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
import SearchBox from "@/base/search-box/search-box";
import { getHotKey } from "@/api/search";
import { ERR_OK } from "@/api/config";
import Suggest from "@/components/suggest/suggest"

export default {
    name: "search",
    data() {
        return {
            hotKey: [], //接收热搜词
            query:''    //接收search-box传递处理的搜索字符
        };
    },
    components: {
        SearchBox,
        Suggest
    },
    methods: {
        //点击关键次，把关键词添加到搜索栏
        addQuery(query){
            this.$refs.searchBox.setQuery(query);
        },
        onQueryChange(query){
            this.query = query;
        },
        _getHotKey() {
            getHotKey().then(res => {
                if (res.code === ERR_OK) {
                    //只取热搜词前10条
                    this.hotKey = res.data.hotkey.slice(0, 10);
                    //console.log(this.hotKey);
                }
            });
        }
    },
    created() {
        this._getHotKey();
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
                }
                .item{
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
        }
    }
    .search-result{
        position: fixed;
        top: 178px;
        bottom: 0;
        width: 100%;
    }
}
</style>