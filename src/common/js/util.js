//在给定的两个数中，随机返回1个数，包括最小数和最大数
function getRandomInt(min, max) {
    //(max - min + 1) 其中的+1是为了可以返回最大数，最后的加min是为了可以返回最小数
    return Math.floor(Math.random() * (max - min + 1) + min);
}

//数组乱序方法。经典算法。返回一个新数组
export function shuffle(arr) {

    //复制这个数组，这样就不会改变原数组
    let _arr = arr.slice();    

    for (let i = 0; i < _arr.length; i++) {
        let j = getRandomInt(0, i)
        let t = _arr[i];
        _arr[i] = _arr[j]
        _arr[j] = t;
    }
    return _arr
}