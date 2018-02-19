import jsonp from '@/common/js/jsonp'
import { commonParams, options } from './config'

//关键词数据抓取
export function getHotKey() {
    //请求地址
    const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

    const data = Object.assign({}, commonParams, {
        platform: 'h5',
        needNewCode: 1
    })

    //使用我们封装的jsonp方法。在此方法中完成处理data，拼接url，调用插件jsonp返回数据
    return jsonp(url, data, options);
}

//搜索数据抓取。请求需要3个参数：1个是搜索字符，1个是搜索页的页码，1个是是否显示歌手信息，1个返回数据条数
export function search(query, page, zhida, perpage) {
    //请求地址
    const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'

    const data = Object.assign({}, commonParams, {
        w: query, 
        p: page,
        catZhida: zhida ? 1 : 0,  //1为显示，0为不显示
        perpage:perpage,    //请求返回多少条数据，传入的参数必须和下面的n一样
        n:perpage,      //请求返回多少条数据
        zhidaqu:1,
        t:0,
        flag:1,
        ie:'utf-8',
        sem:1,
        aggr:0,
        remoteplace:"txt.mqq.all",
        uid:0,
        platform: 'h5',
        needNewCode: 1
    })

    //使用我们封装的jsonp方法。在此方法中完成处理data，拼接url，调用插件jsonp返回数据
    return jsonp(url, data, options);
}