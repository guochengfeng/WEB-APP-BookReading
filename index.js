(function(){
	
	var Util = (function(){
		// h5的本地存储，防止别人误操作，加前缀
		var prefix = 'ficiton_reader_';
		var StorageGetter = function(key) {
			return localStorage.getItem(prefix + key);
		}
		var StorageSetter = function(key, val) {
			return localStorage.setItem(prefix + key, val);
		}
		//数据解密
		function getBSONP(url, callback) {
			return $.jsonp({
				url : url,
				cache : true,
				callback : "duokan_fiction_chapter",//函数是后台返回数据中的
				success : function(result) {
					var data = $.base64.decode(result);
					var json = decodeURIComponent(escape(data));
					callback(json);
				}
			});
		};
		return {
			getBSONP : getBSONP,
			StorageGetter : StorageGetter,
			StorageSetter : StorageSetter
		}
	})();

	function main(){
		//todo 整个项目的入口函数
		// 获取fiction_id 和 chapter_id
		var RootContainer = $('#fiction_container');
		var Fiction_id, Chapter_id;
		// 绑定事件
		var ScrollLock = false;
		var Doc = document;
		var Screen = Doc.body;
		var Win = $(window);
		//是否是夜间模式
		var NightMode = false;
		//初始化的字体大小
		var InitFontSize;
		//dom节点的缓存
		var Dom = {
			bottom_tool_bar : $('#bottom_tool_bar'),
			nav_title : $('#nav_title'),
			bk_container : $('#bgc_container'),
			day_night_button : $('#day_night_button'),
			next_button : $('#next_button'),
			prev_button : $('#prev_button'),
			back_button : $('#back_button'),
			top_nav : $('#top-nav'),
			bottom_nav : $('.bottom-nav')
		}
		// 程序初始化
		var readerUIFrame = BaseFrame(RootContainer);
		//获得章节数据，展示
		var readerModel = Model(Fiction_id || 13359, Chapter_id, function(data) {
			readerUIFrame(data);
			Dom.bottom_tool_bar.show();
			setTimeout(function() {
				ScrollLock = false;
				Screen.scrollTop = 0;
			}, 20);
		});
		//阅读器数据内容展示
		readerModel.init();

		//从缓存中读取的信息进行展示
		var ModuleFontSwitch = (function() {
			//字体和背景的颜色表
			var colorArr = [{
				value : '#f7eee5',
				name : '米白',
				font : ''
			}, {
				value : '#e9dfc7',
				name : '纸张',
				font : '',
				id : "font_normal"
			}, {
				value : '#a4a4a4',
				name : '浅灰',
				font : ''
			}, {
				value : '#cdefce',
				name : '护眼',
				font : ''
			}, {
				value : '#283548',
				name : '灰蓝',
				font : '#7685a2',
				bottomcolor : '#fff'
			}, {
				value : '#0f1410',
				name : '夜间',
				font : '#4e534f',
				bottomcolor : 'rgba(255,255,255,0.7)',
				id : "font_night"
			}];
			var tool_bar = Util.StorageGetter('toolbar_background_color');
			var bottomcolor = Util.StorageGetter('bottom_color');
			var color = Util.StorageGetter('background_color');
			var font = Util.StorageGetter('font_color');
			var bkCurColor = Util.StorageGetter('background_color');
			var fontColor = Util.StorageGetter('font_color');
			for (var i = 0; i < colorArr.length; i++) {
				var display = 'none';
				if (bkCurColor == colorArr[i].value) {
					display = '';
				}
				Dom.bk_container.append('<div class="bk-container" id="' + colorArr[i].id + '" data-font="' + colorArr[i].font + '"  data-bottomcolor="' + colorArr[i].bottomcolor + '" data-color="' + colorArr[i].value + '" style="background-color:' + colorArr[i].value + '"><div class="bk-container-current" style="display:' + display + '"></div><span style="display:none">' + colorArr[i].name + '</span></div>');
			}
			RootContainer.css('min-height', $(window).height() - 100);
			if (bottomcolor) {
				$('#bottom_tool_bar_ul').find('li').css('color', bottomcolor);
			}
			if (color) {
				$('body').css('background-color', color);
			}
			if (font) {
				$('.m-read-content').css('color', font);
			}
			//夜间模式
			if (fontColor == '#4e534f') {
				NightMode = true;
				$('#day_icon').show();
				$('#night_icon').hide();
				$('#bottom_tool_bar_ul').css('opacity', '0.6');
			}
			//字体设置信息
			InitFontSize = Util.StorageGetter('font_size');
			InitFontSize = parseInt(InitFontSize);
			if (!InitFontSize) {
				InitFontSize = 18;
			}
			RootContainer.css('font-size', InitFontSize);
		})();

		var EventHandler = (function(){
			//todo 交互的事件绑定
			//夜间和白天模式的转化
			Dom.day_night_button.click(function() {
				if (NightMode) {
					$('#day_icon').hide();
					$('#night_icon').show();
					$('#font_normal').trigger('click');
					NightMode = false;
				} else {
					$('#day_icon').show();
					$('#night_icon').hide();
					$('#font_night').trigger('click');
					NightMode = true;
				}
			});
			//字体和背景颜色的信息设置
			Dom.bk_container.delegate('.bk-container', 'click', function() {
				var color = $(this).data('color');
				var font = $(this).data('font');
				var bottomcolor = $(this).data('bottomcolor');
				var tool_bar = font;
				Dom.bk_container.find('.bk-container-current').hide();
				$(this).find('.bk-container-current').show();
				if (!font) {
					font = '#000';
				}
				if (!tool_bar) {
					tool_bar = '#fbfcfc';
				}
				if (bottomcolor && bottomcolor != "undefined") {
					$('#bottom_tool_bar_ul').find('li').css('color', bottomcolor);
				} else {
					$('#bottom_tool_bar_ul').find('li').css('color', '#a9a9a9');
				}
				$('body').css('background-color', color);
				$('.m-read-content').css('color', font);
				Util.StorageSetter('toolbar_background_color', tool_bar);
				Util.StorageSetter('bottom_color', bottomcolor);
				Util.StorageSetter('background_color', color);
				Util.StorageSetter('font_color', font);
				var fontColor = Util.StorageGetter('font_color');
				//夜间模式
				if (fontColor == '#4e534f') {
					NightMode = true;
					$('#day_icon').show();
					$('#night_icon').hide();
					$('#bottom_tool_bar_ul').css('opacity', '0.6');
				} else {
					NightMode = false;
					$('#day_icon').hide();
					$('#night_icon').show();
					$('#bottom_tool_bar_ul').css('opacity', '0.9');
				}
			});
			//按钮的多态样式效果
			$('.font-size-button').on('touchstart', function() {
				$(this).css('background', 'rgba(255,255,255,0.3)');
			}).on('touchmove', function() {
				$(this).css('background', 'none');
			}).on('touchend', function() {
				$(this).css('background', 'none');
			});
			//字体放大
			$('#large-font').click(function() {
				if (InitFontSize > 20) {
					return;
				}
				InitFontSize += 1;
				Util.StorageSetter('font_size', InitFontSize);
				RootContainer.css('font-size', InitFontSize);
			});
			//字体缩小
			$('#small-font').click(function() {
				if (InitFontSize < 12) {
					return;
				}
				InitFontSize -= 1;
				Util.StorageSetter('font_size', InitFontSize);
				RootContainer.css('font-size', InitFontSize);
			});
			var font_container = $('.font-nav-pannel');
			var font_button = $('#font_button');
			var menu_container = $('#menu_container');
			font_button.click(function() {
				if (font_container.css('display') == 'none') {
					font_container.show();
					font_button.find(".font-icon").addClass('font-icon-on');
				} else {
					font_container.hide();
					font_button.find(".font-icon").removeClass('font-icon-on');
				}
			});
			RootContainer.click(function() {
				font_container.hide();
				font_button.find(".font-icon").removeClass('font-icon-on');
			});
			//对屏幕的滚动监控
			Win.scroll(function() {
				Dom.top_nav.hide();
				Dom.bottom_nav.hide();
				font_container.hide();
				font_button.find(".font-icon").removeClass('font-icon-on');
			});
			//章节翻页
			Dom.next_button.click(function() {
				readerModel.next();
			});
			Dom.prev_button.click(function() {
				readerModel.prev();
			});
			//返回上级页面
			Dom.back_button.click(function() {
				if (Fiction_id) {
					location.href = '/book/' + Fiction_id;
				}
			});
			//返回首页
			Dom.nav_title.click(function() {
				location.href = '/';
			});
			$('.icon-back').click(function() {
				location.href = '/';
			});
			$('#menu_button').click(function() {
				location.href = 'http://dushu.xiaomi.com/fiction/chapter/306450';
				location.href = '#';
			});
			//屏幕中央事件
			$('#action_mid').click(function() {
				if (Dom.top_nav.css('display') == 'none') {
					Dom.bottom_nav.show();
					Dom.top_nav.show();
				} else {
					Dom.bottom_nav.hide();
					Dom.top_nav.hide();
					font_container.hide();
					font_button.find(".font-icon").removeClass('font-icon-on');
				}
			});
		})();

	}

	function Model(Fiction_id, Chapter_id, Model_callback){
		//todo 实现和阅读器相关的数据交互的方法
		var Title = "";
		var Fiction_id = Fiction_id;
		var Chapter_id = Chapter_id;
		// 判断localStorage中是否有Fiction_id的Chapter_id信息
		// 如果有，将它赋值给Chapter_id
		if (Util.StorageGetter(Fiction_id + 'last_chapter')) {
			Chapter_id = Util.StorageGetter(Fiction_id + 'last_chapter');
		}
		// 如果Chapter_id在localStorage中不存在则初始化为1
		if (!Chapter_id) {
			Chapter_id = 1;
		}
		var Chapters = [];
		// 初始获取第一章内容
		var init = function() {
			getFictionInfo(function() {
				gotoChapter(Chapter_id);
			});	 
		}
		// 展示chapter_id对应的章节
		var gotoChapter = function(chapter_id) {
			Chapter_id = chapter_id;
			getCurChapterContent();
		};
		//获得当前章节内容
		var getCurChapterContent = function() {
			// 请求date文件夹下的date{}.json
			$.get("data/data" + Chapter_id + ".json", function(data) {
				if (data.result == 0) {
					// 获得数据存储的url地址
					var url = data.jsonp;
					// 获取数据并解密
					Util.getBSONP(url, function(data) {
						$('#init_loading').hide();
						// 这个是一种代码健壮性的保护机制 当声明了UIcallback才会执行UIcallback 相当于if(UIcallback) {UIcallback(data)}简写
						// 执行回调函数
						Model_callback && Model_callback(data);
					});
				} else {
					// 获取失败
					alert("获取当前章节内容失败，请重试！");
				}
			}, 'json');
			return;
		};		
		// 获取小说章节信息
		var getFictionInfo = function(callback) {
			$.get("data/chapter.json", function(data) {
				Title = data.title;
				// window.ChaptersData = data.chapters;
				// window.chapter_data = data.chapters;
				// 遍历chapter_id和title以数组形式存入Chapters
				for (var i = 0; i < data.chapters.length; i++) {
					Chapters.push({
						"chapter_id" : data.chapters[i].chapter_id,
						"title" : data.chapters[i].title
					})
				}
				// 执行callback
				callback && callback();
			}, 'json');
		};		
		//获得上一章内容
		var prevChapter = function() {
			Chapter_id = parseInt(Chapter_id);
			if (Chapter_id == 0) {
				return
			}
			var cid = Chapter_id - 1;
			gotoChapter(cid);
			Util.StorageSetter(Fiction_id + 'last_chapter', Chapter_id);
		};
		//获得下一章内容
		var nextChapter = function() {
			Chapter_id = parseInt(Chapter_id);
			if (Chapter_id == Chapters.length - 1) {
				return
			}
			var cid = Chapter_id + 1;
			gotoChapter(cid);
			Util.StorageSetter(Fiction_id + 'last_chapter', Chapter_id);
		};
		return {
			init : init,
			go : gotoChapter,
			prev : prevChapter,
			next : nextChapter,
			getChapter_id : function() {
				return Chapter_id;
			}
		};
	}

	function BaseFrame(container){
		//todo 渲染基本的UI结构
		function parseChapterData(jsonData) {
			var jsonObj = JSON.parse(jsonData);
			var html = "<h4>" + jsonObj.t + "</h4>";
			for (var i = 0; i < jsonObj.p.length; i++) {
				html += "<p>" + jsonObj.p[i] + "</p>";
			}
			return html;
		}
		return function(data) {
			container.html(parseChapterData(data));
		};
	}

	main();
})();