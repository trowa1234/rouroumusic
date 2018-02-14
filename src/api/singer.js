//歌手页面数据获取

import jsonp from '@/common/js/jsonp'
import {
    commonParams,
    options,
    singerDetailOptions
} from './config'

//歌手列表数据，和轮播图一样使用jsonp
export function getSingerList() {
    const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg' //请求地址

    const data = Object.assign({}, commonParams, {
        //后面的参数如果有和commonParams中相同的参数，可以覆盖，以后面的为准
        channel: 'singer',
        page: 'list',
        key: 'all_all_all',
        pagesize: 100,
        pagenum: 1,
        hostUin: 0,
        needNewCode: 0,
        platform: 'yqq',
        g_tk: 5381
    })

    return jsonp(url, data, options)
}


//歌手详情数据，jsonp请求。
export function getSingerDetail(singerId) {
    const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'

    const data = Object.assign({}, commonParams, {
        g_tk: 322913594,
        hostUin: 0,
        needNewCode: 0,
        platform: 'yqq',
        order: 'listen',
        begin: 0,
        num: 100,   //获取歌曲的数量
        songstatus: 1,
        singermid: singerId//参数必须要歌手的id。把歌手id作为参数传入，再发送请求
    })

    return jsonp(url, data, singerDetailOptions)
}
