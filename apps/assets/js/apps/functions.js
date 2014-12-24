/**
 * Created by shuyi.wu on 2014/12/24.
 */
define([
    'domReady',
    'jquery',
    'lodash',
    'socketio',
    'WSY',

    'wsy/canvas_board',
    'wsy/get_offset_point'
],function(
    domReady,
    $,
    _,
    io,
    WSY
){
    'use strict';
    var initBoard, gData = {}, myBoard, socket;

    initBoard = function($el, socket){
        var drawType, eraser, pen, penBlack, penRed;

        eraser = function(isRemote){
            drawType = 'eraser';
            if(!isRemote){
                socket.emit('boardCtl', gData.otherId, 'eraser');
            }
        };
        pen = function(isRemote){
            drawType = 'pen';
            if(!isRemote) {
                socket.emit('boardCtl', gData.otherId, 'pen');
            }
        };
        penBlack = function(isRemote){
            myBoard.setStyle('strokeStyle', 'black');
            if(!isRemote) {
                socket.emit('boardCtl', gData.otherId, 'penBlack');
            }
        };
        penRed = function(isRemote){
            myBoard.setStyle('strokeStyle', 'red');
            if(!isRemote) {
                socket.emit('boardCtl', gData.otherId, 'penRed');
            }
        };

        pen();

        $('#pen').on('click', function(e){
            pen();
        });
        $('#penRed').on('click', function(e){
            penRed();
        });
        $('#penBlack').on('click', function(e){
            penBlack();
        });
        $('#eraser').on('click', function(e){
            eraser();
        });


        myBoard = new WSY.CanvasBoard({
            width: 800,
            height: 600
        });
        var $canvas = $(myBoard._canvas.canvas);
        window.myBoard = myBoard;
        $el.append($canvas);
        var parentOffset = $canvas.offset();
        var getOffsetPoint = new WSY.getOffsetPoint(parentOffset);

        $canvas.on('contextmenu', function (e) {
            e.preventDefault();
        });
        $canvas.on('mousedown touchstart', function (e) {
            e.preventDefault();
            if (e.originalEvent.button === 2) {
                return false;
            }
            if(myBoard.isRemoteDraw()){
                return false;
            }
            var point = getOffsetPoint.getPoint(e);
            if(drawType === 'pen'){
                myBoard.penOnDown(point);
            }else if(drawType === 'eraser'){
                myBoard.eraserOnDown(point);
            }

        });
        $canvas.on('mousemove touchmove', function (e) {
            e.preventDefault();
            if(myBoard.isRemoteDraw()){
                return false;
            }
            var point = getOffsetPoint.getPoint(e);
            if(drawType === 'pen'){
                myBoard.penOnMove(point);
            }else if(drawType === 'eraser'){
                myBoard.eraserOnMove(point);
            }
        });
        $canvas.on('mouseup mouseleave touchend', function (e) {
            e.preventDefault();
            if(myBoard.isRemoteDraw()){
                return false;
            }
            var point = getOffsetPoint.getPoint(e);
            if(drawType === 'pen'){
                myBoard.penOnUp(point);
            }else if(drawType === 'eraser'){
                myBoard.eraserOnUp(point);
            }
        });

        myBoard.onSendBoardData = function(data){
            socket.emit('board', gData.otherId, data);
        };
        socket.on('board', function(data){
            myBoard.onReceiveBoardData(data);
        });

        socket.on('boardCtl', function(data){
            switch (data){
                case 'eraser':
                    eraser(true);
                    break;
                case 'pen':
                    pen(true);
                    break;
                case 'penRed':
                    penRed(true);
                    break;
                case 'penBlack':
                    penBlack(true);
                    break;
            }
        });
    };

    domReady(function(){
        socket = io();

        $('#connOther').on('click', function (ev) {
            gData.otherId = $.trim($('#otherId input').val());
            $('#otherId').html(gData.otherId);
            $('#connOther').hide();
            $('#toolsBar').show();
            socket.emit('setOtherId', {
                selfId: gData.selfId,
                otherId: gData.otherId
            });
            initBoard($('#canvas'), socket);
        });

        socket.on('connect', function () {
            socket.emit('getSocketId');
        });
        socket.on('getSocketId', function (data) {
            $('#selfId').text(data);
            gData.selfId = data;
        });
        socket.on('setOtherId', function (data) {
            gData.otherId = data;
            $('#otherId').html(gData.otherId);
            $('#connOther').hide();
            $('#toolsBar').show();
            initBoard($('#canvas'), socket);
        });
    });
});
