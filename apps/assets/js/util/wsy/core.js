/**
 * Created by shuyi.wu on 2014/12/23.
 */
(function (plugin, window) {
    'use strict';

    var factory = function(){
        return plugin(window);
    };
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory();
    }
}(function(window,undefined){
    'use strict';

    window.WSY = window.WSY || {};
    return window.WSY;
},this));