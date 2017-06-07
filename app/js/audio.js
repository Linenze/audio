/*!
 audio.js plugin for jQuery v3.2.1 by Buff
 (c) 2016-2017 Buff <https://github.com/buff2017>
 MIT-style license.
 */
~(function(w,$){
	"use strict";
	var _this
	function audio(options){
		var defaults = {
			src:'',               //  防报错
			autoPlay:true,        //  默认自动播放
			frequency:200,        //  音频默认监听频率
		}
		_this = this

		this.audio = new Audio()
		this.canplay = false

		//  保存当前音量,用于unMute方法使用
		this.beforMute = 1
		this.options = $.extend(defaults,options)

		this.init()

		//  移动端处理(移动端默认不会自动播放)
		if(this.isMobile() == 'IOS' && window.innerWidth < 767){
			this.options.autoPlay = false
		}
		this.loadAudio(this.options.src,this.options.autoPlay)



		//  赋值全局方法
		window.audioMethod = {
			play:_this.play,
			pause:_this.pause,
			togglePlay:_this.togglePlay,
			volume:_this.volume,
			mute:_this.mute,
			unMute:_this.unMute,
			toggleMute:_this.toggleMute,
			loadAudio:_this.loadAudio,
			currentTime:_this.currentTime,
			getDuration:_this.duration,
		}
	}

	//  获取百分比
	function getPercentage(num1,num2){
		return (Math.trunc(num1) / Math.trunc(num2)) * 100
	}

	var ap = audio.prototype

	/**
	 * 获取当前歌曲的总时间
	 */
	ap.duration = function(){
		return _this.audio.duration
	}

	/**
	 * 设置当前播放时间             若不传参数则为获取当前时间
	 * @param num                 设置秒数
	 * @param isPercentage        若为true 将对num / 100 处理, 用来表示num 传入的是一个百分比 (注:没有%)
	 * @return {*|Number|number}
	 */
	ap.currentTime = function(num,isPercentage){
		if(!_this.canplay ){return}
		if(typeof num === 'undefined') return _this.audio.currentTime
		_this.audio.currentTime  = isPercentage ?  Math.floor(_this.audio.duration * (num / 100)) : num
		$(w).trigger('audioTimeChange',{
			currentTime:_this.audio.currentTime,
			audioObj:_this.audio,
			currentTimePercentage:getPercentage(_this.audio.currentTime,_this.audio.duration)
		})
	}

	/**
	 * 切换静音状态
	 */
	ap.toggleMute = function(){
		_this.audio.volume === 0 ? _this.unMute() : _this.mute()
	}

	/**
	 * 关闭静音
	 */
	ap.unMute = function(){
		if(!_this.canplay ){return}
		_this.audio.volume = _this.beforMute
		$(w).trigger('audioUnMute',_this.beforMute)
	}

	/**
	 * 静音操作
	 */
	ap.mute = function(){
		if(!_this.canplay ){return}
		_this.beforMute = _this.audio.volume
		_this.audio.volume = 0
		$(w).trigger('audioMute')
	}

	/**
	 * 设置音量                   若不传参数则为获取音量
	 * @param num [0,1]          数字,表示音量
	 * @param isPercentage       若为true 将对num / 100 处理, 用来表示num 传入的是一个百分比 (注:没有%)
	 * @return {audio.volume|*|number|Number}
	 */
	ap.volume = function(num,isPercentage){
		if(!_this.canplay ){return}
		if(typeof num === 'undefined') return _this.audio.volume
		_this.audio.volume = isPercentage ? num / 100 : num
		$(w).trigger('audioVolumeChange',{
			volume:_this.audio.volume,
			volumePercentage:_this.audio.volume * 100
		})
	}

	/**
	 * 切换音频播放暂停
	 */
	ap.togglePlay = function(){
		_this.audio.paused ? _this.play() : _this.pause()
	}

	/**
	 * 音频暂停
	 */
	ap.pause = function(){
		if(!_this.canplay ){return}
		_this.audio.pause()
		$(w).trigger('audioPause',_this.audio)
		clearInterval(_this.intervalFn)
	}

	/**
	 * 音频播放
	 */
	ap.play = function(){
		if(!_this.canplay ){return}
		_this.audio.play()
		$(w).trigger('audioPlay',_this.audio)
		_this.createInterval()
	}

	/**
	 * 给audio绑定一些事件
	 */
	ap.init = function(){
		//  开始加载事件绑定
		$(this.audio).on('loadstart',function(){
			$(w).trigger('audioLoadStart')
		})

		//  音频播放结束
		$(this.audio).on('ended',function(){
			$(w).trigger('audioEnded')
			clearInterval(_this.intervalFn)
		})

	}

	/**
	 * 初始化加载音频
	 * @param src             音频地址
	 * @param isAutoPlay      是否自动播放
	 */
	ap.loadAudio = function(src,isAutoPlay){
		//  清除定时器
		_this.intervalFn && clearInterval(_this.intervalFn)
		_this.canplay = false
		//  移动端处理(移动端默认不会自动播放)
		if(_this.isMobile() == 'IOS' && window.innerWidth < 767){
			var bugMobile = new Audio()
			$(document.body).append(bugMobile)
			$(bugMobile).one('canplay',function(){
				_this.canplay = true
				$(w).trigger('audioLoadEnd',_this.audio)
				_this.pause()
			})
			_this.audio.src = _this.src = bugMobile.src = src
			_this.audio = bugMobile
			bugMobile.play()
		}else{
			$(_this.audio).one('canplay',function(){
				_this.canplay = true
				$(w).trigger('audioLoadEnd',_this.audio)
				isAutoPlay && _this.play()
			})
			_this.audio.src = _this.src = src

		}
	}

	/**
	 * 检测是否为手机
	 * @return {boolean}
	 */
	ap.isMobile = function () {
		var ua = navigator.userAgent
		var isAndroid = /Android/i.test(ua)
		var isIOS = /iPhone|iPad|iPod/i.test(ua)
		var isMobile = isAndroid || isIOS
		if (isAndroid) isMobile = 'android'
		if (isIOS) isMobile = 'IOS'
		return isMobile
	}

	/**
	 * 创建监听器
	 */
	ap.createInterval = function(){
		this.intervalFn = setInterval(function(){
			$(w).trigger('audioWatching',{
				currentTime:_this.audio.currentTime,
				duration:_this.audio.duration,
				ended:_this.audio.ended,
				percentage:getPercentage(_this.audio.currentTime,_this.audio.duration)
			})
		},_this.options.frequency)
	}


	$.extend({
		'audio':function(src,options){
			options = options ? options : {}
			if(typeof src === "string"){
				options.src = src
			}
			if(typeof src === "object"){
				options = src
			}
			new audio(options)
		}
	})
})(window,$)
