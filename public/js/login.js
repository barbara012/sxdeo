(function () {
	var $username = $('#username'), //登录 -用户名
		$password = $('#password'), //登录--密码

		$passwordTip = $('.password-tip'), //密码错误提示
		$usernameTip = $('.username-tip'), //用户名错误提示

		$regNameTip = $('.reg_name-tip'), //注册用户名提示
		$regEmailTip = $('.reg_email-tip'), //注册邮箱提示
		$regPassTip = $('.reg_pass-tip'), //注册密码提示
		$regRepeatTip = $('.reg_repeat-tip'), //注册密码重复提示

		$regUsername = $('#reg_username'), //注册--用户名
		$regEmail = $('#reg_email'), //注册--邮箱
		$regPassword = $('#reg_password'), //注册--密码
		$regPasswordRepeat  = $('#reg_password-repeat'), //注册--重复密码

		$btnLogin = $('.btn-login'), //登录按钮
		$btnReg = $('.btn-reg'), //注册按钮
		$resetPassword = $('.reset-password'),//忘记密码

		$showReg = $('.show-reg'), //打开注册窗口

		$login = $('#login'), //登录窗口
		$reg = $('.reg'), //注册窗口
		$reset = $('.reset'),//重置密码窗口

		$returnLogin = $('.return-log'), //返回登录窗口
		data,

		tipCssReset = {
			left: '220px',
			opacity: 0
		},
		tipCssSet = {
			left: '224px',
			opacity: 1
		},
		logCssSet = {
			'margin-left': '-260px'
		},
		logCssSetRight = {
			'margin-left': '10px'
		},
		logCssReset = {
			'margin-left': '-110px'
		},
		regCssSet = {
			'left': '260px',
			'opacity': 1,
			'z-index': 220
		},
		regCssReset = {
			'left': '220px',
			'opacity': 0,
			'z-index': -200
		},
		resetCssSet = {
			'right': '260px',
			'opacity': 1,
			'z-index': 220
		},
		resetCssReSet = {
			'right': '240px',
			'opacity': 0,
			'z-index': 240
		},
		lrAjax = function (url, data, option) {
			$.ajax(
				{
					type: 'POST',
					url: url,
					data: data,
					success: function (mes) {
						if (option === 'log') {
							if (mes['type'] === 1) {
								$usernameTip.find('p').text(mes['mes']);
								$usernameTip.removeClass('input-tip');
								$usernameTip.css(tipCssSet);
							} else if (mes['type'] === 2){
								$passwordTip.find('p').text(mes['mes']);
								$passwordTip.removeClass('input-tip');
								$passwordTip.css(tipCssSet);
							} else {
								location.href = '/';
							}
						} else {
							if (mes['type'] === 0) {
								location.href = '/';
							} else if (mes['type'] === 1) {
								$regNameTip.find('p').text(mes['mes']);
								$regNameTip.removeClass('input-tip')
									.css(tipCssSet);
							} else if (mes['type'] === 3) {
								$regEmailTip.find('p').text(mes['mes']);
								$regEmailTip.removeClass('input-tip').css(tipCssSet);
							}
						}
					}
				}
			)
		}
	$username.focus(function () {
		$usernameTip.css(tipCssReset);
	});
	$password.focus(function () {
		$passwordTip.css(tipCssReset);
	});
	$regUsername.focus(function () {
		$regNameTip.css(tipCssReset);
	});
	$regPassword.focus(function () {
		$regPassTip.css(tipCssReset);
	});
	$regPasswordRepeat.focus(function () {
		$regRepeatTip.css(tipCssReset);
	});
	$regEmail.focus(function () {
		$regEmailTip.css(tipCssReset);
	})

	$btnLogin.click(Login);
	// $(document).keydown(function (e) {
	// 	if (e.keyCode === 13) {
	// 		Login();
	// 	}
	// });
	function Login () {
		if (!$username.val()) {
			$usernameTip.find('p').text('请输入用户名！');
			$usernameTip.addClass('input-tip')
						.css(tipCssSet);
			return false;
		}
		if (!$password.val()) {
			$passwordTip.find('p').text('请输入密码！');
			$passwordTip.addClass('input-tip')
						.css(tipCssSet);
			return false;
		}
		data = {};
		data['username'] = $username.val();
		data['password'] = $password.val();

		lrAjax(location.pathname, data, 'log');
	}
	//show reset
	$resetPassword.click(function () {
		$usernameTip.css(tipCssReset);
		$passwordTip.css(tipCssReset);
		$login.addClass('matte').css(logCssSetRight);
		var t = setTimeout(
			function () {
				$reset.css(resetCssSet)
			},
			200
		);
	})
	//show register
	$showReg.click(function () {
		$usernameTip.css(tipCssReset);
		$passwordTip.css(tipCssReset);
		$login.addClass('matte').css(logCssSet);
		var t = setTimeout(
			function () {
				$reg.css(regCssSet)
			},
			200
		);

	});
	//返回登录窗口
	$returnLogin.click(function () {
		$regNameTip.css(tipCssReset);
		$regPassTip.css(tipCssReset);
		$regRepeatTip.css(tipCssReset);
		$regEmailTip.css(tipCssReset);

		$reg.css(regCssReset);
		$reset.css(resetCssReSet);
		var t = setTimeout(
			function () {
				$login.removeClass('matte').css(logCssReset)
			},
			200
		);
	});
	//注册提交，信息校验
	$btnReg.click(function () {
		if (!$regUsername.val()) {
			$regNameTip .find('p').text('请输入用户名！');
			$regNameTip.addClass('input-tip')
					   .css(tipCssSet);
			return false;
		}
		var reg = /`|~|!|@|#|\$|%|\^|\*|\(|\-|\)|\+|_|=|\/|\||\\|。|，|》|《|>|<|！/;
		if(reg.test($regUsername.val())) {
			$regNameTip.find('p').text('包含非法字符。可以包含英文字母，数字，和三个符号 - . _');
			$regNameTip.addClass('input-tip')
						.css(tipCssSet);
			return false;
		}

		if ($regUsername.val().length > 20) {
			$regNameTip.find('p').text('20个字符内');
			$regNameTip.addClass('input-tip')
						.css(tipCssSet);
			return false;
		}
		if (!$regPassword.val()) {
			$regPassTip.addClass('input-tip').css(tipCssSet);
			return false;
		};

		if ($regPassword.val() != $regPasswordRepeat.val()) {
			$regRepeatTip.addClass('input-tip').css(tipCssSet);
			return false;
		}

		if ($regEmail.val() && !(/^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test($regEmail.val()))) {
			$regEmailTip.css(tipCssSet);
			return false;
		}

		data = {};
		data['regUserName'] = $regUsername.val();
		data['regPassword'] = $regPassword.val();
		 data['regEmail'] = $regEmail.val();
		lrAjax('/reg', data, 'reg');

	});
})();