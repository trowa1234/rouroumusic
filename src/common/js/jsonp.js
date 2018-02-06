import originJSONP from 'jsonp' //引入jsonp插件

//对外暴露一个名为jsonp的方法
//传入3个参数，第1个是url请求地址，第2个是data请求参数，第3个是option。
export default function jsonp(url, data, option) {
  //url地址+参数。先判断地址中是否带问号，如果没有就在最后添加?，如果有则添加&
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
  //ES6原生提供了Promise对象，用来传递异步操作的消息。其中的两个参数：resolve代表Promise成功调用这个resolve；reject代表Promise失败调用这个reject。
  return new Promise((resolve, reject) => {
    //调用引入的插件方法，并且传入参数。最后的err和data是回调
    originJSONP(url, option, (err, data) => {
      if (!err) { //如果没有错误
        resolve(data) //把data resolve出去
      } else {
        reject(err) //反之，报错
      }
    })
  })
}

//参数拼接到url后面的方法，把data拼接到url地址后面
function param(data) {
  let url = '';
  //for-in遍历data
  for (var k in data) {
    //如果data[k]的值不是undefined就等于data[k]，如果是undefined就等于空字符串
    let value = data[k] !== undefined ? data[k] : '';
    //拼接url。用了ES6的语法来拼接，&是参数连接符，${k}是key（键），${encodeURIComponent(value)}是value（值）。encodeURIComponent() 函数可把字符串作为 URI 组件进行编码。
    url += `&${k}=${encodeURIComponent(value)}`;
  }
  //如果url有数据，则需要把拼接的代码的第一位的连接符号&去掉。如果没有url数据则返回空字符串
  return url ? url.substring(1) : ''
}

//插件jsonp，参数1请求地址，参数2回调函数name，参数3回调
/* originJSONP(url, { param: "jsonpCallback" }, function(err, data) {
  console.log(data);
}); */