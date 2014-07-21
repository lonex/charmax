/**
 * [Plugin style function]
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
(function($) {
  $.fn.maxChar = function() {

    var shadowIdSuffix = "_shadow";

    function createShadow(pEl) {
      var shadow = 
        $(pEl.cloneNode(true))
         .attr('id', $(pEl).attr('id') + shadowIdSuffix)
         .hide()
         .css({
            'position': 'absolute',
            'overflow': 'visible', 
            'left': '800px'
         })
         .width($(pEl).width())
         .height('auto');
      $(pEl).after(shadow);
      return shadow;
    };

    function compare(shadow, original) {
      return shadow.height() > original.height();
    };

    return this.each(function() {
      var me = $(this);

      var shadow = createShadow(this);
      var content = me.html();

      while (content.length > 0 && compare(shadow, me)) {
        content = content.slice(0, -1);
        shadow.html(content);
      }

      me.html(content);
    });
  };

})(jQuery);


/**
 * [description]
 * @return {[type]} [description]
 */
$(function() {
  $('.measure').maxChar();
});
