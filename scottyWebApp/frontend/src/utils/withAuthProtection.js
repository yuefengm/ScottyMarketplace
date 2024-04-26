import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { BASE_URL } from './utils';

export const withAuthProtection = (WrappedComponent) => {
    return (props) => {
        const [isForbidden, setIsForbidden] = useState(false);
        const [countdown, setCountdown] = useState(5); // Initialize countdown for redirection

        useEffect(() => {
            axios.get(BASE_URL + '/scotty/checkauth', { withCredentials: true })
                .then((response) => {
                    // Handle successful response
                })
                .catch((error) => {
                    if (error.response && error.response.status === 403) {
                        setIsForbidden(true);
                    } else {
                        console.error('Error checking authorization:', error);
                    }
                });
        }, []);

        useEffect(() => {
            let timer;
            if (isForbidden && countdown > 0) {
                timer = setTimeout(() => {
                    setCountdown(countdown - 1);
                }, 1000);
            } else if (countdown === 0) {
                // Redirect to login page after countdown
                window.location.href = BASE_URL + '/login';
            }
            return () => clearTimeout(timer);
        }, [isForbidden, countdown, history]);

        if (isForbidden) {
            // If forbidden, you can redirect or return a message component
            return (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <h1>Login Required</h1>
                    <p>You are not authorized to access this page.</p>
                    <p>Please log in with an andrew email to view this page.</p>
                    <p>Redirecting to login in {countdown}s...</p>
                </div>
            );
        }

        // If not forbidden, render the wrapped component normally
        return <WrappedComponent {...props} />;
    };
};
