define([
        'domReady',
        'jquery',
        'lodash',
        'socketio',
        'WSY',

        'wsy/canvasbuff',
        'wsy/animationframe'
    ],

    function (
        domReady,
        $,
        _,
        io,
        WSY
    ) {
        'use strict';

        var gData = {};

        domReady(function(document){
            initSocket();
        });

        function initSocket() {
            var socket = io();

            window.socket = socket;

            $("#connOther").on('click', function (ev) {
                gData.otherId = $.trim($("#otherId input").val());
                $("#otherId").html(gData.otherId);
                $("#connOther").hide();
                socket.emit('setOtherId', {
                    selfId: gData.selfId,
                    otherId: gData.otherId
                });
                initCanvas();
            });

            socket.on('connect', function () {
                socket.emit('getSocketId');
            });

            socket.on('setOtherId', function (data) {
                console.log(data);
                gData.otherId = data;
                $("#otherId").html(gData.otherId);
                $("#connOther").hide();
                initCanvas();
            });

            socket.on('msgToSome', function (data) {
                console.log(data);
            });

            socket.on('getSocketId', function (data) {
                $("#selfId").text(data);
                gData.selfId = data;
            });

            socket.on('getSocketRoom', function (data) {
                console.log(data);
            });
        }

        function initCanvas() {
            var boardCtl = {};

            var canvasBuff = new WSY.CanvasBuffer(800, 600);
            var canvas = canvasBuff.canvas;
            var ctx = canvasBuff.context;
            $('#canvas').append(canvas);
            var $canvas = $('canvas');
            $canvas.on('contextmenu', function (ev) {
                ev.preventDefault();
            });
            $canvas.on('mousedown', function (ev) {
                if (ev.originalEvent.button === 2) {
                    return false;
                }
                var point = {
                    x: ev.offsetX,
                    y: ev.offsetY
                };
                penOnDown(point);
            });
            $canvas.on('mousemove', function (ev) {
                var point = {
                    x: ev.offsetX,
                    y: ev.offsetY
                };
                penOnMove(point);
            });
            $canvas.on('mouseup mouseleave', function (ev) {
                var point = {
                    x: ev.offsetX,
                    y: ev.offsetY
                };
                penOnUp(point);
            });

            var remoteBuff = [];
            var remoteLock = false;
            socket.on('board', function (data) {
                remoteBuff.push(data);
                if (!remoteLock) {
                    drawRemote();
                }
            });

            function drawRemote() {
                if (remoteBuff.length) {
                    remoteLock = true;
                    var data = remoteBuff[0];
                    var fpsBuff = [];
                    var looprun;
                    var testlock = false;

                    var loopPush = function () {
                        fpsBuff = data[0];
                        _.forEach(fpsBuff, function (data, key) {
                            switch (data.m) {
                                case 1:
                                    penOnDown(data, true);
                                    break;
                                case 2:
                                    penOnMove(data, true);
                                    break;
                                case 3:
                                    testlock = true;
                                    penOnUp(data, true);
                                    break;
                            }
                        });
                        testlock = testlock ? false  : (function(){ ctx.stroke(); return true; })();
                        data = _.rest(data);
                        if (data.length === 0) {
                            remoteBuff = _.rest(remoteBuff);
                            data = remoteBuff[0];
                            if (!data) {
                                window.cancelAnimationFrame(loopPush);
                                remoteLock = false;
                                return false;
                            }
                        }
                        looprun = window.requestAnimationFrame(loopPush);
                    };
                    looprun = window.requestAnimationFrame(loopPush);
                }
            }

            var moveBuff = [];
            var fpsBuff = [];
            var moveLock = false;
            var looprun;

            var loopPush = function () {
                ctx.stroke();
                moveBuff.push(fpsBuff);
                fpsBuff = [];
                if (moveBuff.length == 30) {
                    socket.emit('board', gData.otherId, moveBuff);
                    moveBuff = [];
                }
                looprun = window.requestAnimationFrame(loopPush);
            };

            function penOnDown(point, isRemote) {
                boardCtl.isDown = true;
                boardCtl.drawType = 'pen';
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(point.x + 1, point.y + 1);
                ctx.stroke();
                if (!isRemote) {
                    point.m = 1;
                    moveBuff.push([
                        point
                    ]);
                }
            }

            function penOnMove(point, isRemote) {
                if (isRemote) {
                    //console.log(point);
                }
                if (!(boardCtl.isDown || boardCtl.drawType === 'pen')) {
                    //console.log('run');
                    return false;
                }
                ctx.lineTo(point.x, point.y);
                if (!isRemote) {
                    point.m = 2;
                    fpsBuff.push(point);
                    if (!moveLock) {
                        moveLock = true;
                        looprun = window.requestAnimationFrame(loopPush);
                    }
                }
            }

            function penOnUp(point, isRemote) {
                if (!boardCtl.isDown) {
                    return false;
                }
                window.cancelAnimationFrame(looprun);
                fpsBuff = [];
                moveLock = false;
                //console.log(moveBuff);
                boardCtl.isDown = false;
                boardCtl.drawType = null;
                ctx.closePath();
                if (!isRemote) {
                    point.m = 3;
                    moveBuff.push([
                        point
                    ]);
                    socket.emit('board', gData.otherId, moveBuff);
                    moveBuff = [];
                }
            }
        }
    }
);