//配置文件

//提交的公共参数
export const commonParams = {
    g_tk: 5381,
    inCharset: 'utf8',
    outCharset: 'utf-8',
    notice: 0,
    format: 'jsonp'
}

//安装的jsonp插件需要配置options中的param也就是设置回调函数的名称，QQ音乐用的jsonpCallback
export const options = {
    param: 'jsonpCallback'
}

export const singerDetailOptions = {
    param: 'jsonpCallback',

    //name，自定义回调函数的值。如：jsonpCallback:MusicJsonCallbacksinger_track
    name: 'MusicJsonCallbacksinger_track'    

    //prefix，这个是自定义名字+自增。如：jsonpCallback:MusicJsonCallbacksinger_track1
    //prefix: 'MusicJsonCallbacksinger_track'  
}

export const songListOptions = {
    param: 'jsonpCallback',

    //name，自定义回调函数的值。如：jsonpCallback:MusicJsonCallbacksinger_track
    name: 'playlistinfoCallback'    

    //prefix，这个是自定义名字+自增。如：jsonpCallback:MusicJsonCallbacksinger_track1
    //prefix: 'MusicJsonCallbacksinger_track'  
}

//接口的返回值。请求成功的返回值
export const ERR_OK = 0