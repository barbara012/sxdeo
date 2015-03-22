(function () {
	var $articleBtn = $('.article-btn'),
		$article = $('.article'),
		$edit = $('.posted_edit'),
		$item = $('.title-item'),
		$operationEdit = $('.operation-group .edit'),
		$operationDelete = $('.operation-group .delete'),
		$container = $('<div></div>'),
		articleId = $('#articleId').val(),
		getOneAjax = function (url) {
		$.ajax(
			{
				type: 'get',
				url: url,
				cache: true,
				success: function (mes) {
					if ((typeof mes) == 'string') {
						return false;
					}
					$('.popover').remove();
					$article.html('<h1 class="t-c">' + mes.title + '</h1>' + mes.post);
					$operationEdit.prop('href', '/edit/' + mes._id);
					articleId = mes._id;
				}
			}
		)
	};

	$articleBtn.click(function () {
		var id = $(this).data('id');
		var name = $(this).data('name');
		var url = '/posted/' + name + '/' + id;
		$item.removeClass('active');
		$(this).parent('div').addClass('active');
		getOneAjax(url);
	});


	//删除文章
	$('.delete').click(function () {
		var url = '/delete/' + articleId;
		console.log(url);
		$.ajax(
			{
				type: 'post',
				url: url,
				success: function (mes) {
					location.reload();
				}
			}
		)
	});
})();
