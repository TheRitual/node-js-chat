import { Server } from "socket.io";
import logger from "../logger.js";

const chatServer = (server) => {

    let io;
    let guestNumber = 1;
    let nickNames = {};
    let namesUsed = [];
    let currentRoom = {};

    const defaultName = "Ziomeczek#";

    const assignGuestName = (socket, guestNumber, nickNames, namesUsed) => {
        logger("Assigning Guest Name");
        const guestName = defaultName + guestNumber;
        nickNames[socket.id] = guestName;
        socket.emit('nameResult', {
            success: true,
            name: guestName,
        });
        namesUsed.push(guestName);
        return guestNumber + 1;
    };

    const joinRoom = (socket, room) => {
        socket.join(room);
        currentRoom[socket.id] = room;
        socket.emit('joinResult', {
            room: room
        });
        const usersInRoom = io.sockets.clients(room);
        const message = usersInRoom.length > 1 ?
            nickNames[socket.id] + " is now having great time in room " + room + " with you! Enjoy!" :
            nickNames[socket.id] + " is first person in room " + room + ". Wait for others to join, or have a great monologue. ;)"
        socket.broadcast.to(room).emit('message', {
            text: message,
        });
    }

    const handleNameChangeAttempts = (socket, nickNames, namesUsed) => {
        socket.on('nameAttempt', (name) => {
            if (name.indexOf(defaultName) === 0) {
                socket.emit('nameResult', {
                    success: false,
                    message: 'Your nickname can\'t start with ' + defaultName,
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
                    socket.broadcast.to(currentRoom[socket.id]).emit('message', {
                        text: previousName + ' is now ' + name + '.'
                    });
                } else {
                    socket.emit('nameResult', {
                        success: false,
                        message: 'This nickname belongs to someone else. Be more Unique plox!',
                    });
                }
            }
        });
    }

    const handleMessageBroadcasting = (socket) => {
        socket.on('message', (message) => {
            socket.broadcast.to(message.room).emit('message'), {
                text: nickNames[socket.id] + ":" + message.text,
            }
        });
    }

    const handleRoomJoining = (socket) => {
        socket.on('join', (room) => {
            socket.leave(currentRoom[socket.id]);
            joinRoom(socket, room.newRoom);
        });
    }

    const handleClientDisconnection = (socket) => {
        socket.on('disconnect', () => {
            const nameIndex = namesUsed.indexOf(nickNames[socket.id]);
            delete namesUsed[nameIndex];
            delete nickNames[socket.id];

        })
    }

    const listen = (server) => {
        logger("Running Socket.IO");
        io = new Server(server);
        io.sockets.on('connection', (socket) => {
            guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
            joinRoom(socket, 'Lobby');
            handleMessageBroadcasting(socket, nickNames);
            handleNameChangeAttempts(socket, nickNames, namesUsed);
            handleRoomJoining(socket);
            socket.on('rooms', () => {
                socket.emit('rooms', io.sockets.manager.rooms);
            });
            handleClientDisconnection(socket, nickNames, namesUsed);
        });
    }

    listen(server);
}

export default chatServer;