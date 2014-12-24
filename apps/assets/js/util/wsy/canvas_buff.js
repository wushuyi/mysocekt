/**
 * Created by shuyi.wu on 2014/12/23.
 */
/* global WSY */
(function (plugin, window) {
    'use strict';

    var factory = function(WSY){
        return plugin(WSY, window);
    };
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['WSY'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(WSY);
    }
}(function(WSY,window,undefined){
    'use strict';

    WSY.CanvasBuffer = function (width, height) {
        this.width = width;
        this.height = height;
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.canvas.width = width;
        this.canvas.height = height;
    };

    WSY.CanvasBuffer.prototype.constructor = WSY.CanvasBuffer;
    WSY.CanvasBuffer.prototype.clear = function () {
        this.context.clearRect(0, 0, this.width, this.height);
    };
    WSY.CanvasBuffer.prototype.resize = function (width, height) {
        this.width = this.canvas.width = width;
        this.height = this.canvas.height = height;
    };
},this));