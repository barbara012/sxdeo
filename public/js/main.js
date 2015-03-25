var Tab = $.extend(
	{},
	{
		init:function(){
			var $tabNav=$(".tab__nav"),
				$tanContent = $tabNav.siblings(".tab__content");
			$tabNav.on("click", ".tab__nav__item", function(){
				var n=$(this).index();
				$tabNav.children(".tab__nav__item").removeClass("active");
				$(this).addClass("active");
				$tanContent.children(".tab__content__cnt").removeClass("active").eq(n).addClass("active");
			})
		},
		enable : function(){
			this.init()
		}
	}
);