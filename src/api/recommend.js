//引入封装的jsonp方法。import后面的jsonp没有用花括号，是因为jsonp文件中暴露方法用的是export default
import jsonp from '@/common/js/jsonp'
//引入config配置文件中的参数，这里使用花括号是因为这两个参数用的export暴露出来  
import { commonParams, options } from './config'
//引入axios
import axios from 'axios'

//推荐页面-轮播图的数据抓取
export function getRecommend() {
    //请求地址
    const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

    //Object.assign() 方法用于把一个或多个对象的可枚举属性值复制到目标对象中
    //第一个参数就是目标对象，这里是一个空对象
    //第二个参数是commonParams,就是设定的公共参数
    //第三个参数是需要手动添加的参数
    const data = Object.assign({}, commonParams, {
        //这些参数都是请求时需要的
        platform: 'h5',
        uin: 0,
        needNewCode: 1
    })

    //使用我们封装的jsonp方法。在此方法中完成处理data，拼接url，调用插件jsonp返回数据
    return jsonp(url, data, options);
}


//推荐页面-歌单的数据抓取
export function getDiscList() {
    //请求地址是我们模拟的地址
    const url = '/api/getDiscList'

    const data = Object.assign({}, commonParams, {
        //这些参数都是请求时需要的，请求轮播图有所不同
        platform: 'yqq',
        hostUin: 0,
        sin: 0,
        ein: 29,
        sortId: 5,
        needNewCode: 0,
        categoryId: 10000000,
        rnd: Math.random(),
        format: 'json'
    })

    //使用插件axios发送ajax，get请求
    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data)    //返回的Promise.resolve
    })
}


export function getSongList(disstid) {
    const url = '/api/getSongList'

    const data = Object.assign({}, commonParams, {
        disstid,
        type: 1,
        json: 1,
        utf8: 1,
        onlysong: 0,
        platform: 'yqq',
        hostUin: 0,
        needNewCode: 0,
        format: 'json'
    })

    //使用插件axios发送ajax，get请求
    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data)    //返回的Promise.resolve
    })
}