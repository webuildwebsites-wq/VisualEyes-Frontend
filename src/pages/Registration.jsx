import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import logo from '../assets/visual-eyes-logo.png';

const Registration = () => {
    const [formData, setFormData] = useState({
        employeeType: '',
        name: '',
        mobile: '',
        email: '',
        designation: '',
        department: '',
        username: '',
        expiry: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Registration Data:', formData);
        // API integration
    };

    return (
        <div className="min-h-screen  flex items-center justify-center p-4 py-8">
            <div className="bg-[#ffffffad] rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-6xl border border-blue-400/30">
                {/* Logo */}
                <div className="flex justify-center mb-10">
                    <img src={logo} alt="VisualEyes" className="h-48 object-contain" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Employee Type Select - Orange Style */}
                    <Select
                        name="employeeType"
                        value={formData.employeeType}
                        onChange={handleChange}
                        placeholder="Employee Type"
                        options={[
                            { value: 'fulltime', label: 'Full Time' },
                            { value: 'contract', label: 'Contract' },
                            { value: 'intern', label: 'Intern' }
                        ]}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            name="name"
                            placeholder="Name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <Input
                            name="mobile"
                            placeholder="Mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                        />
                        <Input
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <Input
                            name="designation"
                            placeholder="Designation"
                            value={formData.designation}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Department Select - Orange Style */}
                    <Select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="Select Department"
                        options={[
                            { value: 'it', label: 'IT' },
                            { value: 'hr', label: 'HR' },
                            { value: 'sales', label: 'Sales' }
                        ]}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <Input
                            name="expiry"
                            placeholder="Expiry"
                            type="date"
                            value={formData.expiry}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex justify-center mt-8">
                        <Button type="submit" className="max-w-xs shadow-lg shadow-amber-500/30">
                            Submit
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Registration;
