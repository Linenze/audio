# Jquery Audio

Jquery audio plugin, his only 2kb;

## Installation

1. `you can click download`
2. Include `audio` in your HTML.

    ```html
    <script src="jquery.js"></script>
    <script src="audio.min.js"></script>
    ```

## Usage
```javascript
 //音乐播放器
 //调用方法:
 var audio = $.fn.audio({
     interval:1000,//定时器监听事件,默认为200
     watch:function(obj){},//监听方法 返回一个对象里面包含常用的数据,包括百分比进度
     ended:function(url){}//每当音频执行完毕后触发该函数 返回一个当前播放的url地址
});

//通过插件返回的一个对象,可以从刚刚定义的变量 audio中获得一些方法 注:这里的audio是上面定义的变量audio
audio.audio //当前audio对象
audio.load(url,callback,autoplay) //加载函数 接收3个参数 url 音频地址 , callback 加载完成后回调函数 , autoplay 是否自动播放
audio.pause() //暂停
audio.play() //播放
audio.togglePlay(callback(isChangedPlay)) //切换暂停播放函数 , 接受一个回调 isChangedPlay 看名知其意
audio.currentTime(num, percentage) //若不设置参数,将会返回当前帧数 , num 设置当前帧(num/s) ; percentage若为true 则按百分比设置 num 充当百分比 比如 num = 80 就是百分之80的进度
audio.volume(num, percentage) //设置音量 同上
audio.mute() //静音
audio.unMute() //取消静音
audio.toggleMute(callback(isChangedMute)) //切换静音 同 audio.togglePlay(callback(isChangedPlay))
```
## Author

Copyright 2016, [Buff2017](https://github.com/Buff2017) (buffpal2016@gmail.com)
