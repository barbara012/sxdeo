(function () {
	var $hideIput = $('#hidden'),
		box = document.getElementById('post'),
		$content = $('#post-content'),
		$title = $('#post-title'),
		$titleInput = $('.post-title_input'),
		$postBtn = $('#post-btn'),
		article = {},
		$post = $('#post');

	function Editor(input, preview) {
		this.update = function () {
			preview.innerHTML = ME(markdown.toHTML(input.value));
		};
		input.editor = this;
		this.update();
	};

	//ajax
	var sendAjax = function (url, data, option) {
		$.ajax(
			{
				type: 'POST',
				url: url,
				data: data,
				success: function (mes) {
					if (option === 1) {
						if (mes['type'] === 3) {
							noty(
								{
									text: mes['mes'],
									type: 'success',
									timeout: 2000,
									killer: false,
									dismissQueue: true,
									layout: 'topCenter'
								}
							)
							setTimeout( function (){location.href = mes.url;} , 2000);
						} else {
							console.log('葫芦娃');
						}
					} else {
						return false;
					}
				}
			}
		)
	};
	var getObj = function (id) { return document.getElementById(id); };
	new Editor(getObj("post"), getObj("preview"));
	// 插入图片
	//在textarea光标处插入内容
	function insertContent(obj, content) {
		if (document.selection) {
			var selected = document.selection.createRange();
			selected.text = content;
		} else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
			var startPos = obj.selectionStart,
				endPos = obj.selectionEnd,
				cursorPos = startPos,
				tmpStr = obj.value;
			obj.value = tmpStr.substring(0, startPos) + content + tmpStr.substring(endPos, tmpStr.length);
			cursorPos += content.length;
			obj.selectionStart = obj.selectionEnd = cursorPos;
		} else {
			obj.value += content;
		}
	};
	//阻止浏览器默认事件
	$(document).on({
		dragleave:function(e){    //拖离
			e.preventDefault(); 
		},
		drop:function(e){  //拖后放
			e.preventDefault();
		},
		dragenter:function(e){    //拖进
			e.preventDefault();
		},
		dragover:function(e){    //拖来拖去
			e.preventDefault();
		}
	});

	var progress = document.getElementById('progress-container');
	var progressBar = document.getElementById('progress-bar');
	var flagDropRepeat = 0; // 防止拖拽重叠

	function postFormData(url, data, callback) {
		if (typeof FormData === 'undefined') {
			throw new Error ('FormData is not implemented');
		};

		var request = new XMLHttpRequest();
		var formdata = new FormData();
		for (var name in data) {
			if (!data.hasOwnProperty(name)) continue;
			var value = data[name];
			if (typeof value === 'function') continue;
			formdata.append(name, value);
		};
		request.onreadystatechange = function () {
			if (request.readyState === 4 && callback)
				callback(request);
		};
		request.upload.onprogress = function (event) {
			if (event.lengthComputable) {
			 	setProgress(event.loaded / event.total);
			}
		};
		request.open("POST", url);
		request.send(formdata);
		flagDropRepeat = 1;
	};
	//
	function setProgress (percent) {
		progressBar.style.width = progress.clientWidth * percent + 'px';
		if (percent === 1) {
			progress.style.display = 'none';
		}
	};

	box.addEventListener('drop', function (e) {
		e.preventDefault(); //取消默认浏览器拖拽
		if (flagDropRepeat === 1) return;
		var imgFile = e.dataTransfer.files,	//获取文件对象
			data = {},
			imgUrl,
			url = '/post/' + $hideIput.val();
		if (imgFile.length === 0) return;

		if (imgFile[0].type.indexOf('image') === -1)  return;

		if (imgFile[0].size > 2097152) { //  2 * 1024 * 1024
			alert('图片尺寸过大！服务器硬盘扛不住！');
			return;
		}

		data['image'] = imgFile[0];

		progress.style.display = 'block';

		postFormData(url, data, function (mes) {
			//$post.val($post.val() + '![](' + mes.response + ')');
			flagDropRepeat = 0;
			insertContent(box, '![15](' + mes.response + ')');
			new Editor(getObj("post"), getObj("preview"));
		});
	}, false);
	//post
	var flagPost = 0;
	$postBtn.click(function (e) {
		if ($post.val() == '') {
			return false;
		}
		if (flagPost === 1) return;
		var content = $('#post').val(),
			tag = $('#tag').val().replace(/(，)|(\t)|(,)|(-)|(\.)|(:)|(--)|(\s)|(：)|(。)|(\|)/g, ';'),
			title = $('#title').val();
		post = {};
		post['content'] = content;
		post['title'] = (title != null) ? title : content.substr(0, 10);
		post['tag'] = tag;
		sendAjax(location.pathname, post, 1);
		flagPost = 1;
	});
	//
	$('#tag').keydown(function (e) {
		if (e.keyCode === 13) {
			return false;
		}
	});
	//
	$(document).delegate('#post', 'keydown', function(e) {
	  var keyCode = e.keyCode || e.which;

	  if (keyCode == 9) {
	    e.preventDefault();
	    var start = $(this).get(0).selectionStart;
	    var end = $(this).get(0).selectionEnd;

	    // set textarea value to: text before caret + tab + text after caret
	    $(this).val($(this).val().substring(0, start)
	                + "\t"
	                + $(this).val().substring(end));

	    // put caret at right position again
	    $(this).get(0).selectionStart =
	    $(this).get(0).selectionEnd = start + 1;
	  }
	});
})();
var Preview = $.extend(
	{}, {

		init: function () {
			var $previewContainer = $('.preview-container');
			var $editorContainer = $('.editor-container');
			var _this = this;
			$('.btn-preview').click(function () {
				if ($previewContainer.hasClass('show')) {
					$previewContainer.removeClass('show');
					$editorContainer.css('opacity', 1);
				} else {
				    $('#post')[0].editor.update();
					$previewContainer.css('height', _this.getHeight($editorContainer))
						.addClass('show');
					$editorContainer.css('opacity', 0);
				}
			});
		},
		getHeight: function ($obj) {
			return $obj.outerHeight();
		},
		enable: function () {
			this.init();
		}
	}
);
