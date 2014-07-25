/**
 * [Plugin style function]
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
(function($) {
    $.fn.maxChar = function() {

        var shadowIdSuffix = "_shadow";
        var sample = {
            base: [
                'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor',
                'in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,',
                'sunt in culpa qui officia deserunt mollit anim id est laborum'

            ].join(' ')
        };

        return this.each(function() {
            var me = $(this),
                shadow = createShadow(this),
                content = '',
                maxLength = sample.base.length;

            for (i = 1; content.length < maxLength && compare(shadow, me); i++) {
                content = sample.base.slice(0, i);
                shadow.html(content);
            }

            // strip the last char that caused display overflow.
            me.html(content.slice(0, -1));
            shadow.after("<div id='done'></div>");
        });

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
        }

        function compare(shadow, original) {
            return shadow.height() <= original.height();
        }

    };

})(jQuery);


/**
 * [description]
 * @return {[type]} [description]
 */
$(function() {
    // prevent js from running again when we inspect the debug in browser.
    if (!$("#done").length) {
        $('#ad').maxChar();
    }
});