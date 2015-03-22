var PopTip = {
	targetElement: "",
	flag: 0,
	setTitle: function (title) {
		return $('<div></div>').addClass('title').text(title);
	},
	setContent: function (content) {
		return $('<div class="pop-content"></div>').append(content);
	},
	setButton: function (button) {
		return $('<div class="pop-footer clearfix"></div>').append(button);
	},
	createContainer: function () {
		return $('<div></div>').addClass('popover').addClass('pop-tip');
	},
	closePop: function () {
		$('.popover').stop().animate(
			{
				opacity: 0,
				top: '-4px'
			},
			100,
			function () {
				$(this).detach();
			}
		)
	},
	showPop: function (target, type, content, title, button, theme) {
		this.type = type ? type : 'click';
		this.content = content ? content: '';
		this.title = title ? title: '';
		this.button = button ? button: '';
		this.theme = theme ? theme: 'default';
		var _this = this;
		target.on(_this.type, function () {
			if (_this.flag === 1) {
				_this.closePop();
				_this.flag = 0;
				return false;
			}
			var $container = _this.createContainer(),
				$title = _this.setTitle(_this.title),
				$content = _this.setContent(_this.content),
				$button = _this.setButton(_this.button),
				$arrow = $('<span class="pop-arrow"></span>'),
				targetOffset = $(this).offset(),
				targetLeft = parseInt(targetOffset.left),
				targetTop = parseInt(targetOffset.top),
				targetHeight = parseInt($(this).outerHeight(true)),
				targetWidth = parseInt($(this).outerWidth(true)),
				documentWidth = parseInt($(document).width()),
				cssSet = {},
				h,
				w;

			$container.append($arrow).append($title)
					  .append($content)
					  .append($button)
					  .addClass(theme)
					  .appendTo(target);
			_this.flag = 1;
			return false;
		});
		$(document).click(function (e) {
			if (_this.flag === 1) {
				_this.closePop();
				_this.flag = 0;
			}
		});
	}
};
var WeiXinShareLink = {
	imgUrl: '',
	lineLink: location.href,
	descContent: '哗（HwH）美文',
	shareTitle: '葫芦娃',
	appid: '',
	init: function () {
		var _this = this;
		function shareFriend() {
			WeixinJSBridge.invoke('sendAppMessage',{
				"appid": _this.appid,
				"img_url": _this.imgUrl,
				"img_width": "320",
				"img_height": "320",
				"link": _this.lineLink,
				"desc": _this.descContent,
				"title": _this.shareTitle
				}, function(res) {
				_report('send_msg', res.err_msg);
				})
		}
		function shareTimeline() {
			WeixinJSBridge.invoke('shareTimeline',{
				"img_url": _this.imgUrl,
				"img_width": "320",
				"img_height": "320",
				"link": _this.lineLink,
				"desc": _this.descContent,
				"title": _this.shareTitle
				}, function(res) {
				_report('timeline', res.err_msg);
				});
		}
		function shareWeibo() {
			WeixinJSBridge.invoke('shareWeibo',{
				"content": _this.descContent,
				"url": _this.lineLink,
				}, function(res) {
				_report('weibo', res.err_msg);
				});
		}
		// 当微信内置浏览器完成内部初始化后会触发WeixinJSBridgeReady事件。
		document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {

			// 发送给好友
			WeixinJSBridge.on('menu:share:appmessage', function(argv){
				shareFriend();
			});

			// 分享到朋友圈
			WeixinJSBridge.on('menu:share:timeline', function(argv){
				shareTimeline();
			});

			// 分享到微博
			WeixinJSBridge.on('menu:share:weibo', function(argv){
				shareWeibo();
			});
		}, false);
	},
	enable: function () {
		this.init();
	}
};
