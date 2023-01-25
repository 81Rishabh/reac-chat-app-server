const { v4: uuidv4 } = require('uuid');
const Radis = require('ioredis');
const redisClient = new Radis();
const RedisSessionStore = require('./sessionStore');
const sessionStores = new RedisSessionStore(redisClient);


function socketConfig(io) {
    // middilware for check username && session establizing
    io.use((socket, next) => {
        const sessionID = socket.handshake.auth.sessionID;

        if (sessionID) {
            //  find existing session
            const session = sessionStores.findSession(sessionID);
            console.log("session-id" , sessionID);
            if (session) {
                socket.sessionID = sessionID;
                socket.userID = session.userID;
                socket.username = session.username;
            }
            return next();
        }

        // send message to console on server side
        const username = socket.handshake.auth.username;
        console.log(`${username} is joined...`, socket.id);
        if (!username) { return next(new Error("invalid username")); }

        // create new session
        socket.userID = uuidv4();
        socket.sessionID = uuidv4();
        socket.username = username;
        next();

    });

    // socket connection
    io.on("connection", (socket) => {
        //send session detail to client
        socket.emit("session", {
            sessionID: socket.sessionID,
            userID: socket.userID
        });

        // listing all the users
        const users = [];
        for (let [id, socket] of io.of('/').sockets) {
            users.push({
                userId: id,
                username: socket.handshake.auth.username,
                isOnline: true,
                messages: []
            });
        }

        // //  send users to client side
        socket.emit('users', users);

        // notify existing users
        socket.broadcast.emit("new-user-connected", {
            userId: socket.id,
            username: socket.handshake.auth.username,
            isOnline: true,
            messages: []
        });

        // private message
        socket.on('private-message', ({ content, to }) => {
            socket.to(to).emit("private-message", {
                content,
                from: socket.id
            })
        });

        // disconnect
        socket.on("disconnect", () => {
            console.log(`${socket.handshake.auth.username} is disconnected.`);

            let offlineUsers = users.map(user => {
                if (user.userId === socket.id) {
                    return { ...user, isOnline: false }
                }
                else {
                    return user;
                }
            });

            socket.broadcast.emit('offline-users', offlineUsers);
        });
    });
}

module.exports = socketConfig;