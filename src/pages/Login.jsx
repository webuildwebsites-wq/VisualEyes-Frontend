import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Icon } from '@iconify/react';
import logo from '../assets/logo.svg';
import loginImage from '../assets/login-image.png';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { loginUser } from '../services/authService';
import { setCredentials } from '../store/slices/authSlice';
import { PATHS } from '../routes/paths';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const validationSchema = Yup.object({
        loginId: Yup.string()
            .required('Email or Username is required'),
        password: Yup.string()
            .required('Password is required'),
    });

    const formik = useFormik({
        initialValues: {
            loginId: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                const response = await loginUser({ loginId: values.loginId, password: values.password });
                console.log('response', response)
                if (response.success) {
                    dispatch(setCredentials({
                        user: response.data.user,
                        token: response.data.tokens.accessToken,
                        refreshToken: response.data.tokens.refreshToken
                    }));
                    toast.success('Login Successful');
                    navigate(PATHS.WELCOME, { state: { from: 'login' } });
                } else {
                    toast.error(response.message || 'Login failed');
                }
            } catch (err) {
                toast.error(err.message || 'An error occurred during login');
            }
        },
    });

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
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#ffffffad]">
                    <div className="flex justify-center mb-10">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="VisualEyes" className="h-48 object-contain" />
                        </div>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        <Input
                            label="Email or Employee Name"
                            name="loginId"
                            placeholder="Enter Email or Employee Name"
                            value={formik.values.loginId}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.loginId && formik.errors.loginId ? { message: formik.errors.loginId } : null}
                        />

                        <Input
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your Password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && formik.errors.password ? { message: formik.errors.password } : null}
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

                        {/* <p className="text-center text-gray-500 mt-4">
                            Don't have an account? <a href="/register" className="text-amber-500 hover:underline">Register</a>
                        </p> */}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
