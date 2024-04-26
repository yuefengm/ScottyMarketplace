import axios from 'axios';
import { BASE_URL, getCookie } from './utils';

const navigateToChat = async (sellerId, navigate) => {
    const csrfToken = getCookie('csrftoken');
    try {
        const response = await axios.post(BASE_URL + `/scotty/chats/get_or_create/`, {
            other_user_id: sellerId,
        }, {
            withCredentials: true,
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            }
        });
        const chatSessionId = response.data.id;
        navigate(`/chat/${chatSessionId}`);
    } catch (error) {
        console.error('Error fetching or creating chat session:', error);
    }
}

export { navigateToChat };