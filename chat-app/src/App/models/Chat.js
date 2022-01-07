import logger from "../utils/logger";

class Chat {
    socket = null;
    
    constructor(socket, textList) {
        this.socket = socket;
        logger("Connected");
    }

    sendMessage = (room, text) => {
        const message = {
            room: room,
            text: text,
        };
        this.socket.emit('message', message);
        logger("Sent message: ", message);
    }

    changeRoom = (room) => {
        this.socket.emit('join', {
            newRoom: room
        });
    }

    disconnect = () => {
        logger("Disconnecting");
        this.socket.disconnect();
    }

    processCommand = (commandLine) => {
        const words = commandLine.split(' ');
        const command = words[0].substring(1, words[0].length).toLoweCase();
        let message = false;
        switch (command) {
            case 'join':
                words.shift();
                const room = words.join(' ');
                this.changeRoom(room);
                break;
            case 'nick':
                words.shift();
                const name = words.join(' ');
                this.socket.emit('nameAttempt', name);
                break;
            default:
                message = 'Unknown Command.';
                break;
        }
        return message;
    }
}

export default Chat;