import {
    Server
} from "socket.io";
import logger from "../logger.js";

class createChatServer {
    server = null;
    io = null;
    guestNumber = 1;
    nickNames = {};
    namesUsed = [];
    currentRoom = {};
    defaultName = "Ziomeczek#";

    constructor(server) {
        this.server = server;
    }

    assignGuestName = (socket, guestNumber, nickNames, namesUsed) => {
        const guestName = this.defaultName + guestNumber;
        logger("Assigning Guest Name: " + guestName);
        nickNames[socket.id] = guestName;
        socket.emit('nameResult', {
            success: true,
            name: guestName,
        });
        namesUsed.push(guestName);
        return guestNumber + 1;
    };

    joinRoom = (socket, room) => {
        socket.join(room);
        this.currentRoom[socket.id] = room;
        socket.emit('joinResult', {
            room: room
        });
        const usersInRoom = room.length;
        const message = usersInRoom.length > 1 ?
            this.nickNames[socket.id] + " is now having great time in room " + room + " with you! Enjoy!" :
            this.nickNames[socket.id] + " is first person in room " + room + ". Wait for others to join, or have a great monologue. ;)";
        socket.broadcast.to(room).emit('message', {
            text: message,
        });
    };

    handleNameChangeAttempts = (socket, nickNames, namesUsed) => {
        socket.on('nameAttempt', (name) => {
            if (name.indexOf(this.defaultName) === 0) {
                socket.emit('nameResult', {
                    success: false,
                    message: 'Your nickname can\'t start with ' + this.defaultName,
                });
            } else {
                if (namesUsed.indexOf(name) === -1) {
                    const previousName = nickNames[socket.id];
                    const previousNameIndex = namesUsed.indexOf(previousName);
                    namesUsed.push(name);
                    nickNames[socket.id] = name;
                    delete namesUsed[previousNameIndex];
                    socket.emit('nameResult', {
                        success: true,
                        name: name,
                    });
                    socket.broadcast.to(this.currentRoom[socket.id]).emit('message', {
                        text: previousName + ' is now ' + name + '.',
                        level: 'server'
                    });
                } else {
                    socket.emit('nameResult', {
                        success: false,
                        message: 'This nickname belongs to someone else. Be more Unique plox!',
                    });
                }
            }
        });
    };

    handleMessageBroadcasting = (socket) => {
        socket.on('message', (message) => {
            socket.broadcast.to(message.room).emit('message'), {
                text: this.nickNames[socket.id] + ":" + message.text,
            };
            logger(this.nickNames[socket.id] + " @ " + message.room + " ::: " + message.text);
        });
    };

    handleRoomJoining = (socket) => {
        socket.on('join', (room) => {
            socket.leave(this.currentRoom[socket.id]);
            joinRoom(socket, room.newRoom);
        });
    };

    handleClientDisconnection = (socket) => {
        socket.on('disconnect', () => {
            const nameIndex = this.namesUsed.indexOf(this.nickNames[socket.id]);
            delete this.namesUsed[nameIndex];
            delete this.nickNames[socket.id];
        });
    };

    listen = () => {
        logger("Running Socket.IO");
        this.io = new Server(this.server, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true,
            }
        });
        this.io.sockets.on('connection', (socket) => {
            logger("New Socket Connection: ", socket.id);
            this.guestNumber = this.assignGuestName(socket, this.guestNumber, this.nickNames, this.namesUsed);
            this.joinRoom(socket, 'Lobby');
            this.handleMessageBroadcasting(socket, this.nickNames);
            this.handleNameChangeAttempts(socket, this.nickNames, this.namesUsed);
            this.handleRoomJoining(socket);
            socket.on('rooms', () => {
                socket.emit('rooms', this.io.sockets.manager.rooms);
            });
            this.handleClientDisconnection(socket, this.nickNames, this.namesUsed);
        });
    };

}

export default createChatServer;