import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { navigateToChat } from '../utils/chatUtils';
import { withAuthProtection } from '../utils/withAuthProtection';
import { BASE_URL } from '../utils/utils';


const ChatList = () => {
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await axios.get(BASE_URL + '/scotty/chats/');
                // Sort chats by last message creation time, most recent first
                const sortedChats = response.data.sort((a, b) => {
                    const lastMessageA = a.last_message ? new Date(a.last_message.creation_time) : new Date(0); // Unix epoch as fallback
                    const lastMessageB = b.last_message ? new Date(b.last_message.creation_time) : new Date(0); // Unix epoch as fallback
                    return lastMessageB - lastMessageA; // Descending order
                });
                setChats(sortedChats);
            } catch (error) {
                console.error('Error fetching chats:', error);
            }
        };

        fetchChats();
    }, []);

    const navigate = useNavigate();

    return (
        <div className="chat-list">
            {chats.map(chat => {
                return (
                    <div key={chat.id} className="chat-preview" onClick={() => navigateToChat(chat.other_user?.id, navigate)}>
                            <div className="chat-info">
                                <h3>{chat.other_user ? `${chat.other_user.first_name} ${chat.other_user.last_name}` : 'Unknown'}</h3>
                                <p className="last-message">
                                    {chat.last_message ? (
                                        `${chat.last_message.author.first_name} ${chat.last_message.author.last_name}: ${chat.last_message.content}`
                                    ): 'No messages yet'}
                                </p>
                            </div>
                    </div>
                );
            })}
        </div>
    );
};

export default withAuthProtection(ChatList);
