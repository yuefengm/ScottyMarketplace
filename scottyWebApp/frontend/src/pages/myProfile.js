import React, { useEffect, useState } from 'react';
import { Link} from 'react-router-dom';
import { BASE_URL, getCookie } from '../utils/utils';
import { withAuthProtection } from '../utils/withAuthProtection';
import { toast, Toaster } from 'react-hot-toast';

import '../../static/css/Breadcrumb.css';
import "../../static/css/Profile.css";

const MyProfile = () => {
    const [profile, setProfile] = useState({
        username: '',  
        first_name: '',
        last_name: '',
        email: '',  
        user: '',
        bio: '',
        picture: '',
        following: [],
        transactions: [],
    });
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [error] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [hasFileSelected, setHasFileSelected] = useState(false);

    useEffect(() => {  // fetch the user profile
        const fetchProfile = async () => {
            const requestOptions = {
                method: 'GET',
                credentials: 'include',
            };

            try {
                const response = await fetch(BASE_URL + '/scotty/myprofile/', requestOptions);
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                const data = await response.json();
                setProfile(data);
                setProfilePictureUrl(`${decodeURIComponent(data.picture)}?${new Date().getTime()}`); 
            } catch (error) {
                toast.error('There was a problem fetching the profile: ' + error.message);
            }
        };
        fetchProfile();
    }, [refreshTrigger])

    const handleInputChange = (event) => {
        const { name, value } = event.target;  
        setProfile({ ...profile, [name]: value });
    }

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setHasFileSelected(true);
            setProfile(prevState => ({ ...prevState, picture: file}));
            toast.success('Picture selected successfully:'+ file.name);
        } else {
            setHasFileSelected(false);
        }
    }


    const handleImageSubmit = async (event) => {   
        event.preventDefault();
        if (!hasFileSelected) {
            toast.error('Please select a picture before updating.');  // Set error if no file is selected
            return;
        }
        const file = profile.picture;
        let formData = new FormData();
        formData.append('picture', file);
        const csrfToken = getCookie('csrftoken');
        const requestOptions = {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            body: formData,
            credentials: 'include',
        };

        try {
            const response = await fetch(BASE_URL + '/scotty/myprofile/', requestOptions); 
            
            const data = await response.json();
            console.log("data", data)
            if (data.success){
                setProfile(prevState => ({ ...prevState, picture: data.picture_url}));
                setProfilePictureUrl(`${data.picture_url}?${new Date().getTime()}`);
                setRefreshTrigger(prev => prev + 1);
                setHasFileSelected(false);
                toast.success('Profile picture updated successfully');
            } else {
                if (response.status === 400) {
                const errorMessage = JSON.parse(data.error)['picture']
                toast.error('There was a problem updating the profile: ' + errorMessage[0].message);
                } else {
                    toast.error('There was a problem updating the profile: ' + data.error);
                }
            }
        } catch (error) {
            toast.error('There was a problem updating the profile: ' + error.message);
        }

    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        let formData = new FormData();
        
        formData.append('bio', profile.bio);
        formData.append('email', profile.email);

        const csrfToken = getCookie('csrftoken');
        const requestOptions = {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            body: formData,
            credentials: 'include',
        };

        try {
            const response = await fetch(BASE_URL + '/scotty/myprofile/', requestOptions);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            if (data.success){
                setProfile(prevState => ({ ...prevState, ...data }));
                toast.success('Bio updated successfully');
            } else {
                toast.error('There was a problem updating the profile: ' + data.error);
            }
        } catch (error) {
            toast.error('There was a problem updating the profile: ' + error.message);
        }
    }

    return (
        <div className='profile-page'>
            <div className="breadcrumb">
                <div className="big-text">{profile.first_name} {profile.last_name} Profile Page</div>
            </div>
            {error && <p className="error">{error}</p>}
           

            <div className="user-image">
                <form onSubmit={handleImageSubmit} style={{ display: 'inline-block' }}>
                <input 
                    type="file" 
                    id="profile_picture" 
                    name="picture" 
                    onChange={handleImageChange} 
                    style={{ display: 'none' }} // Hide the actual file input
                />
                <label htmlFor="profile_picture">
                    <img 
                    className="profile_pic" 
                    src={profilePictureUrl} 
                    style={{ width: "200px", height: "200px", borderRadius: "50%", cursor: 'pointer'}} 
                    alt="Profile" 
                    title="Click to change picture" // Tooltip text
                    />
                </label>
                <button type="submit" >Update Picture</button> 
                </form>
            </div>
            

            <div className="email">
                <label>Email: {profile.email}</label>
            </div>
            
            <form onSubmit={handleSubmit} >
            <div className="bio">
                <label>Bio:</label>
                <textarea
                    name="bio"
                    id='bio_input_text'
                    value={profile.bio}
                    onChange={handleInputChange}
                    maxLength={420}
                ></textarea>
            </div>
            <button type="submit" onClick={handleSubmit}>Update Profile</button>
            </form>

            <Toaster />
            <div className="transactions">
                <h2>Order History:</h2>
                <ul className='orderH-ul'>
                    {profile.transactions.map(transaction => (
                        <li key={transaction.id} className="transaction-item">
                            <div className="transaction-details">
                                <Link to={`/shop/product/${transaction.id}`}>
                                    <img src={BASE_URL + `/scotty/productphoto/${transaction.id}`} alt={transaction.product} className="cart-image" />
                                </Link>
                                <label>
                                    {transaction.product} <br/> 
                                    ${transaction.price}
                                </label>
                            </div>
                            <div className="transaction-status">
                                <h3 className='status'>
                                    Order Date: {transaction.order_time} <br/>
                                    Sold By: <Link to={`/profile/${transaction.seller_id}`}> <button className="seller-btn">{transaction.seller_name}</button></Link>
                                </h3>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>


            <div className="following">
                <h2>Following:</h2>
                <ul>
                    {profile.following.map(following => (
                        <li key={following.id}>
                            <Link to={`/profile/${following.id}`}>{following.username}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
};

export default withAuthProtection(MyProfile);