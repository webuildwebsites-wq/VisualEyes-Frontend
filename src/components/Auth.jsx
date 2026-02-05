import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, signup, selectRegisteredUsers } from '../store/slices/authSlice';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const registeredUsers = useSelector(selectRegisteredUsers);
    const dispatch = useDispatch();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username || !password) return alert('Fill all fields');

        if (isLogin) {
            const user = registeredUsers.find(u => u.username === username && u.password === password);
            if (user) {
                dispatch(setCredentials({
                    user: user.username,
                    token: 'dummy-token-' + Date.now(),
                    role: user.role
                }));
            } else {
                alert('Invalid credentials');
            }
        } else {
            const userExists = registeredUsers.some(u => u.username === username);
            if (userExists) return alert('Username already taken');

            dispatch(signup({ username, password }));
            alert('Signup successful! Please login.');
            setIsLogin(true);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-erp-primary to-erp-secondary p-4">
            <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md text-center transform transition-all hover:scale-[1.01]">
                <h2 className="text-3xl font-extrabold text-erp-primary mb-2">VisualEyes Lens ERP</h2>
                <h3 className="text-lg text-gray-500 mb-8 font-medium">{isLogin ? 'Welcome Back' : 'Create Industry Account'}</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-left">
                        <label className="block text-sm  font-bold text-gray-700 mb-2 ml-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full text-dark px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-erp-accent focus:border-transparent outline-none transition-all "
                            placeholder="admin"
                        />
                    </div>
                    <div className="text-left">
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full text-dark px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-erp-accent focus:border-transparent outline-none transition-all "
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-4 bg-erp-primary text-white font-bold rounded-xl hover:bg-erp-dark transform transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20"
                    >
                        {isLogin ? 'Sign In' : 'Register Account'}
                    </button>
                </form>

                <p
                    className="mt-8 text-erp-primary cursor-pointer hover:underline font-semibold"
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin ? "New here? Set up an account" : "Back to secure login"}
                </p>
            </div>
        </div>
    );
};

export default Auth;
