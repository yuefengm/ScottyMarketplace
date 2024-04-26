import React from 'react';
import GoogleButton from 'react-google-button';
import { BASE_URL } from '../utils/utils';

function Login() {
  const handleLogin = () => {
    window.location.href = BASE_URL + '/accounts/google/login/';
  };

  return (
    <div className="login-register-page">
      <div className="login-register-container">
        <h1>Welcome to Scotty Marketplace</h1>
        <h2>Sign in with andrew email to continue</h2>
        
        <div>
          <GoogleButton 
            onClick={handleLogin}
            label='Sign in with Google'
          />
        </div>
      </div>

      <div className="logo-container"></div>
    </div>
    
  );
}

export default Login;
