import { getLyric } from '@/api/song'
import { ERR_OK } from '@/api/config'
import { Base64 } from "js-base64"

//封装了一个song类（歌曲），传入和歌曲相关的对象
export default class Song {
    constructor({ id, mid, singer, name, album, duration, image, url }) {
        this.id = id    //歌曲id
        this.mid = mid  //歌曲mid
        this.singer = singer    //歌手信息
        this.name = name    //歌曲名
        this.album = album   //专辑名
        this.duration = duration    //歌曲时长
        this.image = image  //歌曲图片
        this.url = url  //歌曲播放地址
    }

    //请求歌词数据方法。在这个类中定义，这个类的每个实例对象，都可以调用这个方法
    getLyric() {
        //如果已经获取到歌词数据，就不用再请求，返回1个promise对象包裹歌词
        if (this.lyric) {
            return Promise.resolve(this.lyric)
        }

        //如果没有歌词数据，发送请求返回1个promise对象包裹歌词
        return new Promise((resolve, reject) => {
            getLyric(this.mid).then((res) => {
                if (res.retcode === ERR_OK) {
                    this.lyric = Base64.decode(res.lyric);
                    resolve(this.lyric);
                } else{
                    reject('no lytic')
                }
            })
        })
    }
}

//获取歌曲对象的工厂函数，里面返回了Song类。这么做是为了减少遍历时的代码
export function createSong(musicData) {  //musicData就是获取到的歌曲数据，只取我们需要的
    return new Song({
        id: musicData.songid,
        mid: musicData.songmid,
        singer: filterSinger(musicData.singer),//歌手名字使用了专门的方法来获取
        name: musicData.songname,
        album: musicData.albumname,
        duration: musicData.interval,
        image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
        url: `http://isure.stream.qqmusic.qq.com/C100${musicData.songmid}.m4a?fromtag=32`
    })
}

/* 播放源发生变化
这里是使用的songmid 
url: `http://isure.stream.qqmusic.qq.com/C100${musicData.songmid}.m4a?fromtag=32`        
url: `http://thirdparty.gtimg.com/C100${musicData.songmid}.m4a?fromtag=38` 
*/




//处理歌手名的方法，歌手的数据是数组类型，可能同时有多位歌手，所以在这里专门设置方法处理
function filterSinger(singer) {  //传入歌手数据，是1个数组
    let ret = []    //定义空数组接收
    //边界处理。如果没有歌手数据，直接返回空字符串
    if (!singer) {
        return ''
    }
    //遍历这个数组
    singer.forEach((s) => {
        //把数组中每项的name属性添加到空数组中
        ret.push(s.name)
    })

    //最后把ret数组拼接成字符串并用/分割开
    return ret.join('/')
}


//格式化歌曲时间方法。因为我们获取的播放时间是一个时间戳，需要格式化为我们习惯的时分秒
export function formatTime(interval) {
    //时间戳是1个小数，所以需要向下取整。此语法等同于 Math.floor(interval)
    interval = interval | 0;
    //格式化分钟
    const minute = interval / 60 | 0;
    //格式化秒钟
    const second = pad(interval % 60);

    return `${minute}:${second}`;
}

//处理当秒为个位数时需要补0的方法
function pad(num, n = 2) {  //num是需要补位的数字，n=2表示补2位数
    let len = num.toString().length;
    while (len < n) {
        num = '0' + num;
        len++
    }
    return num
}