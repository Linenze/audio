/*!
 audio.js plugin for jQuery v3.2.1 by Buff
 (c) 2016-2017 Buff <https://github.com/buff2017>
 MIT-style license.
 */
~(function (w, $) {
	"use strict";

	var _this
	function isInt(n){
		return Number(n) === n && n % 1 === 0;
	}


	function Lyrics(target, options) {
		_this = this
		this.target = target

		var defaults = {
			src: '',                                               //  防报错
			timeRule: /\[\d*:\d*((\.|\:)\d*)*\]/g,                 //  用于 "[04:52.17] 歌词" 分离其中时间与歌词的正则 , 将在生成lrcArr的时候用到
			deletelrcArrItemRule: function (lrc) {                 //  替换lrc中 不需要的数据
				return lrc
			},
			itemTag: 'li',                                         //  默认生成歌词item标签名
			dashReplace: '&nbsp;',                                 //  默认将 - 与 -- 替换为 &nbbs; 注: 这里的- -- 在某些lrc中被视为间奏
			interlacedClassName: 'interlaced',                     //  隔行的class名  用于断开输出一个标签来分开间奏部分
			fromClass:'from',                                      //  如果是摘自信息所使用到的ClassName
			replaceInterlaced: function (text) {                   //  若返回的值不为false将会把自身添加 隔行class名 如 英文诗歌的 I II III 注:返回的值将会被作为Item内的值
				return false
			},
			replaceInterlacedBefor: function (text) {              //  若返沪的值不为将会在当前item元素前添加一个 隔行item 其内的值为 配置中的dashReplace
				return false
			},
			replaceFrom:function(text){
				return false
			}

		}
		this.options = $.extend(defaults, options)

		this.lrcObj = []

		this.init(this.options.src)
	}

	var lp = Lyrics.prototype

	/**
	 * 对外开放方法
	 * @param src lrc文件链接
	 */
	lp.load = function(src){
		if(src){
			this.init(src)
		}
	}

	/**
	 * 对外开放方法, 接受一个Number 通过此number 循环遍历获取index
	 */
	lp.check = function(time){
		//  遍历数组
		var maxArr = []
		for(var i in this.lrcObj){
			if(time >= +i){
				maxArr.push(+i)
			}
		}
		var itemInfo = this.lrcObj[maxArr[maxArr.length - 1]];

		if(typeof itemInfo !== 'undefined'){
			return itemInfo
		}

		//  返回第一个
		for(var i in this.lrcObj){
			return this.lrcObj[i]
		}
	}

	/**
	 * 初始化方法
	 */
	lp.init = function (src) {
		this.options.src = src
		//  加载lrc文件
		var lrcText = this.loadLrcText(src)
		//  生成lrc对象
		this.lrcObj = this.createlrcArrect(lrcText)
		//  生成 html代码块
		var itemListHtml = this.createLrcItemHtml()
		//  插入this.target
		this.target.html(itemListHtml)

		$(w).trigger('lrcTextLoadEnd')
	}

	/**
	 * 通过 lrcText 生成html代码
	 * @return {string}
	 */
	lp.createLrcItemHtml = function () {
		var tagName = this.options.itemTag

		var itemListHtml = ''

		//  保存上一个item 标签, 用于判断是否进行再次的隔行
		var prevItem = true

		//  定义一些需要隔行处理的字符串
		var EnInterlacedFirstWordArr = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]
		var interlacedFirstWordArr = ["1", "2", "3", "4", "5", "6", "7", "8", "一", "二", "三", "四", "五", "六", "七", "八"]
		//  处理 六千万
		var unitArr = ['心','个','十','百','分','千','万','指','千','萬']
		//  定义摘自信息
		var fromTextArr = ['摘自','from Follow the','에서 발췌','from "']

		//  定义一个新的lrcObj 用于更新lrcObj item 中的 index值, 更方便用户操作
		var newlrcObj = {}
		//  因会添加一些隔行标签导致用 this.lrcObj的index并不准确
		var iIndex = 0
		for (var i in this.lrcObj) {
			var itemText = this.lrcObj[i].text.trim()

			/*首先过滤英文歌词, 英文歌词以 每行 I II III ...来作为间奏*/
			if (~EnInterlacedFirstWordArr.indexOf(itemText)) {
				//  英文比较特殊这个需要给自身加
				prevItem = true
				itemListHtml += '<' + tagName + ' class="' + this.options.interlacedClassName + '">' + itemText + '</' + tagName + '>';
				var index = +i
				if(isInt(index)){
					index = Number(index+'.01')
				}
				newlrcObj[index] = {
					index:iIndex++,
					text:itemText,
					isInterlaced:true,
					timeStart:index,
					isFrom:false
				}
				continue
			}

			//  判断是否需要插入隔行符号
			var firstWord = itemText.slice(0, 1)

			//  判断是否为 - --
			if (firstWord == '-') {
				prevItem = true
				itemListHtml += '<' + tagName + ' class="' + this.options.interlacedClassName + '">' + this.options.dashReplace + '</' + tagName + '>';
				var index = +i
				if(isInt(index)){
					index = Number(index+'.01')
				}
				newlrcObj[index] = {
					index:iIndex++,
					text:this.options.dashReplace,
					isInterlaced:true,
					timeStart:index,
					isFrom:false
				}
				continue
			}

			//  判断是否需要在 interlacedFirstWordArr 数组之前插入一个字符
			if (~interlacedFirstWordArr.indexOf(firstWord) && !prevItem && !~unitArr.indexOf(itemText.slice(1, 2))) {
				//  在前面插入一个item Tag
				itemListHtml += '<' + tagName + ' class="' + this.options.interlacedClassName + '">' + this.options.dashReplace + '</' + tagName + '>';
				iIndex++
			}

			/**
			 * 处理通过 replaceInterlaced 与 replaceInterlacedBefor 参数配置的函数
			 * replaceInterlaced 与 replaceInterlacedBefor 的区别如下
			 * 1. replaceInterlaced 将会把本身替换为间距, 就如 英文歌词中的 I II II
			 * 2. replaceInterlacedBefor 将会像中文歌一样出现 1 歌词 再其前面插入间距
			 */
			var userInterlaced = this.options.replaceInterlaced(itemText)
			var userInterlacedBefor = this.options.replaceInterlacedBefor(itemText)
			if (userInterlaced !== false) {
				prevItem = true
				itemListHtml += '<' + tagName + ' class="' + this.options.interlacedClassName + '">' + userInterlaced + '</' + tagName + '>';
				var index = +i
				if(isInt(index)){
					index = Number(index+'.01')
				}
				newlrcObj[index] = {
					index:iIndex++,
					text:userInterlaced,
					isInterlaced:true,
					timeStart:index,
					isFrom:false
				}
				continue
			}
			if (userInterlacedBefor !== false && !prevItem) {
				itemListHtml += '<' + tagName + ' class="' + this.options.interlacedClassName + '">' + this.options.dashReplace + '</' + tagName + '>';
				iIndex++
			}


			var fromClass = null
			//  判断摘自信息
			fromTextArr.map(function(value){
				if(~itemText.indexOf(value)){
					fromClass = _this.options.fromClass
				}
			})

			//  处理用户传入replaceFrom判断是否为摘自信息
			if(this.options.replaceFrom(itemText)){
				fromClass = _this.options.fromClass
			}

			if(fromClass === null){
				itemListHtml += '<' + tagName + '>' + itemText + ' </' + tagName + '>';
				var index = +i
				if(isInt(index)){
					index = Number(index+'.01')
				}
				newlrcObj[index] = {
					index:iIndex++,
					text:itemText,
					isInterlaced:false,
					timeStart:index,
					isFrom:false
				}
			}else{
				itemListHtml += '<' + tagName + ' class="'+this.options.fromClass+'">' + itemText + ' </' + tagName + '>';
				var index = +i
				if(isInt(index)){
					index = Number(index+'.01')
				}
				newlrcObj[index] = {
					index:iIndex++,
					text:itemText,
					isInterlaced:false,
					timeStart:index,
					isFrom:true
				}
			}


			prevItem = false
		}

		this.lrcObj = newlrcObj

		return itemListHtml
	}

	/**
	 * 根据lrc文本文件生成lrc对象
	 * @param lrcText
	 */
	lp.createlrcArrect = function (lrcText) {
		//  判断是否为一行的lrc [ar: author][ti: 039　songs name]
		//  如果为一行需要在每个 [ 符号前加入换行符, 以达到在判断每行时进行处理
		if (/]\[/.test(lrcText)) {
			lrcText = lrcText.replace(/([^\n])\[/g, "$1\n[")
		}
		//  删除lrc中存在的 "\r", "\n", "\r\n", "\n\r"
		lrcText = lrcText.replace(/\r|\r\n|\n\r/g, '')

		//  删除lrc中不需要的数据
		//  默认替换 [ar: author]  [ti: songs Name] [al: Album] [length: 08:23] 可通过外部方法强化
		lrcText = lrcText.replace(/\[ar:.*?]/, '').replace(/\[ti:.*?]/, '').replace(/\[al:.*?]/, '').replace(/\[length:.*?]/, '')
		lrcText = this.options.deletelrcArrItemRule(lrcText)

		var arr = []
		//  遍历生成lrc对象
		var index = 0;  //  这里未使用map的index是因为,此时的index数据并不是准确
		lrcText.split("\n").map(function (value) {
			if (value === "")return
			var timeRes = value.match(_this.options.timeRule)
			if (!timeRes)return;
			var clause = value.replace(_this.options.timeRule, '');// 获取到[]后面的数据

			//  获取时间
			var timeData = timeRes[0].match(/(\d{1,2}):(\d{1,2})\.(\d{1,2})/)
			var time = Number(timeData[1]) * 60 + Number(timeData[2]) + '.' + timeData[3]

			//  保存对象
			arr[time] = {
				index: index++,
				text: clause
			}
		})

		return arr
	}

	/**
	 * 加载lrc
	 * @param src   可以为lrc远程链接, 也可以为lrc文本
	 * @return {*}
	 */
	lp.loadLrcText = function (src) {
		$(w).trigger('lrcTextLoadStart')

		var lrcText = src.indexOf('http') === 0 ? this.getLrcByAjax(src) : src

		return lrcText
	}

	/**
	 * 异步请求lrc文本文件
	 * @param src
	 */
	lp.getLrcByAjax = function (src) {
		var text = '';
		$.ajax({
			async: false,  //  同步加载
			dataType: 'text',
			method: 'GET',
			timeout: 5000,
			url: src,
			success: function (data) {
				text = data
			},
			error: function (data) {
				$(w).trigger('lrcTextLoadError', data.statusText)
			}
		})

		return text
	}


	$.fn.extend({
		lyrics: function (src, options) {
			options = options || {}
			if (typeof src === 'string') {
				options.src = src
			}
			if (typeof src === 'object') {
				!src.src && $.error('必须传入lrc链接,或文本')
				options = src
			}

			return new Lyrics(this, options)
		}
	})
})(window, $)
