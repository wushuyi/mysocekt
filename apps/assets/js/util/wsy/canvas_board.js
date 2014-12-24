/**
 * Created by shuyi.wu on 2014/12/24.
 */
define([
        'lodash',
        'WSY',

        'wsy/canvas_buff',
        'wsy/animation_frame'
    ],
    function (
        _,
        WSY
    ) {
        'use strict';

        WSY.CanvasBoard = function(options){
            if(!options || typeof options !== 'object'){
                throw 'error options';
            }
            this._env = {
                local: {
                    moveBuff: [],
                    fpsBuff: [],
                    moveLock: false,
                    looprun: null
                },
                remote: {
                    moveBuff: [],
                    fpsBuff: [],
                    moveLock: false,
                    looprun: null,
                    data: null
                },
                ctxSave: {}
            };
            this._boardCtl = {};
            this._canvas = new WSY.CanvasBuffer(options.width, options.height);
        };

        WSY.CanvasBoard.prototype._sendBoardData = function(data){
            var self = this;
            self.onSendBoardData.call(this, data);
        };

        WSY.CanvasBoard.prototype.onSendBoardData = function(data){
            //console.log(data);
        };

        WSY.CanvasBoard.prototype.onReceiveBoardData = function(data){
            var self = this;
            var remote = self._env.remote;
            remote.moveBuff.push(data);
            if(!remote.moveLock){
                self.remoteDraw.call(self);
            }
        };

        WSY.CanvasBoard.prototype.remoteDraw = function(){
            var self = this;
            var remote = self._env.remote;
            if (remote.moveBuff) {
                remote.moveLock = true;
                remote.data = remote.moveBuff[0];
                remote.fpsBuff = [];
                remote.looprun = window.requestAnimFrame(function(){
                    self._remoteLoop.call(self);
                });
            }
        };

        WSY.CanvasBoard.prototype._drawLoopPush = function(){
            var self = this;
            var local = self._env.local;
            var ctx = self._canvas.context;
            var boardCtl = self._boardCtl;

            if(boardCtl.drawType === 'pen'){
                ctx.stroke();
            }

            local.moveBuff.push(local.fpsBuff);
            local.fpsBuff = [];
            if (local.moveBuff.length === 30) {
                self._sendBoardData(local.moveBuff);
                local.moveBuff = [];
            }
            local.looprun = window.requestAnimFrame(function(){
                self._drawLoopPush.call(self);
            });
        };

        WSY.CanvasBoard.prototype._remoteLoop = function(){
            var self = this;
            var remote = self._env.remote;
            var ctx = self._canvas.context;

            remote.fpsBuff = remote.data[0];
            _.forEach(remote.fpsBuff, function (data, key) {
                switch (data.m) {
                    case 2:
                        self.penOnMove(data, true);
                        ctx.stroke();
                        break;
                    case 4:
                        self.eraserOnMove(data, true);
                        break;
                    case 1:
                        self.penOnDown(data, true);
                        ctx.stroke();
                        break;
                    case 3:
                        self.penOnUp(data, true);
                        break;
                    case 5:
                        self.eraserOnDown(data, true);
                        break;
                    case 6:
                        self.eraserOnUp(data, true);
                        break;
                    default :

                }
            });
            remote.data.shift();
            if (!remote.data.length) {
                remote.moveBuff.shift();
                remote.data = remote.moveBuff[0];
                if (!remote.data) {
                    window.cancelAnimationFrame(remote.looprun);
                    remote.moveLock = false;
                    return false;
                }
            }
            remote.looprun = window.requestAnimFrame(function(){
                self._remoteLoop.call(self);
            });
        };

        WSY.CanvasBoard.prototype.penOnDown = function(point, isRemote){
            var self = this;
            var local = self._env.local;
            var ctx = self._canvas.context;
            var boardCtl = self._boardCtl;

            boardCtl.isDown = true;
            boardCtl.drawType = 'pen';
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(point.x + 1, point.y + 1);
            ctx.stroke();
            if (!isRemote) {
                point.m = 1;
                local.moveBuff.push([
                    point
                ]);
            }
        };

        WSY.CanvasBoard.prototype.penOnMove = function(point, isRemote){
            var self = this;
            var local = self._env.local;
            var ctx = self._canvas.context;
            var boardCtl = self._boardCtl;
            var drawLoopPush = self._drawLoopPush;

            if (!(boardCtl.isDown || boardCtl.drawType === 'pen')) {
                return false;
            }
            ctx.lineTo(point.x, point.y);
            if (!isRemote) {
                point.m = 2;
                local.fpsBuff.push(point);
                if (!local.moveLock) {
                    local.moveLock = true;
                    local.looprun = window.requestAnimFrame(function(){
                        drawLoopPush.call(self);
                    });
                }
            }
        };

        WSY.CanvasBoard.prototype.penOnUp = function(point, isRemote){
            var self = this;
            var local = self._env.local;
            var ctx = self._canvas.context;
            var boardCtl = self._boardCtl;

            if (!boardCtl.isDown) {
                return false;
            }
            window.cancelAnimationFrame(local.looprun);
            local.fpsBuff = [];
            local.moveLock = false;
            boardCtl.isDown = false;
            boardCtl.drawType = null;
            ctx.closePath();
            if (!isRemote) {
                point.m = 3;
                local.moveBuff.push([
                    point
                ]);
                self._sendBoardData.call(self, local.moveBuff);
                local.moveBuff = [];
            }
        };

        WSY.CanvasBoard.prototype.eraserOnDown = function(point, isRemote){
            var self = this;
            var local = self._env.local;
            var ctx = self._canvas.context;
            var boardCtl = self._boardCtl;

            boardCtl.isDown = true;
            boardCtl.drawType = 'eraser';
            ctx.clearRect(point.x, point.y - 30, 30, 30);
            if(!isRemote){
                point.m = 4;
                local.moveBuff.push([
                    point
                ]);
            }
        };

        WSY.CanvasBoard.prototype.eraserOnMove = function(point, isRemote){
            var self = this;
            var local = self._env.local;
            var ctx = self._canvas.context;
            var boardCtl = self._boardCtl;
            var drawLoopPush = self._drawLoopPush;

            if(!boardCtl.isDown || boardCtl.drawType !== 'eraser'){
                return false;
            }
            boardCtl.drawType = 'eraser';
            ctx.clearRect(point.x, point.y - 30, 30, 30);

            if(!isRemote){
                point.m = 5;
                local.fpsBuff.push(point);
                if (!local.moveLock) {
                    local.moveLock = true;
                    local.looprun = window.requestAnimFrame(function(){
                        drawLoopPush.call(self);
                    });
                }
            }
        };

        WSY.CanvasBoard.prototype.eraserOnUp = function(point, isRemote){
            var self = this;
            var local = self._env.local;
            var boardCtl = self._boardCtl;

            if(!boardCtl.isDown || boardCtl.drawType !== 'eraser'){
                return false;
            }
            window.cancelAnimationFrame(local.looprun);
            local.fpsBuff = [];
            local.moveLock = false;
            boardCtl.isDown = false;
            boardCtl.drawType = null;
            if(!isRemote){
                point.m = 6;
                local.moveBuff.push([
                    point
                ]);
                self._sendBoardData.call(self, local.moveBuff);
                local.moveBuff = [];
            }
        };

        WSY.CanvasBoard.prototype.saveStyle = function(){
            var self = this;
            var ctx = self._canvas.context;
            var ctxSave = self._env.ctxSave;
            var testValue = '[object HTMLCanvasElement]';
            for (var key in ctx) {
                if (ctx.hasOwnProperty(key)) {
                    var value = ctx[key];
                    if (value.toString() !== testValue) {
                        ctxSave[key] = value;
                    }
                }
            }
        };

        WSY.CanvasBoard.prototype.restoreStyle = function(){
            var self = this;
            var ctx = self._canvas.context;
            var ctxSave = self._env.ctxSave;
            for (var key in ctxSave) {
                if (ctx.hasOwnProperty(key)) {
                    ctx[key] = ctxSave[key];
                }
            }
        };

        WSY.CanvasBoard.prototype.setStyle = function(key, value){
            if(!key || !value){
                throw 'error arguments';
            }
            var self = this;
            var ctx = self._canvas.context;
            ctx[key] = value;
        };

        WSY.CanvasBoard.prototype.resize = function(options){
            if(!options || typeof options !== 'object'){
                throw 'error options';
            }
            var self = this;
            var canvas = self._canvas.canvas;
            var ctx = self._canvas.context;

            var saveCanvas = canvas.toDataURL();
            self.saveStyle.call(self);
            if(options.width){
                canvas.width = options.width;
            }
            if(options.height){
                canvas.height = options.height;
            }
            self.restoreStyle.call(self);
            var img = new Image();
            img.onload = function(){
                ctx.drawImage(img, 0, 0, img.width, img.height);
                img = null;
            };
            img.src = saveCanvas;
        };

        WSY.CanvasBoard.prototype.isRemoteDraw = function(){
            var self = this;
            return self._env.remote.moveLock;
        };
    }
);