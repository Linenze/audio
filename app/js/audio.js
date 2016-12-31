/**
 * 音乐播放器
 * 调用方法:
 *          var audio = $.fn.audio({
 *              interval:1000,//定时器监听事件,默认为200
 *              watch:function(obj){},//监听方法 返回一个对象里面包含常用的数据,包括百分比进度
 *              ended:function(url){}//每当音频执行完毕后触发该函数 返回一个当前播放的url地址
 *          });
 *
 *          通过插件返回的一个对象,可以从刚刚定义的变量 audio中获得一些方法 注:这里的audio是上面定义的变量audio
 *          audio.audio //当前audio对象
 *          audio.load(url,callback,autoplay) //加载函数 接收3个参数 url 音频地址 , callback 加载完成后回调函数 , autoplay 是否自动播放
 *          audio.pause() //暂停
 *          audio.play() //播放
 *          audio.togglePlay(callback(isChangedPlay)) //切换暂停播放函数 , 接受一个回调 isChangedPlay 看名知其意
 *          audio.currentTime(num, percentage) //若不设置参数,将会返回当前帧数 , num 设置当前帧(num/s) ; percentage若为true 则按百分比设置 num 充当百分比 比如 num = 80 就是百分之80的进度
 *          audio.volume(num, percentage) //设置音量 同上
 *          audio.mute() //静音
 *          audio.unMute() //取消静音
 *          audio.toggleMute(callback(isChangedMute)) //切换静音 同 audio.togglePlay(callback(isChangedPlay))
 */
;(function () {
    $.fn.extend({
        audio: function (json) {
            var options = json ? json : {};
            var audio;
            var timer;//开个定时器
            //定时器监听时间获取
            var intervalNum = options.interval || 200;
            var watchCallback = options.watch || null;
            var beforTime;//记录上一次定时器的时间 为了解决站暂停后出问题
            var beforMute;//记录点击静音之前的值,为了在关闭静音时能恢复之前的音量
            var tool = (function () {
                return {
                    percentage: function (a, b) {//获取百分比
                        return Math.ceil((Math.trunc(a) / Math.trunc(b)) * 100);
                    }
                }
            })();
            //定时器监听方法
            var intervalFn = function () {
                if (!audio.duration) {
                    window.clearInterval(timer);
                }
                ;
                watchCallback({
                    currentTime: audio.currentTime,//当前帧数
                    duration: audio.duration || 0,//总长度
                    ended: audio.ended,//是否已经结束
                    loop: audio.loop,//是否循环
                    muted: audio.muted,//返回当前是否静音
                    paused: audio.paused,//返回当前是否暂停
                    volume: audio.volume,//返回当前音量
                    percentage: tool.percentage(audio.currentTime || beforTime, audio.duration) || 0
                });
                beforTime = currentTime;
            };

            //初始化方法
            var init = function () {
                audio = new Audio();
                event();
            }

            //绑定一些事件
            var event = function () {
                var endCallBack = function () {
                    options.ended && options.ended(audio.src);
                }
                audio.addEventListener('ended', endCallBack, false);
            }

            //加载方法
            var load = function (url, callback, autoplay) {
                var fn = function () {
                    if (callback && typeof callback !== 'function') {//load(url,true)
                        audio.play();
                    } else {
                        callback && callback();
                        autoplay && audio.play();
                    }
                    //加载完成后开启定时器
                    window.clearInterval(timer);
                    timer = setInterval(intervalFn, intervalNum);
                    audio.removeEventListener('loadeddata', fn, false);
                }
                audio.src = url;
                audio.load();
                audio.addEventListener('loadeddata', fn, false)
            };
            //播放
            var play = function () {
                audio.play();
                window.clearInterval(timer);
                timer = setInterval(intervalFn, intervalNum);
            };
            //暂停
            var pause = function () {
                audio.pause();
                window.clearInterval(timer);
            };
            //暂停播放切换
            var togglePlay = function (callback) {
                if (audio.paused) {
                    play();
                    callback && callback(true);
                } else {
                    pause();
                    callback && callback(false);
                }
            }
            //音量调节
            var volume = function (num, percentage) {
                if (!num)return audio.volume;
                if (percentage) {
                    audio.volume = num / 100;
                } else {
                    audio.volume = num;
                }
                return;
            }
            //静音
            var mute = function () {
                beforMute = audio.volume;
                audio.volume = 0;
            }
            //关闭静音
            var unMute = function () {
                audio.volume = beforMute ? beforMute : 1;
            }
            //切换静音 返回一个布尔 切换成关闭静音true 切换成静音 false
            var toggleMute = function (callback) {
                if (audio.volume == 0) {//已经是静音状态
                    unMute();
                    callback && callback(true);
                } else {
                    mute();
                    callback && callback(false);
                }
            }

            /**
             * 设置当前播放时间
             * @param num           通过设置秒数来获取
             * @param percentage    如果为true则当成百分比处理
             * @return {*}
             */
            var currentTime = function (num, percentage) {
                if (!num)return audio.currentTime;
                if (percentage) {
                    audio.currentTime = audio.duration * (num / 100);
                } else {
                    audio.currentTime = num;
                }
                return;
            }

            init();

            return {
                audio: audio,
                load: load,
                pause: pause,
                play: play,
                togglePlay: togglePlay,
                currentTime: currentTime,
                volume: volume,
                mute: mute,
                unMute: unMute,
                toggleMute: toggleMute
            }
        }
    });
})();