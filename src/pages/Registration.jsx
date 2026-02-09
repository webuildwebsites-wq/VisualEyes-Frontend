import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Icon } from '@iconify/react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

import Select from '../components/ui/Select';

const Registration = () => {
    const navigate = useNavigate();

    const validationSchema = Yup.object({
        employeeType: Yup.string().required('Employee Type is required'),
        name: Yup.string().required('Name is required'),
        mobile: Yup.string()
            .matches(/^[0-9]+$/, "Must be only digits")
            .min(10, 'Must be exactly 10 digits')
            .max(10, 'Must be exactly 10 digits')
            .required('Mobile is required'),
        email: Yup.string().email('Invalid email format').required('Email is required'),
        designation: Yup.string().required('Designation is required'),
        department: Yup.string().required('Department is required'),
        username: Yup.string().required('Username is required'),
        expiry: Yup.date().required('Expiry date is required').nullable()
    });

    const formik = useFormik({
        initialValues: {
            employeeType: '',
            name: '',
            mobile: '',
            email: '',
            designation: '',
            department: '',
            username: '',
            expiry: ''
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            console.log('Registration Data:', values);
            // Simulate API call success
            navigate('/welcome', { state: { from: 'register' } });
        },
    });

    return (
        <div className="  flex  p-4 py-8">
            <div className="bg-[#ffffffad] rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-6xl border border-blue-400/30">

                <form onSubmit={formik.handleSubmit} className="space-y-6">

                    <Select
                        name="employeeType"
                        value={formik.values.employeeType}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Employee Type"
                        error={formik.touched.employeeType && formik.errors.employeeType ? { message: formik.errors.employeeType } : null}
                        options={[
                            { value: 'SUPERADMIN', label: 'Super Admin' },
                            { value: 'SUBADMIN', label: 'Sub Admin' },
                            { value: 'SUPERVISOR', label: 'Supervisor' },
                            { value: 'USER', label: 'User' }
                        ]}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            name="name"
                            placeholder="Name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.name && formik.errors.name ? { message: formik.errors.name } : null}
                        />
                        <Input
                            name="mobile"
                            placeholder="Mobile"
                            value={formik.values.mobile}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.mobile && formik.errors.mobile ? { message: formik.errors.mobile } : null}
                        />
                        <Input
                            name="email"
                            placeholder="Email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && formik.errors.email ? { message: formik.errors.email } : null}
                        />
                        <Input
                            name="designation"
                            placeholder="Designation"
                            value={formik.values.designation}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.designation && formik.errors.designation ? { message: formik.errors.designation } : null}
                        />
                    </div>

                    {/* Department Select - Orange Style */}
                    <Select
                        name="department"
                        value={formik.values.department}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Select Department"
                        error={formik.touched.department && formik.errors.department ? { message: formik.errors.department } : null}
                        options={[
                            { value: 'LAB', label: 'Lab' },
                            { value: 'STORE', label: 'Store' },
                            { value: 'DISPATCH', label: 'Dispatch' },
                            { value: 'SALES', label: 'Sales' },
                            { value: 'FINANCE', label: 'Finance' },
                            { value: 'CUSTOMER_SUPPORT', label: 'Customer Support' }
                        ]}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            name="username"
                            placeholder="Username"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.username && formik.errors.username ? { message: formik.errors.username } : null}
                        />
                        <Input
                            name="expiry"
                            placeholder="Expiry"
                            type="date"
                            value={formik.values.expiry}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.expiry && formik.errors.expiry ? { message: formik.errors.expiry } : null}
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
