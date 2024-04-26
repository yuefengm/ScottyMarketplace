import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/utils';
import { withAuthProtection } from '../utils/withAuthProtection';

import { toast } from 'react-hot-toast';
import PayPal from "../components/PayPal";

import { BASE_URL } from '../utils/utils';

import '../../static/css/Breadcrumb.css';
import '../../static/css/Cart.css'

const Cart = () => {
    const [cart, setCart] = useState([]);
    const [IDs, setIDs] = useState([]);
    const [checkout, setCheckOut] = useState(false);

    const navigate = useNavigate();
    const fetchCart = async () => {
        try {
            axios.defaults.withCredentials = true;
            const response = await axios.get(BASE_URL + '/scotty/carts');
            setCart(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };
    useEffect(() => {
        fetchCart();
    }, [])

    useEffect(() => {
        setIDs(cart.map(c => c.product.id));
    }, [cart]);

    const csrfToken = getCookie('csrftoken'); // Get CSRF token from the cookies
    const deletCartItem = async (cartId) => {
        try {
            const response = await axios.delete(BASE_URL + `/scotty/carts/${cartId}`, {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': csrfToken,
                },
            });

            if (response.status === 204) {
                console.log('Cart item deleted successfully');
                setCart(cart.filter(c => c.id !== cartId));
            } else {
                console.log('Failed to delete cart item:', response.data);
            }
        } catch (error) {
            console.error('Error deleting cart item:', error);
        }
    }

    const calculateTotal = () => {
        return cart.reduce((acc, item) => acc + parseInt(item.product.availability ? item.product.price : 0), 0);
    };

    const FeeToast = ({ id, text }) => (
        <div>
          {text}
          <button onClick={() => toast.dismiss(id)} style={{ marginLeft: '10px' }}>
            Close
          </button>
        </div>
      );

    const showFeeToast = () => {
        const toastId = toast((t) => (
          <FeeToast id={t.id} text="Your total will include an additional 5% fee, broken down as follows: a 3.5% service fee by PayPal and a 1.5% operational fee by ScottyMarketplace." />
        ), {
            duration: Infinity,
            position: 'top-center',
        });
    };

    const onCheckoutComplete = (success) => {
        setCheckOut(false);
        fetchCart();
    };


    return (
        <div className="cart-container">
            <div className="breadcrumb">
                <div className="big-text">Cart</div>
                <div className="links-container">
                    <a href={"/shop"}>Continue Shopping</a>
                </div>
            </div>

            <div className="cart-list">
                <ul className='cart-ul'>
                    {/* Map through the products array and render each product */}
                    {cart.map(c => (
                        <li key={c.product.id} className='cart-li'>
                            {/* Display product image, name, description, and price */}
                            <div className="cart-card">
                                <Link to={`/shop/product/${c.product.id}`}>
                                    <img src={BASE_URL + `/scotty/productphoto/${c.product.id}`} alt={c.product.name} className="cart-image" />
                                </Link>
                                <div className="cart-info">
                                    <h3 className="cart-name">{c.product.name}</h3>
                                    <p className="cart-description">{c.product.availability ? c.product.description : "The product is no longer available."}</p>
                                    <p className="cart-price">${c.product.price}</p>
                                    <button className="delete-btn" onClick={() => deletCartItem(c.id)}>Delete</button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="cart-total">
                <h2>Total: ${calculateTotal()}</h2>
                <p onClick={showFeeToast} style={{cursor: 'pointer'}}>+5% fee</p>
                {checkout ? (
                <PayPal productIDs={IDs} onCheckoutComplete={onCheckoutComplete}/>
                ) : (
                <button
                    className="checkout-btn"
                    onClick={() => {
                    setCheckOut(true);
                    }}
                >
                    Checkout
                </button>
                )}
            </div>
        </div>
    )
};

export default withAuthProtection(Cart);