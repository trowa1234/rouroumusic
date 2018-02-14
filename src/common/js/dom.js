//操作dom的公共方法

//添加样式方法。样式名参数命名为CLASSname是为了和el.className(这是获取dom元素的className属性)区分开
export function addClass(el, CLASSname) {
    if (hasClass(el, CLASSname)) {
        return //如果该dom元素有这个样式，则直接return
    }
    //把这个dom元素的样式名按空格分，组成数组形式
    let newClass = el.className.split(' ');

    //把需要添加的样式名加入数组中
    newClass.push(CLASSname);

    //先把数组按空格组成字符串，再把字符串添加到dom元素的样式中
    el.className = newClass.join(' ');
}

//判断是否已经添加样式方法
export function hasClass(el, CLASSname) {
    //创建正则，匹配 以此className开头或者className前面有空格，以及以此className结束或className后面有空格
    let reg = new RegExp('(^|\\s)' + CLASSname + '(\\s|$)');

    //匹配成功返回true，失败返回false
    return reg.test(el.className);
}


//设置或获取dom元素属性。传入3个参数：第1个dom元，第2个属性名，第3个属性值（选传）
export function getData(el, name, val) {
    const prefix = "data-" //dom元素自定义属性是data-xxx
    name = prefix + name //name参数只需要传入data-后面的字符就可以了
    if (val) { //如果传入了val参数，就设置这个属性值
        return el.setAttribute(name, val)
    } else { //如果没有传val参数，就获取这个属性值
        return el.getAttribute(name)
    }
}

//判断浏览器厂商
let elementStyle = document.createElement('div').style
let vendor = (() => {
    let transformNames = {  //浏览器厂商
        webkit:'webkitTransform',
        Moz:'MozTransform',
        O:'OTransform',
        ms:'msTransform',
        standard:'transform'
    }

    for(let key in transformNames){
        if(elementStyle[transformNames[key]] !== undefined){
            return key
        }
    }
    return false
})()


//封装js代码中的css兼容代码。带厂商的私有化前缀
export function prefixStyle(style){//参数为样式名字符串
    if(vendor === false){
        return false
    }
    if(vendor === 'standard'){
        return style
    }

    //拼接：厂商的对应的前缀 + 样式名第一个字母大写 + 样式名后面的字母
    return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}