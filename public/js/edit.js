(function () {
	var $content = $('#post-content'),
		$title = $('#post-title'),
		$titleInput = $('.post-title_input'),
		$postBtn = $('#post-btn'),
		article = {},
		$post = $('#post');

	//提交
	var sendAjax = function (url, data) {
		$.ajax(
			{
				type: 'POST',
				url: url,
				data: data,
				success: function (mes) {
					location.href = mes.url;
				}
			}
		)
	};
	$postBtn.click(function (e) {
		if ($post.val() == '') {
			return false;
		}
		var content = $('#post').val(),
			tag = $('#tag').val().replace(/(，)|(\t)|(,)|(-)|(\.)|(:)|(--)|(\s)|(：)|(。)|(\|)/g, ';'),
			title = $('#title').val();
		post = {};
		post['content'] = content;
		post['title'] = (title != null) ? title : content.substr(0, 10);
		post['tag'] = tag;
		console.log(post['content']);
		sendAjax(location.pathname, post, 1);
	});
})();