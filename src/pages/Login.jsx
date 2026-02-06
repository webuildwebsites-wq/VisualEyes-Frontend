import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Icon } from '@iconify/react';
import logo from '../assets/visual-eyes-logo.png';
import loginImage from '../assets/login-image.png';
import { Link } from 'react-router-dom';

const Login = () => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        console.log('Login attempt:', { loginId, password });
        // API integration would go here
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Main Container Card */}
            <div className=" rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row min-h-[500px]">

                {/* Left Side - Image */}
                <div className="w-full md:w-1/2 relative ">
                    <img
                        src={loginImage}
                        alt="Visual Lens"
                        className="absolute inset-0 w-full h-full rounded-3xl object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
                    {/* Decorative elements to mimic the lens overlay could go here */}
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#ffffffad]">
                    <div className="flex justify-center mb-10">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="VisualEyes" className="h-48 object-contain" />
                            {/* Fallback/Text if needed, but logo image is preferred typically */}
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input
                            placeholder="Login ID"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            className="bg-gray-200 w-full rounded-xl h-12 p-4 "
                        />

                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-gray-200 w-full rounded-xl h-12 p-4 "
                            icon={
                                <Icon
                                    icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                                    className="text-gray-500 w-5 h-5"
                                    onClick={() => setShowPassword(!showPassword)}
                                />
                            }
                        />



                        <Button type="submit" className="mt-4 shadow-lg max-w-[200px] mx-auto shadow-amber-500/30">
                            Login
                        </Button>
                        <br />
                        <Link to="/forgot-password" className="text-amber-500 text-left hover:underline">Forgot Password</Link>



                        <p className="text-center text-gray-500 mt-4">
                            Don't have an account? <a href="/register" className="text-amber-500 hover:underline">Register</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
