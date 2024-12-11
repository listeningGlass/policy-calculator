import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function AccountSettings() {
    const { user, logout, isLoading } = useAuth0();
    const [message, setMessage] = useState({ type: '', text: '' });
    
    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
        );
    }

    const handleSignOutAll = async () => {
        try {
            await logout({ 
                logoutParams: {
                    returnTo: window.location.origin,
                    federated: true // This signs out of the identity provider too
                }
            });
        } catch (err) {
            console.error("Error signing out:", err);
            setMessage({ 
                type: 'error', 
                text: 'Failed to sign out of all devices' 
            });
        }
    };

    const handleChangePassword = async () => {
        try {
            const domain = process.env.REACT_APP_AUTH0_DOMAIN;
            const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
            const returnTo = encodeURIComponent(`${window.location.origin}/account`);
            window.location.href = `https://${domain}/authorize?` +
                `response_type=code&` +
                `client_id=${clientId}&` +
                `redirect_uri=${returnTo}&` +
                `scope=openid%20profile%20email&` +
                `prompt=login&` +
                `screen_hint=change_password`;
            setMessage({
                type: 'success',
                text: 'Redirecting to password change...'
            });
        } catch (err) {
            console.error("Error initiating password change:", err);
            setMessage({
                type: 'error',
                text: 'Failed to initiate password change. Please try again.'
            });
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
            
            {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'error' 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-green-50 border border-green-200'
                }`}>
                    <div className={`font-semibold mb-1 ${
                        message.type === 'error' ? 'text-red-800' : 'text-green-800'
                    }`}>
                        {message.type === 'error' ? 'Error' : 'Success'}
                    </div>
                    <div className={
                        message.type === 'error' ? 'text-red-700' : 'text-green-700'
                    }>
                        {message.text}
                    </div>
                </div>
            )}
            
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <p className="text-gray-600">{user?.email}</p>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Password</h3>
                <button
                    onClick={handleChangePassword}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                    Change Password
                </button>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Account Security</h3>
                <button
                    onClick={handleSignOutAll}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                >
                    Sign Out of All Devices
                </button>
            </div>

            {user?.picture && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Profile Picture</h3>
                    <img 
                        src={user.picture} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full"
                    />
                </div>
            )}
        </div>
    );
}

export default AccountSettings;