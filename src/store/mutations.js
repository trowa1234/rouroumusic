//所有的方法都在这里定义

//引入types文件。是用了import语法*,接下拉就可以在下面这样调用方面的名字 [types.SET_SINGER]
import * as types from "./mutation-types"

const mutations = {
    //定义SET_SINGER()方法，第1个参数就是state文件中那个状态对象，第2个参数就是传递的数据
    //此方法的作用是：获取数据提交给state
    [types.SET_SINGER](state,singer){
        //提交状态操作，把获取的歌手数据提交到state状态对象的singer中保存
        state.singer = singer
    }
}

//把mutations曝露出去
export default mutations