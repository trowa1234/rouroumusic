//引入config配置文件中的参数
import { commonParams} from './config'
//引入axios
import axios from 'axios'

export function getLyric(mid){
    const url = "/api/lyric";

    const data = Object.assign({},commonParams,{
        songmid:mid,
        pcachetime:+new Date(),
        platform:'yqq',
        hostUin:0,
        needNewCode:0,
        g_tk:1460121771,
        format:'json'
    })

    return axios.get(url,{
        params:data
    }).then((res) => {
        return Promise.resolve(res.data)
    })
}