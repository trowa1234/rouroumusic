//配置文件

//提交的公共参数
export const commonParams = {
    g_tk: 5381,
    inCharset: 'utf-8',
    outCharset: 'utf-8',
    notice: 0,
    format: 'jsonp'
}

//安装的jsonp插件需要配置options中的param也就是设置回调函数的名称，QQ音乐用的jsonpCallback
export const options = {
    param: 'jsonpCallback'
}

//接口的返回值。请求成功的返回值
export const ERR_OK = 0