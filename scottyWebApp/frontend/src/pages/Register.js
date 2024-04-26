import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL, getCookie } from '../utils/utils'; 

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleRegister = async (event) => {
        event.preventDefault();
        
        if (password !== confirmPassword) {
            console.error("Passwords do not match.");
            return;
        }

        const csrfToken = getCookie('csrftoken');

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrfToken,
            },
            body: new URLSearchParams({
                email: email,
                username: username,
                password: password,
            }).toString(),
            credentials: 'include',
        };
      
        try {
          const response = await fetch(BASE_URL + '/scotty/register/', requestOptions);
      
          if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
          }
      
          const data = await response.json();
          navigate('/login');
        } catch (error) {
          setError('There was a problem with the registration: ' + error.message);
        }
    };
    return (
        <div className="login-register-page">
          <div className="login-register-container">
            <h1>Welcome !</h1>
            <h2>Sign up to</h2>
    
            <form onSubmit={handleRegister}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="username">User name</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your user name"
                  required
                />
              </div>
    
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your Password"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter your Password Again"
                  required
                />
              </div>
    
              <button type="submit" className="login-register-button">Register</button>
              <div className="login-register-reminder">
                Already have an Account?<Link to="/login"> Login</Link>
              </div>
            </form>
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
    );
};

export default Register;


