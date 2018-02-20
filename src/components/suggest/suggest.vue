<template>
    <!-- 接收自定义事件scrollToEnd，这是加载更多的时机 -->
    <!-- 接收自定义事件beforeScroll，滚动开始时派发的事件，用来解决真机字母键盘不会自动隐藏的问题 -->
    <scroll class="suggest" 
            :data="result" 
            :pullup="pullup" 
            :beforeScroll="beforeScroll" 
            @scrollToEnd="searchMore" 
            @beforeScroll="listScroll"
            ref="suggest"
    >
        <ul class="suggest-list">
            <li @click="selectItem(item)" class="suggest-item" v-for="(item,index) in result" :key="index">
                <div class="icon">
                    <!-- 绑定图标的样式，需要判断是歌手还是歌曲 -->
                    <i class="iconfont" :class="getIconCls(item)"></i>
                </div>
                <div class="name">
                    <!-- 歌手名或者歌手名，取值的数据不一样也需要判断,需要传入数据 -->
                    <p class="text" v-html="getName(item)"></p>
                </div>
            </li>
            <loading v-show="hasMore"></loading>
        </ul>
        <!-- 无搜索数据时显示 -->
        <div v-show="!result.length && !hasMore" class="no-result-wrapper">
            <no-result text="抱歉，暂无搜索结果"></no-result>
        </div>
    </scroll>
</template>

<script type="text/ecmascript-6">
import { search } from "@/api/search";
import { ERR_OK } from "@/api/config";
import { createSong } from "@/common/js/song";
import Scroll from "@/base/scroll/scroll";
import Loading from "@/base/loading/loading";
import {mapMutations, mapActions} from "vuex";
import Singer from "@/common/js/singer";
import NoResult from "@/base/no-result/no-result";

const TYPE_SINGER = "singer"; //定义常量字符
const perpage = 20; //定义返回数据的条数

export default {
    name: "suggest",
    props: {
        //传入的搜索字符
        query: {
            type: String,
            default: ""
        },
        //接收参数是否显示歌手
        showSinger: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            page: 1, //定义传入请求参数的搜索页数，默认第1页
            result: [], //接收获取的搜索数据
            pullup: true, //传入配置，开启scroll组件上拉加载
            hasMore: true, //定义一个标志位，表示还有内容需要加载
            beforeScroll:true   //传入scroll配置文件，开启监听滚动开始事件
        };
    },
    methods: {
        //搜索列表点击事件
        selectItem(item){
            //如果是歌手对象
            if(item.type === TYPE_SINGER){
                // 调用歌手类构造函数，生成歌手对象
                const singer = new Singer({
                    id:item.singermid,
                    name:item.singername
                })
                //以生成歌手对象的id作为路径，跳转到seacher二级页面，歌手页面
                this.$router.push({
                    path:`/search/${singer.id}`
                })
                //把生成的歌手对象传入vuex
                this.setSinger(singer);
            }
            //如果是歌曲对象（在获取搜索数据时已经对歌曲进行了处理）
            else{
                this.insertSong(item);
            }

            //向外派发事件自定义事件select
            this.$emit('select');
        },
        getIconCls(item) {
            //判断对象是否有type属性（自己定义的属性），有的话说明这个数据是歌手
            if (item.type === TYPE_SINGER) {
                return "icon-tx"; //头像图标
            } else {
                return "icon-yinfu"; //音符图标
            }
        },
        getName(item) {
            if (item.type === TYPE_SINGER) {
                return item.singername; //歌手名取值方式
            } else {
                return `${item.name}-${item.singer}`; //歌曲名+歌手
            }
        },
        //上拉加载更多的方法
        searchMore() {
            //如果内容都加载完了，就不执行下面的请求了
            if (!this.hasMore) {
                return;
            }
            //请求的页数每次+1
            this.page++;
            
            //继续发送请求，只是page的参数变了
            search(this.query, this.showSinger, this.page, perpage).then((res) => {
                    if (res.code === ERR_OK) {
                        //这需要注意不能把请求到的结果直接赋值给result,把新的数据和原来的数据拼接
                        this.result = this.result.concat(this._getResult(res.data));
                        //每次请求后都要检查是否还有内容 
                        this._checkMore(res.data);
                    }
                }
            )
        },
        //监听列表滚动开始
        listScroll(){
            this.$emit('listScroll');//继续往上一级派发事件
        },
        //曝露 refresh()方法
        refresh(){
            this.$refs.suggest.refresh();
        },
        //当搜索字符发生改变时调用，重新请求
        _search() {
            //只要改变了搜索字，就重置page参数为1
            this.page = 1;
            //重置hasMore为true，表示还有内容加载
            this.hasMore = true
            //把滚动列表的位置置于顶部
            this.$refs.suggest.scrollTo(0,0);
            
            //调用请求的方法，传入4个参数
            search(this.query, this.showSinger, this.page, perpage).then((res) => {
                    if (res.code === ERR_OK) {
                        this.result = this._getResult(res.data); //对数据做处理后赋值给result
                        //console.log(res.data);

                        //这个方法来检测数据的内容是否全部加载
                        this._checkMore(res.data);
                    }
                }
            )
        },
        //处理获得的数据，数据有两种1个是歌曲，1种是歌手
        _getResult(data) {
            let ret = [];
            //歌手数据放入数组的最前面
            if (data.zhida && data.zhida.singerid) {
                //这里使用了扩展运算符'...'扩展运算符给了我们全新的方法去实现合并数组
                //把歌手数据放在前面，然后自己添加了对象type。方便操作不显示歌手的情况
                ret.push({ ...data.zhida, ...{ type: TYPE_SINGER } });
            }
            if (data.song) {
                //处理歌手数据
                ret = ret.concat(this._handleSongs(data.song.list));
            }
            return ret;
        },
        //处理歌曲函数，把歌曲列表作为参数传入
        _handleSongs(list) {
            let ret = [];
            list.forEach((musicData) => {
                if (musicData.songid && musicData.albumid) {
                    //引入了Song类来创建歌曲对象
                    ret.push(createSong(musicData));
                }
            });
            return ret;
        },
        //检测数据的内容是否全部加载，次方法依赖与服务器提供的数据：song.curnum表示当前显示条数，song.curpage当前的页数，song.totalnum表示总的条目数
        _checkMore(data) {
            const song = data.song;
            //当达到用条目数的数量时，说明数据内容都加载了
            if (
                !song.list.length ||
                song.curnum + song.curpage * perpage >= song.totalnum
            ) {
                //此时把这个标志为设置为false，表示没有内容了
                this.hasMore = false;
            }
        },
        ...mapMutations({
            setSinger:'SET_SINGER'
        }),
        ...mapActions([
            'insertSong'
        ])
    },
    watch: {
        //当搜索字符改变时调用search方法发送请求
        query() {
            this._search();
        }
    },
    components: {
        Scroll,
        Loading,
        NoResult
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.suggest {
    height: 100%;
    overflow: hidden;
    .suggest-list {
        padding: 0 30px;
        .suggest-item {
            display: flex;
            align-items: center;
            padding-bottom: 16px;
            .icon {
                flex: 0 0 30px;
                width: 30px;
                .iconfont {
                    font-size: @iconfont-size-s;
                    color: @text-color-lighter;
                }
            }
            .name {
                flex: 1;
                font-size: @font-size-medium;
                color: @text-color-lighter;
                overflow: hidden;
                .text {
                    .text-overflow();
                }
            }
        }
    }
    .no-result-wrapper {
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
    }
}
</style>