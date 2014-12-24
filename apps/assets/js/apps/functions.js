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
        var myBoard = new WSY.CanvasBoard({
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
            myBoard.penOnDown(point);
        });
        $canvas.on('mousemove touchmove', function (e) {
            e.preventDefault();
            if(myBoard.isRemoteDraw()){
                return false;
            }
            var point = getOffsetPoint.getPoint(e);
            myBoard.penOnMove(point);
        });
        $canvas.on('mouseup mouseleave touchend', function (e) {
            e.preventDefault();
            if(myBoard.isRemoteDraw()){
                return false;
            }
            var point = getOffsetPoint.getPoint(e);
            myBoard.penOnUp(point);
        });

        myBoard.onSendBoardData = function(data){
            socket.emit('board', gData.otherId, data);
        };
        socket.on('board', function(data){
            myBoard.onReceiveBoardData(data);
        });

        return myBoard;
    };

    domReady(function(){
        socket = io();

        $('#connOther').on('click', function (ev) {
            gData.otherId = $.trim($('#otherId input').val());
            $('#otherId').html(gData.otherId);
            $('#connOther').hide();
            socket.emit('setOtherId', {
                selfId: gData.selfId,
                otherId: gData.otherId
            });
            myBoard = initBoard($('#canvas'), socket);
        });

        socket.on('connect', function () {
            socket.emit('getSocketId');
        });
        socket.on('getSocketId', function (data) {
            $('#selfId').text(data);
            gData.selfId = data;
        });
        socket.on('setOtherId', function (data) {
            console.log(data);
            gData.otherId = data;
            $('#otherId').html(gData.otherId);
            $('#connOther').hide();
            myBoard = initBoard($('#canvas'), socket);
        });
    });
});
