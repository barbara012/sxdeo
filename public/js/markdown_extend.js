/**
 * @author GilbertSun
 * 用于扩展一下markdown的显示，主要是显示音乐和视频
 */

var ME = function (html) {
    var markdownExtend = {
        '163': {
            reg: /<p>163:(.+)<\/p>/g,
            replace: '<p><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="http://music.163.com/outchain/player?type=2&id=$1&auto=0&height=66"></iframe></p>'
        },
        'youku': {
            reg: /<p>youku:(.+)<\/p>/g,
            replace: '<p><iframe height=498 width=510 src="http://player.youku.com/embed/$1" frameborder=0 allowfullscreen></iframe></p>'
        }
    };

    $.each(markdownExtend, function (key, value) {
        var reg = value.reg;
        var replace = value.replace;
        html = html.replace(reg, replace);
    });
    return html;
};
