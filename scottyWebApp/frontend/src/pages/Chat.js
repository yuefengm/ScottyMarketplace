import React, { useEffect, useState, useRef} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { withAuthProtection } from '../utils/withAuthProtection';
import { Link } from 'react-router-dom';

import { BASE_URL } from '../utils/utils';

import '../../static/css/Chat.css'

const Chat = () => {
    let { chatId } = useParams();
    const [chat, setChat] = useState({});
    const [userId, setUserId] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatList, setChatList] = useState([]);
    const ws = useRef(null);

    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 5; // Max retries
    const retryInterval = 2000; // Time between retries in milliseconds
    
    // Fetch chat info
    useEffect(() => {
        const fetchChat = async () => {
            try {
                const url = BASE_URL + `/scotty/chats/${chatId}/`;
                const response = await axios.get(url);
                setChat(response.data);
            } catch (error) {
                console.error('Error fetching chat info:', error);
            }
        };

        fetchChat();
    }, [chatId]);


    // Fetch user info once on component mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const url = BASE_URL + `/scotty/user/`;
                const response = await axios.get(url);

                setUserId(response.data.id); // This will trigger the useEffect below

            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        function connectWS() {
        ws.current = new WebSocket(`ws://${window.location.host}/scotty/chat/${chatId}/`);
        ws.current.onopen = () => {
            console.log('Connected to chat');
            setRetryCount(0);
        }
        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (!message.creation_time) {
                message.creation_time = new Date().toISOString(); // Or format it as you need
            }
            setMessages((prevMessages) => [...prevMessages, message]);

        }
        ws.current.onerror = (err) => {  
            console.log(err.content);

            // some additional description, for example the status code of the initial HTTP response
            console.log(err.description);
          
            // some additional context, for example the XMLHttpRequest object
            console.log(err.context);
        }

        ws.current.onclose = (event) => {
            console.log('Disconnected from chat', event);
            if (!event.wasClean && retryCount < maxRetries) {
                setTimeout(() => {
                    console.log('Reconnecting to chat');
                    setRetryCount(retryCount + 1);
                    setMessages([]);
                    ws.current = new WebSocket(`ws://${window.location.host}/scotty/chat/${chatId}/`);
                }, retryInterval * retryCount);
            }
        }
    }
        connectWS();
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        }
    }, [chatId, retryCount, setNewMessage, setMessages]);

    // const csrfToken = getCookie('csrftoken');
    const handleSendMessage = async () => {
        if (newMessage.trim() !=='' && ws.current) {
            const message = { content: newMessage };
            ws.current.send(JSON.stringify(message));
            setNewMessage('');
        }
    };

    // Ref for the message display container
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Scroll to bottom on initial load and when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]); // dependency array includes messages

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="chat-page-link-to">
                    <Link to="/chats"><img src="../static/images/go-back-icon.png" alt="chat" /></Link>
                </div>
                <div className="chat-user">
                    <Link to={`/profile/${chat.other_user?.id}`}>
                        <h2>{chat.other_user ? `${chat.other_user.first_name} ${chat.other_user.last_name} (${chat.other_user.username})` : 'Loading...'}</h2>
                    </Link>
                </div>
            </div>
            
            
            <div className="message-display" style={{ overflowY: 'auto' }}>
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.author === chat.other_user?.username ? 'received' : 'sent'}`}>
                        <div className="message-content">{message.message}</div>
                        <div className="message-timestamp">{new Date(message.creation_time).toLocaleString()}</div>
                    </div>
                ))}
                {/* Invisible div at the end of the messages */}
                <div ref={messagesEndRef} />
            </div>
            <div className="message-input">
                <textarea placeholder="Type message..." maxLength={200} value={newMessage} onChange={(e) => setNewMessage(e.target.value)}></textarea>
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
      );
}

export default withAuthProtection(Chat);