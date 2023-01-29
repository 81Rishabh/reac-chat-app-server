const express = require("express");
const { createServer } = require("http");
const app = express();
const { Server } = require("socket.io");
const { v4: uuidv4 } = require('uuid');
const httpServer = createServer(app);
const  {Ncrypto} = require("./helper/Enc_Dec");
const Radis = require('ioredis');
const { createAdapter } = require("@socket.io/redis-adapter");

// create redis client connection
const redisClient = new Radis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});


// socket connection
const io = new Server(httpServer, {
    origin : process.env.CLIENT_URL || 'http://localhost:3000',
}); 

const pubClient = redisClient;
const subClient = redisClient.duplicate();

pubClient.on("error", (err) => {
    console.log(err.message);
});
  
subClient.on("error", (err) => {
    console.log(err.message);
});

io.adapter(createAdapter(pubClient, subClient));

const { setupWorker } = require("@socket.io/sticky");
const { RedisSessionStore } = require('./store/sessionStore');
const { RedisMessageStore } = require('./store/messageStore');

const sessionStores = new RedisSessionStore(redisClient);
const messageStores = new RedisMessageStore(redisClient);

// middilware for check username && session establizing
io.use(async (socket, next) => {
    const sessionID = socket.handshake.auth.sessionID;

    if (sessionID) {
        //  find existing session
        const session = await sessionStores.findSession(sessionID);
        // console.log("session-id", session);
        if (session) {
            socket.sessionID = sessionID;
            socket.userID = session.userID;
            socket.username = session.username;
            return next();
        }
    }

    // send message to console on server side
    const username = socket.handshake.auth.username;
    console.log(`${username} is joined...`, socket.userID);
    if (!username) { return next(new Error("invalid username")); }

    // create new session
    socket.userID = uuidv4();
    socket.sessionID = uuidv4();
    socket.username = username;
    next();

});


// cathing errors
io.of('/').adapter.on('error', (err)=>{console.log('adapter error',err)});

// socket connection
io.on("connection", async (socket) => {
    // persist session
    sessionStores.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        isOnline: true
    });

    //send session detail to client
    socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID
    });

    socket.join(socket.userID);
    // // listing all the users
    
    // GET ALL THE MESSAGE AND SESSIONS
    const users = [];
    const [messages, sessions] = await Promise.all([
        messageStores.findMessagesForUser(socket.userID),
        sessionStores.findAllSessions(),
    ]);
   

    // MAP ALL THE USERS
   const mapPerUser = new Map();
   messages.forEach(message => {
      const {from , to} = message;
      let otherUser = socket.userID === from ? to : from;
      if(mapPerUser.has(otherUser)) {
         mapPerUser.get(otherUser).push(message);
      }
      else {
        mapPerUser.set(otherUser, [message]);
      }
   });
   
    // SET USERS SESSSION AND MESSAGE
    sessions.forEach(session => {
        users.push({
            userId: session.userID,
            username: session.username,
            isOnline: session.isOnline,
            messages: mapPerUser.get(session.userID) || []
        });
    })

    // send users to client side
    socket.emit('users', users);

    // notify existing users
    socket.broadcast.emit("user-connected", {
        userId: socket.userID,
        username: socket.username,
        isOnline: true,
        messages: []
    });


    // private message
    socket.on('private-message', ({ content, to }) => {
        // var enc_message = CryptoJS.AES.encrypt(content, 'secret key 123').toString();
        let enc_message = Ncrypto.encrypt(content);
        let message = {
            content:enc_message,
            from: socket.userID,
            to,
            key : Ncrypto.secretKey()
        }
        socket.to(to).to(socket.userID).emit("recipient-message", message);
        messageStores.saveMessage(message);
    });

    // disconnect
    // notify users upon disconnection
    socket.on("disconnect", async () => {
        //   socket.broadcast.emit("user disconnected", socket.);
        const matchingSockets = await io.in(socket.userID).fetchSockets();
        const isDisconnected = matchingSockets.size === 0;
        if (isDisconnected) {
            // notify other users
            socket.broadcast.emit("user disconnected", socket.userID);
            // update the connection status of the session
            sessionStores.saveSession(socket.sessionID, {
                userID: socket.userID,
                username: socket.username,
                isOnline: false,
            });
        }
    });
});

const PORT = process.env.PORT || 5000;

setupWorker(io);

// httpServer.listen(PORT , () => console.log('chat server is started. '+PORT));