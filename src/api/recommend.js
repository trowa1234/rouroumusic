//引入封装的jsonp方法。import后面的jsonp没有用花括号，是因为jsonp文件中暴露方法用的是export default
import jsonp from '@/common/js/jsonp'
//引入config配置文件中的参数，这里使用花括号是因为这两个参数用的export暴露出来  
import {commonParams,options} from './config'

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
