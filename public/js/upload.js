$(function () {
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

	var box = document.getElementById('upload-drag'),
		$thumbnail,
		imgNumbers = 0,
		data = {},
		fileName,
		url = '/upload',
		$modal = $('<div class="modal fade" data-keyboard="true" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"></div>')
					.append('<div class="modal-header"><h3 id="myModalLabel">提示</h3></div>')
					.append('<div class="modal-body"><p>你拖的不图片！</p></div>'),
		deleteImg = function (obj) {
			var imgObj = obj.parent('a').data('file');
			obj.parent('a').remove();
			if (imgObj in data) delete data[imgObj];
		},
		createThumbnail = function () {
			return $('<a href="#"></a>')
					.addClass('thumbnail')
					.append($('<a href="#" data-toggle="tooltip" title="删除">&times;</a>')
								.addClass('close-img')
								.click(function () {
									deleteImg($(this));
								})
					)

		};
	box.addEventListener('drop', function (e) {
		e.preventDefault(); //取消默认浏览器拖拽
		var fileList = e.dataTransfer.files; //获取文件对象

		//检测是否是拖拽文件到页面的操作
        if(fileList.length == 0){
            return false;
        }

         //检测文件是不是图片
        if(fileList[0].type.indexOf('image') === -1){
            $modal.modal();
            return false;
        }

        window.URL = window.URL || window.webkitURL;
        var img = window.URL.createObjectURL(fileList[0]);
        var filename = fileList[0].name; //图片名称
        var filesize = Math.floor((fileList[0].size)/1024);
        if(filesize>500){
            alert("上传大小不能超过500K.");
            return false;
        }

        var str = "<img src='"+img+"'>";
        $thumbnail = createThumbnail();
        imgNumbers += 1;
        fileName = 'file' + imgNumbers;
        data[fileName] = fileList[0];
        $thumbnail.append(str).data('file', fileName);
        $("#upload-drag").append($thumbnail);
	}, false);
	function postFormData (url, data, callback) {
		if (typeof FormData === 'undefined') {
			throw new Error ('FormData is not implemented');
		};
		var request = new XMLHttpRequest();
		request.open("POST", url);
		request.onreadystatechange = function () {
			if (request.readyState === 4 && callback)
				callback(request);
		};
		var formdata = new FormData();
		for (var name in data) {
			if (!data.hasOwnProperty(name)) continue;
			var value = data[name];
			if (typeof value === 'function') continue;
			formdata.append(name, value);
		};
		request.send(formdata);
	};
	$('.upload-submit').click(function () {
		if (box.innerHTML != ''){
			postFormData(url, data, function(){
				box.innerHTML = '';
				data = [];
				imgNumbers = 0;
			});
		};
	})
});