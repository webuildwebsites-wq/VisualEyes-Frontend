import React, { useState } from 'react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Icon } from '@iconify/react';
import logo from '../assets/logo.svg';
import loginImage from '../assets/login-image.png';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { userCustomerLogin } from '../services/customerService';
import { setCredentials } from '../store/slices/authSlice';

const CustomerLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const validationSchema = Yup.object({
        loginId: Yup.string().required('Customer ID or Email is required'),
        password: Yup.string().required('Password is required'),
    });

    const formik = useFormik({
        initialValues: {
            loginId: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                const response = await userCustomerLogin({ loginId: values.loginId, password: values.password });
                if (response.success) {
                    dispatch(setCredentials({
                        user: response.data.user,
                        token: response.data.tokens.accessToken
                    }));
                    toast.success('Login Successful');
                    navigate('/customer-portal', { replace: true });
                } else {
                    toast.error(response.message || 'Login failed');
                }
            } catch (err) {
                toast.error(err.message || 'An error occurred during login');
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            {/* Main Container Card */}
            <div className="rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row min-h-[500px]">

                {/* Left Side - Image */}
                <div className="w-full md:w-1/2 relative ">
                    <img
                        src={loginImage}
                        alt="Visual Lens Customer Portal"
                        className="absolute inset-0 w-full h-full rounded-3xl object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600/30 to-black/60"></div>
                    <div className="absolute bottom-8 left-8 text-white z-10">
                        <h2 className="text-3xl font-black mb-2">Customer Portal</h2>
                        <p className="text-amber-100 font-medium">Manage your orders, payments, and account details.</p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white z-10">
                    <div className="flex justify-center mb-8">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="VisualEyes" className="h-40 object-contain" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Welcome Back</h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Sign in to your customer account</p>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        <Input
                            label="Customer ID or Email"
                            name="loginId"
                            placeholder="Enter Customer ID or Email"
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
                                    className="text-gray-500 w-5 h-5 cursor-pointer hover:text-amber-500 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                />
                            }
                        />

                        <Button type="submit" className="mt-8 shadow-lg w-full max-w-[250px] mx-auto shadow-amber-500/30 font-black tracking-widest uppercase">
                            Customer Login
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CustomerLogin;
