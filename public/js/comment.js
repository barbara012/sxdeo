(function () {
	$('p').has('img').addClass('p-img');

	var $name = $('#form_comment_name'),
		$email = $('#form_comment_email'),
		$comment = $('#form_comment_content'),
		$comments = $('.comments'),
		$aboutAuthor = $('.about_author'),
		$singlePage = $('.singlepage'),
		$remove = $('.remove'),
		$container = $('<div></div>'),
		data,
		timeFlag = 0;
		tipCss = {
			'right': '116px',
			'opacity': 1
		},
		tipCssReset = {
			'right': '110px',
			'opacity': 0
		},
		createButton = function () {
			return $('<button type="button"></button>');
		},
		commentAjax = function (url, data) {
			$.ajax(
				{
					type: 'POST',
					url: url,
					data: data,
					success: function (comment) {
						$('<div class="commented pos-rela"></div>')
							.append($('<a class="comment_head pos-abso"></a>').append($('<img src="' + comment.head + '">')))
							.append(
								$('<div class="comment_content"></div>')
									.append($('<p>' + comment.content + '</p>'))
									.append(
										$('<p class="info"></p>')
											.append($('<a href="javascript:;">' + comment.name + '</a>'))
											.append($('<span>回复于' + comment.time + '</span>'))
									)
								)
							.prependTo($comments);
						$('.time-tip').css(tipCssReset);
						timeFlag = 0;
					}
				}
			)
		};

	$('.btn-comment').click(function () {

		if (timeFlag === 1) {
			$('.time-tip').css(tipCss);
			return false;
		}
		if (!$comment.text()) return false;

		data = {};
		data['name'] = $name.val() ? $name.val() : '匿名';
		data['email'] = $email.val() ? $email.val() : '838186163@qq.com';
		data['content'] = $comment.text();
		commentAjax(location.pathname, data);
		timeFlag = 1;
		setHeight();

	});
	var sureButton = createButton().addClass('btn')
		.addClass('sure')
		.text('确定')
		.off('click')
		.on('click', function () {
			var url = $remove.data('url');
			$.ajax(
				{
					type: 'post',
					url: url,
					success: function (mes) {
						location.href = '/';
					}
				}
			)
			return false;
		});
	var cancleButton = createButton().addClass('btn')
		.addClass('cancel')
		.text('取消')
		.off('click')
		.on('click', function () {});
	$container.empty().append(sureButton).append(cancleButton);
	PopTip.showPop($remove, null,null, '确定要删除这篇文章吗？', $container, 'warning');
})();