(function () {
	var $userCenter = $('.user-center'),
		$container = $('<div></div>'),
		$itme1 = $('<a></a>').text('设置'),
		$itme2 = $('<a></a>').text('个人中心'),
		$itme3 = $('<a href="/logout"></a>').text('退出');
	$container.append($itme1).append($itme2).append($itme3);
	PopTip.showPop($userCenter, 'click', $container, null, null, 'default');

})();
