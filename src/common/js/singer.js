//封装了一个singer类，只需要传入id和name参数
export default class Singer{
    constructor({id,name}){
        this.id = id    //id就是传入数据中的Fsinge_mid
        this.name = name    //name就是传入数据中的Fsinge_name
        //头像的url地址就是由这个固定地址拼接Fsinge_mid得到的
        this.avatar=`http://y.gtimg.cn/music/photo_new/T001R300x300M000${id}.jpg?max_age=2592000`
    }
}