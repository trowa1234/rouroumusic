import jsonp from '@/common/js/jsonp'
import { commonParams, options } from './config'

//排行榜数据抓取
export function getTopList() {
    //请求地址
    const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg'

    const data = Object.assign({}, commonParams, {
        platform: 'h5',
        needNewCode: 1
    })

    //使用我们封装的jsonp方法。在此方法中完成处理data，拼接url，调用插件jsonp返回数据
    return jsonp(url, data, options);
}