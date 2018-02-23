//用于操作本地缓存
//因为是要存到本地，所以需要先定一个访问设置localStorage的方法，这里使用了第三方库good-storage
import storage from "good-storage";

const SEARCH_KEY = '__search__';//定义本地缓存搜索列表的名字(key)
const SEARCH_MAX_LENGTH = 15;   //本地储存搜索列表记录最大条数

const PLAY_KEY = '__play__'; //定义本地缓存播放列表的名字
const PLAY_MAX_LENGTH = 50; //本地储存播放列表记录最大条数

//存放本地缓存的规则方法。加入的值在最前面，保留15条记录，超过记录删除最后1条记录。传入4个参数：
// 第1个是本地缓存数组
// 第2个是要存入的值
// 第3个是比较函数（用于对比传入的值和缓存中存在的值）
// 第4个存放最大条数
function insertArray(arr, val, compare, maxLen) {
    //查找缓存中是否有跟传入的值相同的值，并且返回它的索引值
    const index = arr.findIndex(compare);

    //如果传入的值就在数组第一位，直接retrun
    if (index === 0) {
        return
    }

    //如果有相同的值，就根据索引把这个值删掉
    if (index > 0) {
        arr.splice(index, 1);
    }
    //然后把传入的值存放在数组最前面
    arr.unshift(val);

    //如果设置了最大条数的要求,并且数组长度超过最大长度
    if (maxLen && arr.length > maxLen) {
        arr.pop();  //就删除数组最后1个索引的值
    }
}


//删除本地缓存规则方法。删除相同的数据，两个参数，1个数组，1个比较函数
function deleteFromArray(arr,compare){
    const index = arr.findIndex(compare);
    //索引值大于-1，说明数组中有这个数据
    if(index > -1){
        arr.splice(index, 1);   //删掉数据
    }
}


//把搜索字符作为参数传入，保存到缓存中的方法
export function saveSearch(query) {
    //使用插件的方法获取本地localStorage的名字为“SEARCH_KEY”的值，
    //有值的的话返回1个数组，无值就返回1个空数组，并且赋值给searches
    let searches = storage.get(SEARCH_KEY, []);

    //调用定义的存放本地缓存的方法，传入参数
    insertArray(searches, query, (item) => {
        return item === query;  //比较函数，比较传入的值是否全等于数组中的值
    }, SEARCH_MAX_LENGTH)

    //保存插入新值后的数组为本地缓存
    storage.set(SEARCH_KEY, searches)
    //把这个本地缓存数组保存出去
    return searches
}


//曝露获取本地缓存的方法
export function loadSearch(){
    return storage.get(SEARCH_KEY,[])
}


//从缓存中删除数据的方法
export function deleteSearch(query){
    let searches = storage.get(SEARCH_KEY, []); //获取本地缓存

    //调用删除方法
    deleteFromArray(searches,(item) => {
        return item === query;
    })

    //设置删除数据后的数组
    storage.set(SEARCH_KEY, searches)
    //把这个新数组保存出去
    return searches
}


//清空指定的本地缓存
export function clearSearch(){
    storage.remove(SEARCH_KEY);//删除本地名为'__search__'的缓存
    return []   //返回空数组
}



//添加播放的歌曲到本地缓存
export function savePlay(song){
    let songs = storage.get(PLAY_KEY,[]); //获取本地localStorage名为PLAY_KEY的值

    //调用插入的方法方法，传入参数
    insertArray(songs,song,(item) => {
        return item.id === song.id
    }, PLAY_MAX_LENGTH)

    //保存插入新值后的数组为本地缓存
    storage.set(PLAY_KEY,songs)

    //把这个新数组保存出去
    return songs
}


//获取播放列表本地缓存的方法
export function loadPlay(){
    return storage.get(PLAY_KEY,[])
}