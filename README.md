# audio.js

一个小巧的jquery插件, 仅2.32kb

## 使用

1. 下载dest/audio.min.js 文件
2. 在html 代码中引用

    ```html
    <script src="jquery.js"></script>
    <script src="audio.min.js"></script>
    ```

## 方法
```javascript
 // 调用
 $.audio('你的音频链接',{
    autoPlay:true,  //  默认为自动播放
    frequency:200   //  默认监听频率为200毫秒
 })
 
 // 当然也可以这样调用
  $.audio({
    src:'你的音频链接',
    autoPlay:true,  //  默认为自动播放
    frequency:200   //  默认监听频率为200毫秒
 })
 
 // 方法    主注:当调用插件后所有的方法将放在 window.audioMethod 上同意统一管理, 以下audio变量代表 window.audioMethod
audio.play()            //  播放音频
audio.pause()           //  暂停音频
audio.togglePlay()      //  在暂停与播放直接来回切换

/**
 * 设置音量                 若不传参数则为获取音量
 * @param num [0,1]         数字,表示音量
 * @param isPercentage      若为true 将对num / 100 处理, 用来表示num 传入的是一个百分比 (注:没有%)
 * @return {audio.volume|*|number|Number}
 */
audio.volume(num,isPercentage)
audio.mute()            //  静音
audio.unMute()          //  关闭静音
audio.toggleMute()      //  开关静音

/**
 * 初始化加载音频
 * @param src               音频地址
 * @param isAutoPlay        是否自动播放
 */
audio.loadAudio(src,isAutoPlay)       

/**
 * 设置当前播放时间          若不传参数则为获取当前时间
 * @param num                设置秒数
 * @param isPercentage       若为true 将对num / 100 处理, 用来表示num 传入的是一个百分比 (注:没有%)
 * @return {*|Number|number}
 */
audio.currentTime(num,isPercentage)
```

## 事件
```javascript
//  通过audio.loadAudio()触发
$(window).on('audioLoadStart',function(){
	console.log('开始加载音频');
})

//  当音频加载完成后,可执行播放时触发
$(window).on('audioLoadEnd',function(){
	console.log('音频加载完成');
})
    
//  当音频播放完毕后触发
$(window).on('audioEnded',function(){
	console.log('音频播放结束');
})

$(window).on('audioPlay',function(){
    console.log('播放');
})

$(window).on('audioPause',function(){
    console.log('暂停');
})

//  就将接受 volume 对象, 里面包含 volume: 改变后的音量 0 ~ 1 , volumePercentage: 改变后音量的百分比
$(window).on('audioVolumeChange',function(ev,volume){
    console.log('音量改变');
})

$(window).on('audioMute',function(){
    console.log('静音');
})

//  将接受beforMute 为触发静音之前的音量 0 ~ 1
$(window).on('audioUnMute',function(ev,beforMute){
    console.log('取消静音');
})

//  接受 currentTime 对象, 里面包含 currentTime: 当前帧/秒 , currentTimePercentage: 当前进度百分比
$(window).on('audioTimeChange',function(ev,currentTime){
    console.log('当前播放时间改变');
})


/** 监听方法 获取data对象
*	currentTime:当前帧/s
*	duration:当前音频长度/s
*	ended:是否结束 true|| false,
*	percentage:当前进度百分比
*
*/
$(window).on('audioWatching',function(ev,data){
    console.log('播放更新',data);
})

```

## Author

Copyright 2016, [Buff2017](https://github.com/Buff2017) (buffpal2016@gmail.com)
