import io from "socket.io-client";
import Chat from "./models/Chat";
import { useEffect, useState } from 'react';
import logger from "./utils/logger";

const App = () => {
  const [chat, setChat] = useState(null);
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const mySocket = io('127.0.0.1:3865', {
      withCredentials: true
    });
    const myChat = new Chat(mySocket);
    setSocket(mySocket);
    setChat(myChat);
  }, []);

  socket && socket.on('message', (message) => {
    logger(message);
  });
  return (
    <div>
      <input value={message} onChange={({ target }) => setMessage(target.value)} />
      <button onClick={() => chat.sendMessage('Lobby', message)}>Wyślij Wiadomość</button>
    </div>
  );
}

export default App;
