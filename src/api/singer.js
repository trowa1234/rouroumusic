//歌手页面数据获取

import jsonp from '@/common/js/jsonp'
import {commonParams,options} from './config'

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
