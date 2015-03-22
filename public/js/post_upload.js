$(function () {
	//阻止浏览器默认事件
	$(document).on({ 
        dragleave:function(e){    //拖离 
            e.preventDefault(); 
        }, 
        drop:function(e){  //拖后放 
            e.preventDefault();
            alert(12);
        }, 
        dragenter:function(e){    //拖进 
            e.preventDefault(); 
        }, 
        dragover:function(e){    //拖来拖去 
            e.preventDefault();
        }
    });

	var $box = $('#editor-container');
	$box.on(
		{
			drop: function () {
				alert();
			},
		}
	)
		
});