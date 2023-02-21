const { Server } = require("socket.io");

module.exports.chat_sockets = function (chatServer) {
  const io = new Server(chatServer, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

  io.on("connection", function (socket) {
    // groups events
    groups_events(socket);

    // one to one events hanlings
    one_to_one_events(socket);

    // diconnection acknowladge
    socket.on("disconnect", function () {
      console.log("socket disconnected!");
    });
  });
};

// groups events
function groups_events(socket) {
  // user connected
  socket.on("setup", ({ user, groupId }) => {
    socket.join(groupId);
  });

  // listening group_message event
  socket.on("group_message", (userData) => {
    // boradcast message all the associated groups
    socket.to(userData.groupId).emit("message", userData);
  });

  // handle typing
  socket.on("group-typing", (indicator) => {
    socket.to(indicator.groupId).emit("group typing", indicator);
  });
}

// one to one events
function one_to_one_events(socket) {
  // user connection
  socket.on("one-to-one-connection", (userData) => {
    socket.join(userData._id);
    console.log(`${userData.username} is joined...`);
  });

  // private message
  socket.on("privateMessage", ({ to, from, content, time }) => {
    // broad cast private message to userData.userId
    socket.to(to).to(from).emit("private-message", {
      content,
      from,
      to,
      time,
    });
  });

  // handle typing
  socket.on("individual-typing", (indicator) => {
    const { to, from} = indicator;
    socket.to(to).to(from).emit("individual typing", indicator);
  });
}
