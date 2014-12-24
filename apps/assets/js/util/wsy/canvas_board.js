define([
        'jquery',
        'lodash',
        'WSY',

        'wsy/canvas_buff',
        'wsy/animation_frame'
    ],
    function (
        $,
        _,
        WSY
    ) {
        'use strict';

        WSY.CanvasBoard = function(){
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
                }
            };
            this._boardCtl = {};
            this._canvas = new WSY.CanvasBuffer(800, 600);
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
                self.penRemoteDraw.call(self);
            }
        };

        WSY.CanvasBoard.prototype._drawLoopPush = function(){
            var self = this;
            var local = self._env.local;
            var ctx = self._canvas.context;

            ctx.stroke();
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

        WSY.CanvasBoard.prototype.penRemoteDraw = function(){
            var self = this;
            var remote = self._env.remote;
            if (remote.moveBuff) {
                remote.moveLock = true;
                remote.data = remote.moveBuff[0];
                remote.fpsBuff = [];
                remote.looprun = window.requestAnimFrame(function(){
                    self._penRemoteLoop.call(self);
                });
            }
        };

        WSY.CanvasBoard.prototype._penRemoteLoop = function(){
            var self = this;
            var remote = self._env.remote;
            var ctx = self._canvas.context;
            var needStroke = true;
            remote.fpsBuff = remote.data[0];
            _.forEach(remote.fpsBuff, function (data, key) {
                switch (data.m) {
                    case 1:
                        self.penOnDown(data, true);
                        break;
                    case 2:
                        self.penOnMove(data, true);
                        break;
                    case 3:
                        needStroke = false;
                        self.penOnUp(data, true);
                        break;
                }
            });
            if(needStroke){
                ctx.stroke();
            }
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
                self._penRemoteLoop.call(self);
            });
        };
    }
);