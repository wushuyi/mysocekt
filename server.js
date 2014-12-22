var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

app.all("*", function(req, res, next){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Power-By", "wushuyi");
    res.removeHeader("X-Powered-By");
    next();
});

app.use(express.static(__dirname + "/apps"));

io.on('connection', function (socket) {
    socket.on('joinRoom', function(data){
        socket.join(data.roomName);
        console.log(socket.id);
    });

    socket.on('msgToSome', function (data) {
        socket.broadcast.to(data.owner).emit('msgToSome', data.msg);
    });

    socket.on('board', function (name, data){
        socket.broadcast.to(name).emit('board', data);
    });

    socket.on('setOtherId', function(data){
        socket.broadcast.to(data.otherId).emit('setOtherId', data.selfId);
    });

    socket.on('getSocketId', function(data){
        socket.emit('getSocketId', socket.id);
    });

    socket.on('getSocketRoom', function(data){
        socket.emit('getSocketRoom', socket.rooms);
    });
});
