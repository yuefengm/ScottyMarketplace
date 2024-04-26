import axios from 'axios';
import { BASE_URL, getCookie } from './utils';

const handleAddToCart = async (productId, productOwnerId, onResult, userId) => {
    if (userId === productOwnerId) {
        console.log('Attempt to add own product to cart');
        onResult({ success: false, message: 'This is your product. You cannot add your own product to the cart.' });
        return;
    }
    const csrfToken = getCookie('csrftoken'); // Get CSRF token from the cookies
    try {
        const response = await axios.post(BASE_URL + '/scotty/carts/', {
            product: productId 
        }, {
            withCredentials: true,
            headers: {
                'X-CSRFToken': csrfToken,
            },
        });

        // Handle the response from the server
        if (response.status === 201) {
            console.log('Product added to cart successfully');
            onResult({ success: true, message: 'Product added to cart successfully' });
        }
    } catch (error) {
        if (error.response && error.response.status === 400 
            && error.response.data.detail === 'Item already in cart') {
                console.log('Item already in cart');
                onResult({ success: false, message: 'Item already in cart' });
        } else {
            console.error('Failed to add item to cart:', error);
            onResult({ success: false, message: 'Failed to add item to cart' });
        }
    }
}

export { handleAddToCart };