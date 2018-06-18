/********************* IMPORT MODULES *********************/

const socketioJwt = require('socketio-jwt');

/*********************  WEBSOKETS ***************************/

let numUsers = 0;
/************************************************ ***/

io.sockets
    .on('connection', socketioJwt.authorize({
        secret: 'supersecret',
        //timeout: 15000 // 15 seconds to send the authentication message
    })).on('authenticated', function (socket) {
        let addedUser = false;
        //this socket is authenticated, we are good to handle more events from it.
        // when the client emits 'add user', this listens and executes
        socket.on('add user', function (username) {
            if (addedUser) return;
            // we store the username in the socket session for this client
            socket.username = username;
            ++numUsers;
            addedUser = true;
            console.log('number of users are:', numUsers);
        });
        socket.on('chat message', function (message) {
            // this is used to send to all connecting sockets except the sending one
            //socket.broadcast.emit('chat message', msg); 
            // we tell the client to execute 'chat message'
            // this is used to send to all connecting sockets
            io.sockets.emit('chat message', {
                username: socket.username,
                avatar: socket.decoded_token.user.avatar,
                message: message
            });
            console.log('message: ' + message);
            console.log('username: ' + socket.username);
            //console.log(socket.id)
        });


        socket.on('disconnect', function () {
            if (addedUser) {
                --numUsers;
            }
            console.log('user disconnected');
        });
        console.log('hello! ' + socket.decoded_token.user.first_name + ' ' + socket.decoded_token.user.last_name);
    });

/************************************************ ***/