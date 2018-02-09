<template>
    <div class="singer">
        singer
    </div>
</template>

<script type="text/ecmascript-6">
import { getSingerList } from "@/api/singer"; //引入获取歌手列表数据方法
import { ERR_OK } from "@/api/config";
import Singer from "@/common/js/singer"; //引入创建歌手的类

const HOT_NAME = "热门"; //定义热门标签
const HOT_SINGER_LEN = 10; //定义热门歌手数量

export default {
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
        _getSingerList() {
            getSingerList().then(res => {
                if (res.code === ERR_OK) {
                    this.singerList = res.data.list;
                    console.log(this._handleSingerList(this.singerList));
                }
            });
        },
        //得到的数据需要我们处理才能得到我们想要的数据。-> 热、A,B,C,D……
        _handleSingerList(list) {
            //定义1个map对象用来存放处理后的数据
            let map = {
                //在map中再创建hot对象用来存放热门歌手
                hot: {
                    title: HOT_NAME,    //名称为'热门'
                    items: []   //items就是存放歌手的数组
                }
            };

            //列表数据
            list.forEach((item, index) => {
                //是由索引是前10的对象 
                if (index < HOT_SINGER_LEN) {
                    //就把他们添加到hot对象的items数组中去
                    map.hot.items.push(
                        new Singer({//使用了ES的类（class）
                            id: item.Fsinger_mid,   //把数据Fsinger_mid作为参数传入
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
                        items: []   //存放属于该字母的歌手数组
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
            let hot = [] //存放热门歌手的数组
            let ret = [] //存放其他歌手的数组

            //遍历map对象
            for(let key in map){
                let val = map[key]  //定义map的每个对象为val
                //使用正则匹配每个对象的title属性，如果是字母的
                if(val.title.match(/[a-zA-Z]/)){
                    ret.push(val)   //就把它们添加到ret数组中（其他歌手）
                } else if(val.title === HOT_NAME){//如果对象的title属性是'热门'
                    hot.push(val)//就把它们添加到hot数组中（热门歌手）
                }
            }

            //给ret数组中的对象按其属性title的字母的升序排序
            ret.sort((a,b) => {
                return a.title.charCodeAt(0) - b.title.charCodeAt(0)
            })

            //最后用hot数组拼接ret数组，因为hot数组需要在最前面
            return hot.concat(ret);
        }
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