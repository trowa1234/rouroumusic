<template>
    <div class="singer" ref="singer">
        <!-- 传入歌手列表数据。绑定传递出来的select事件 -->
        <listview :data="singerList" @select="selectSinger" ref="listview"></listview>
        <!-- 歌手详情页的视口，即2级页面显示的地方 -->
        <router-view></router-view>
    </div>
</template>

<script type="text/ecmascript-6">
import { getSingerList } from "@/api/singer"; //引入获取歌手列表数据方法
import { ERR_OK } from "@/api/config";
import Singer from "@/common/js/singer"; //引入创建歌手的类
import listview from "@/base/listview/listview"; //引入listview组件
import {playlistMixin} from '@/common/js/mixin'; //引入公共代码片段

//使用了vuex提供的语法糖，可以在这个页面简写vuex的代码。
//这里引入的是mapMutations就是方法模块，所以就在methods中添加vuex中定义的方法
import {mapMutations} from 'vuex'   

const HOT_NAME = "热门"; //定义热门标签
const HOT_SINGER_LEN = 10; //定义热门歌手数量

export default {
    mixins:[playlistMixin], //公共代码
    name: "singer",
    data() {
        return {
            singerList: []
        };
    },
    created() {
        this._getSingerList();
    },
    methods: {
        //定义公共代码片段需要的方法。把歌曲列表作为参数传入。注意这里的playlist是从公共代码中传入的
        handlePlaylist(playlist){
            //查看vuex的playlist是否有数据。有的化设置1个bottom值60px,没有的化设置为0
            const bottom = playlist.length > 0 ? '60px' : '0';
            //给这个滚动列表添加bottom样式
            this.$refs.singer.style.bottom = bottom;
            //重新计算高度。这个方法在需要从listview组件中曝露出来，绑定listview
            this.$refs.listview.refresh();
        },
        //从listview传递处理的select事件处理函数。singer就是里面传递出来的item，歌手的实例对象
        selectSinger(singer){
            //使用路由跳转方法
            this.$router.push({
                // 跳转的路径就是singer参数中的id。在路由文件中也没有写死就是绑定的id
                path:`/singer/${singer.id}`
            })
            //这样在这个页面就可以使用mutations名为'SET_SINGER'的方法。把参数singer提交给state中的singer中去
            this.setSinger(singer)
        },
        _getSingerList() {
            getSingerList().then(res => {
                if (res.code === ERR_OK) {
                    //将处理后的数据赋值给singerList
                    this.singerList = this._handleSingerList(res.data.list);
                    //console.log(this.singerList);
                }
            });
        },
        //得到的数据需要我们处理才能得到我们想要的数据。-> 热、A,B,C,D……
        _handleSingerList(list) {
            //定义1个map对象用来存放处理后的数据
            let map = {
                //在map中再创建hot对象用来存放热门歌手
                hot: {
                    title: HOT_NAME, //名称为'热门'
                    items: [] //items就是存放歌手的数组
                }
            };

            //列表数据
            list.forEach((item, index) => {
                //是由索引是前10的对象
                if (index < HOT_SINGER_LEN) {
                    //就把他们添加到hot对象的items数组中去
                    map.hot.items.push(
                        new Singer({
                            //使用了ES的类（class）
                            id: item.Fsinger_mid, //把数据Fsinger_mid作为参数传入
                            name: item.Fsinger_name //把数据Fsinger_name作为参数传入
                        })
                    );
                }
                //再根据数据item.Findex创建其他的对象用来存放按名字开后字母来分类
                const key = item.Findex;
                if (!map[key]) {
                    //在map中创建以字母命名的对象
                    map[key] = {
                        title: key, //名称就为该字母
                        items: [] //存放属于该字母的歌手数组
                    };
                }
                //向map[key]的items数组添加此歌手数据
                map[key].items.push(
                    new Singer({
                        id: item.Fsinger_mid,
                        name: item.Fsinger_name
                    })
                );
            });

            //通过上面的遍历分类，我们已经拿到了处理后的数据，是1个对象。但是对象的遍历是无序，所以需要把对象转换成数组
            //处理map这个对象
            let hot = []; //存放热门歌手的数组
            let ret = []; //存放其他歌手的数组

            //遍历map对象
            for (let key in map) {
                let val = map[key]; //定义map的每个对象为val
                //使用正则匹配每个对象的title属性，如果是字母的
                if (val.title.match(/[a-zA-Z]/)) {
                    ret.push(val); //就把它们添加到ret数组中（其他歌手）
                } else if (val.title === HOT_NAME) {
                    //如果对象的title属性是'热门'
                    hot.push(val); //就把它们添加到hot数组中（热门歌手）
                }
            }

            //给ret数组中的对象按其属性title的字母的升序排序
            ret.sort((a, b) => {
                return a.title.charCodeAt(0) - b.title.charCodeAt(0);
            });

            //最后用hot数组拼接ret数组，因为hot数组需要在最前面
            return hot.concat(ret);
        },
        //在methods中调用mapMutations
        ...mapMutations({
            setSinger:'SET_SINGER'  //做一个映射setSinger为vuex的mutations中定义的名为'SET_SINGER'的方法
        })
    },
    components: {
        listview
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.singer {
    position: fixed;
    top: 88px;
    bottom: 0;
    width: 100%;
}
</style>