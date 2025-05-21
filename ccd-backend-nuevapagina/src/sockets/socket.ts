import { Server as SocketIOServer } from "socket.io";


class Sockets {
  private io: SocketIOServer;
  constructor(io: SocketIOServer) {
    this.io = io;
    this.socketEvents();
  }

  socketEvents() {
    // On connection
    this.io.on("connection", (socket) => {

      
    
    });
  }
}

export default Sockets;
