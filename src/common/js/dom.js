//操作dom的公共方法

//添加样式方法
export function addClass(el,className){
    if(hasClass(el,className)){
        return  //如果该dom元素有这个样式，则直接return
    }
    //把这个dom元素的样式名按空格分，组成数组形式
    let newClass = el.className.split(' '); 

    //把需要添加的样式名加入数组中
    newClass.push(className);
     
    //先把数组按空格组成字符串，再把字符串添加到dom元素的样式中
    el.className = newClass.join(' '); 
}

//判断是否已经添加样式方法
export function hasClass(el,className){
    //创建正则，匹配 以此className开头或者className前面有空格，以及以此className结束或className后面有空格
    let reg = new RegExp('(^|\\s)' + className + '(\\s|$)');

    //匹配成功返回true，失败返回false
    return reg.test(el.className);
}