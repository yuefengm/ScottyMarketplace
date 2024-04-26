import React from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { useState, useEffect } from 'react';
import { BASE_URL } from "../utils/utils";


const Header = () => {
    // State variable to store the fetched products
    const [user, setUser] = useState(null);
    const [picture_url, setPictureUrl] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
 
    // Function to fetch products from the API
    const fetchUser = async () => {
        try {
            const responseUser = await axios.get(BASE_URL + '/scotty/user/');
            if (responseUser.data.error != null) {
                setUser(null);
            } else {
                const responseProfile = await axios.get(BASE_URL + '/scotty/myprofile/');
                setUser(responseUser.data);
                let pictureURL = '';
                if (responseProfile.data.picture.startsWith('/http')) {
                    pictureURL = (responseProfile.data.picture.substring(1));
                } else {
                    pictureURL = responseProfile.data.picture;
                }

                setPictureUrl(decodeURIComponent(`${pictureURL}?${new Date().getTime()}`))
            }
        
        } catch (error) {
            // Handle errors, such as network errors or API errors
            if (error.response && error.response.status === 401) {
                // If the error is due to unauthorized access, set user state to null
                setUser(null);
                return;
            } else {
                // For other errors, you can handle them as needed
                console.error('Error fetching user:', error);
            }
        }
    };
    
    useEffect(() => {
        // Call the fetchProducts function when the component mounts
        fetchUser();
    }, [refreshTrigger]); // Empty dependency array ensures that this effect runs only once, on component mount


    return (
        <header>
        <nav>
            <div className="logo">Scotty Marketplace</div>
            <ul className="nav-list">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/sell">Sell</Link></li>
            <li><Link to="/about">About</Link></li>
          
            </ul>
            
            <div className="link-to">
                <Link to="/cart">
                    <img src="../static/images/shopping-cart.png" alt="cart" />
                </Link>
                <Link to="/chats">
                    <img src="../static/images/chat-icon.png" alt="chat" />
                </Link>
            </div>

            <div className="user-info">
                {user ? (
                    <div>
                        <div className="user">
                        <Link to="/myprofile"><img src={picture_url} 
                        alt={`${user.first_name} ${user.last_name}`} 
                        style={{width: "50px", height: "50px", borderRadius: "50%"}} /></Link>
                            
                        </div>
                        
                        <div className="logout">
                            <a href="/accounts/logout/">Logout</a>
                        </div>
                    </div>
                ) : (
                    <div className="login-register">
                    <a href="/login">Sign in</a>
                    </div>
                )}
            </div>
        </nav>
        </header>
    );
};
export default Header;