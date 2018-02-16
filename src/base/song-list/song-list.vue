<template>
    <div class="song-list">
        <ul>
            <!-- 给每首歌曲绑定点击事件，传递两个参数，第1个是点击的当前歌曲，第2个是当前歌曲的索引值 -->
            <li @click="selectItem(song,index)" v-for="(song,index) in songs" class="item" :key="index">
                <div class="content">
                    <h2 class="name">{{song.name}}</h2>
                    <p class="txt">{{getDesc(song)}}</p>
                </div>
            </li>
        </ul>
    </div>
</template>

<script type="text/ecmascript-6">
export default {
  name: "song-list",
  props:{
      songs:{
          type:Array,
          default:[]
      }
  },
  methods:{
      //获取歌曲信息
      getDesc(song){
          //由歌手名和专辑名拼接得到
          return `${song.singer} · ${song.album}`
      },
      //由于song-list组件是一个基础组件，在它的内部不会写相应的逻辑
      //所以需要它把事件传递出来给它的父组件(music-list)，父组件监听自定义事件(select)再在父组件中定义逻辑代码
      selectItem(item,index){
          //console.log(item)
          this.$emit('select',item,index)
      }
  }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.song-list{
    .content{
        padding: 10px 20px;
        .name{
            font-size: @font-size-medium-x;
            line-height: 24px;
        }
        .txt{
            font-size: @font-size-medium;
            color: @text-color-lighter;
        }
    }
}
</style>