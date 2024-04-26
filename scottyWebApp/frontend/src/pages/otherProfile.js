import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate} from 'react-router-dom';
import ProductView from "../components/ProductView";
import axios from "axios";
import { BASE_URL, getCookie } from '../utils/utils';
import { withAuthProtection } from "../utils/withAuthProtection";
import { toast, Toaster } from 'react-hot-toast';


import "../../static/css/Profile.css";
import "../../static/css/ProductView.css";

const OtherProfile = () => {
    const [profile, setProfiles] = useState({
        self: false,
        username: '',  
        first_name: '',
        last_name: '',
        email: '',
        bio: '',
        picture: '',
        product_list: [],
        following: [],
        has_login_user_followed: '',
        followed_by_login_user: false,
    });
    const [products, setProducts] = useState([]);
    let { userId } = useParams();
    const [error] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfiles = async () => {
            const requestOptions = {
                method: 'GET',
                credentials: 'include',
            };

            try {
                const response = await fetch(BASE_URL + `/scotty/profile/${userId}`, requestOptions);
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                const data = await response.json();
                setProfiles(data);
            } catch (error) {
                toast.error('There was a problem fetching the profiles: ' + error.message);
            }
        };
        fetchProfiles();
    }, [userId]);
    

    useEffect(() => {
        const fetchProducts = async () => {
            if (!userId) { // This check is now meaningful, as useEffect depends on userId
                return;
            }
            try {
                const url = BASE_URL + `/scotty/products/?seller=${userId}`;
                const response = await axios.get(url);
                setProducts(response.data); // Update the state with the fetched products
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, [userId]);// Depending on userId

    const handleFollowChange = async () => {
        try {
            // Determine the correct URL based on current follow state
            const url = profile.followed_by_login_user
                ? BASE_URL + `/scotty/unfollow/${userId}`
                : BASE_URL + `/scotty/follow/${userId}`;
            
            const response = await axios.post(url, {}, {
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'), // Assuming getCookie is a utility to get cookies
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (response.data) {
                setProfiles(prevProfile => ({
                    ...prevProfile,
                    followed_by_login_user: !prevProfile.followed_by_login_user
                }));  
                if (profile.followed_by_login_user) {
                    toast.success('Unfollowed successfully');
                } else {
                    toast.success('Followed successfully');
                }    
            } else {
                toast.error(response.data.error || 'An error occurred');
            }
        } catch (error) {
            toast.error(error);
        }
    };

    const startChat = async () => { 
        try {
            const response = await axios.post(BASE_URL + '/scotty/startchat/', { other_user_id: userId }, {
                withCredentials: true,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.chat_id) {
                navigate(`/chat/${response.data.chat_id}`);
            } else {
                console.error('Error starting chat:', response.data.error);
                toast.error(response.data.error || 'An error occurred');
            }

        } catch (error) {
            console.error('Error starting chat:', error);
            toast.error(error);
        }
    }

    console.log(profile.self)

    return (
        <div className="profile-page">
            <div className="breadcrumb">
                <div className="big-text">{profile.first_name} {profile.last_name} Profile Page</div>
            </div>
            {error && <p>{error}</p>}
            
            <div className="user-image">
                <img className="profile_pic" src={decodeURIComponent(profile.picture)} alt="Profile Picture" /><br />
                <button onClick={handleFollowChange}>
                {profile.followed_by_login_user ? 'Unfollow' : 'Follow'}
                </button>
                <button onClick={startChat}>Chat</button>
            </div>
            
            <div className="userinfo">
                <label>Username: {profile.username}</label><br />
                <label>Email: {profile.email}</label>
            </div>
            
            <div className="bio">
                <label>Bio: </label>
                <textarea readOnly value={profile.bio} />
            </div>

            <div>
            <Toaster
                position="top-center"
                reverseOrder={false}
            />
           
           <h3>Products Selling:</h3>

                <ul className="products-list">

                    {products.map(product => (
                        <div className="transaction-details" key={product.id}>
                            <ProductView id={product.id} name={product.name} description={product.description} price={product.price} seller={product.seller} showAddToCartButton={false}/>
                        </div>
                    ))}
                </ul>
            </div>
            

            <div className="following">
                <label>Following:</label>
                <ul>
                    {profile.following.map(following => (
                        <li key={following.id}>
                            {profile.has_login_user_followed == following.id ? (
                                <Link to="/myprofile">{following.username}</Link>
                            ) : (
                                <Link to={`/profile/${following.id}`}>{following.username}</Link>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default withAuthProtection(OtherProfile);