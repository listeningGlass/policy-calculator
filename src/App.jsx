import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import PolicyCalculator from './components/IULLoanCalculator';
import PolicyTableInput from './components/PolicyTableInput';
import AccountSettings from './components/AccountSettings';

function Navigation() {
    const { logout } = useAuth0();

    const handleSignOut = () => {
        logout({ 
            logoutParams: {
                returnTo: window.location.origin
            }
        });
    };

    return (
        <nav className="bg-white shadow-lg p-4">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex gap-4">
                    <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
                        Calculator
                    </Link>
                    <Link to="/policy-input" className="text-blue-600 hover:text-blue-800 font-medium">
                        Policy Input
                    </Link>
                    <Link to="/account" className="text-blue-600 hover:text-blue-800 font-medium">
                        Account
                    </Link>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={handleSignOut}
                        className="text-red-600 hover:text-red-800 font-medium"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </nav>
    );
}

function AuthenticationGuard({ children }) {
    const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

    React.useEffect(() => {
        const login = async () => {
            if (!isLoading && !isAuthenticated) {
                await loginWithRedirect({
                    appState: {
                        returnTo: window.location.pathname
                    }
                });
            }
        };
        login();
    }, [isLoading, isAuthenticated, loginWithRedirect]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return isAuthenticated ? (
        <>
            <Navigation />
            {children}
        </>
    ) : null;
}

function App() {
    const onRedirectCallback = (appState) => {
        window.history.replaceState(
            {},
            document.title,
            appState?.returnTo || window.location.pathname
        );
    };

    return (
        <Auth0Provider
            domain={process.env.REACT_APP_AUTH0_DOMAIN}
            clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience: process.env.REACT_APP_AUTH0_AUDIENCE,
                scope: "openid profile email"
            }}
            onRedirectCallback={onRedirectCallback}
            useRefreshTokens={true}
            cacheLocation="localstorage"
        >
            <Router>
                <div className="min-h-screen bg-gray-100">
                    <main className="container mx-auto py-8 px-4">
                        <Routes>
                            <Route path="/" element={
                                <AuthenticationGuard>
                                    <PolicyCalculator />
                                </AuthenticationGuard>
                            } />
                            <Route path="/policy-input" element={
                                <AuthenticationGuard>
                                    <PolicyTableInput />
                                </AuthenticationGuard>
                            } />
                            <Route path="/account" element={
                                <AuthenticationGuard>
                                    <AccountSettings />
                                </AuthenticationGuard>
                            } />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </Auth0Provider>
    );
}

export default App;