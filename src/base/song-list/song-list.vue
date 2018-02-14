<template>
    <div class="song-list">
        <ul>
            <li v-for="(song,index) in songs" class="item" :key="index">
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