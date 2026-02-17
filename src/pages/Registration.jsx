import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Icon } from '@iconify/react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { createSupervisorUser } from '../services/employeeService';
import { toast } from 'react-toastify';

const ROLES = [
    "ADMIN", "BRANCH USER", "PRIORITY ORDER", "CUSTOMER", "ACCOUNTING MODULE",
    "SALES EXECUTIVE", "OTHER ADMIN", "STOCK POINT USER", "CUSTOMER CARE",
    "STORES", "PRODUCTION", "SUPERVISOR", "FITTING CENTER", "F&A",
    "DISTRIBUTOR", "DISPATCH", "STORES ADMIN", "BELOW ADMIN", "INVESTOR PROFILE",
    "AUDITOR", "CUSTOMER CARE (DB)", "BELOW ADMIN (FITTING CENTER)",
    "FITTING CENTER-V2", "DISPATCH-KOLKATTA", "SALES HEAD", "CUSTOM PROFILE", "F&A CFO"
];

const LABS = [
    "KOLKATA STOCK", "STOCK ORDER", "VISUAL EYES LAB", "VE AHMEDABAD LAB",
    "VE CHENNAI LAB", "VE KOCHI LAB", "VE GURGAON LAB", "VE MUMBAI LAB",
    "VE TRIVANDRUM LAB", "SERVICE", "VE GLASS ORDER", "VE PUNE LAB",
    "VE NAGPUR LAB", "VE BENGALURU LAB", "VE HYDERBAD LAB", "VE KOLKATTA LAB"
];

const Registration = () => {
    const navigate = useNavigate();

    const validationSchema = Yup.object({
        employeeType: Yup.string().required('Employee Type is required'),
        username: Yup.string().required('Username is required'),
        email: Yup.string().email('Invalid email format').required('Email is required'),
        password: Yup.string().required('Password is required'),
        phone: Yup.string()
            .matches(/^[0-9]+$/, "Must be only digits")
            .min(10, 'Must be exactly 10 digits')
            .max(10, 'Must be exactly 10 digits')
            .required('Phone is required'),
        department: Yup.string().required('Department is required'),
        role: Yup.string().required('Role is required'),
        region: Yup.string().required('Region is required'),
        lab: Yup.string().required('Lab is required'),
    });

    const formik = useFormik({
        initialValues: {
            employeeType: '',
            username: '',
            email: '',
            password: '',
            phone: '',
            address: '',
            country: 'India',
            region: '',
            department: '',
            role: '',
            pincode: '',
            expiry: '',
            lab: '',
            aadharCard: 'https://example.com/aadhar.jpg',
            panCard: 'https://example.com/pan.jpg'
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const response = await createSupervisorUser(values);
                if (response.success) {
                    toast.success("User created successfully!");
                    navigate('/welcome', { state: { from: 'register' } });
                }
            } catch (error) {
                console.error('Registration Error:', error);
                toast.error(error.error?.message || error.message || "Failed to create user");
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="flex justify-center p-4 py-8 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-5xl border border-gray-200">
                <form onSubmit={formik.handleSubmit} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Employee Type"
                            name="employeeType"
                            variant="orange"
                            value={formik.values.employeeType}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Select Employee Type"
                            error={formik.touched.employeeType && formik.errors.employeeType ? { message: formik.errors.employeeType } : null}
                            options={[
                                { value: 'SUBADMIN', label: 'Sub Admin' },
                                { value: 'SUPERVISOR', label: 'Supervisor' },
                                { value: 'EMPLOYEE', label: 'Employee' }
                            ]}
                        />
                        <Input
                            label="Username"
                            name="username"
                            placeholder="Enter Username"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.username && formik.errors.username ? { message: formik.errors.username } : null}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Email"
                            name="email"
                            placeholder="Enter Email Address"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && formik.errors.email ? { message: formik.errors.email } : null}
                        />
                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Enter Password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && formik.errors.password ? { message: formik.errors.password } : null}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Mobile No."
                            name="phone"
                            placeholder="Enter Phone Number"
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.phone && formik.errors.phone ? { message: formik.errors.phone } : null}
                        />
                        <Input
                            label="Address"
                            name="address"
                            placeholder="Enter Address"
                            value={formik.values.address}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.address && formik.errors.address ? { message: formik.errors.address } : null}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Select Department"
                            name="department"
                            variant="orange"
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
                                { value: 'CUSTOMER_SUPPORT', label: 'Customer Support' },
                                { value: 'SALES EXECUTIVE', label: 'Sales Executive' }
                            ]}
                        />
                        <Select
                            label="Role"
                            name="role"
                            variant="orange"
                            value={formik.values.role}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Select Role"
                            error={formik.touched.role && formik.errors.role ? { message: formik.errors.role } : null}
                            options={ROLES.map(role => ({ value: role, label: role }))}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Country"
                            name="country"
                            placeholder="Enter Country"
                            value={formik.values.country}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.country && formik.errors.country ? { message: formik.errors.country } : null}
                        />
                        <Input
                            label="Pincode"
                            name="pincode"
                            placeholder="Enter Pincode"
                            value={formik.values.pincode}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.pincode && formik.errors.pincode ? { message: formik.errors.pincode } : null}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Expiry"
                            name="expiry"
                            type="date"
                            placeholder="Select Expiry Date"
                            value={formik.values.expiry}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.expiry && formik.errors.expiry ? { message: formik.errors.expiry } : null}
                            InputLabelProps={{ shrink: true }}
                        />
                        <Select
                            label="Lab"
                            name="lab"
                            value={formik.values.lab}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Select Lab"
                            error={formik.touched.lab && formik.errors.lab ? { message: formik.errors.lab } : null}
                            options={LABS.map(lab => ({ value: lab, label: lab }))}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <Select
                            label="Region"
                            name="region"
                            value={formik.values.region}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Select Region"
                            error={formik.touched.region && formik.errors.region ? { message: formik.errors.region } : null}
                            options={[
                                { value: 'EAST', label: 'East' },
                                { value: 'WEST', label: 'West' },
                                { value: 'NORTH', label: 'North' },
                                { value: 'SOUTH', label: 'South' },
                                { value: 'North Region', label: 'North Region' }
                            ]}
                        />
                        <div className="text-center">
                            <button type="button" className="text-orange-500 font-bold hover:text-orange-600 transition-colors uppercase text-sm md:text-base">
                                Upload Aadhar Card & PAN Card
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center items-center gap-6 mt-12 flex-wrap">
                        <Button
                            type="submit"
                            className="min-w-[180px] bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/30 py-3 rounded-full text-lg uppercase tracking-wider"
                            disabled={formik.isSubmitting}
                        >
                            {formik.isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => formik.resetForm()}
                            className="min-w-[180px] bg-white hover:bg-gray-50 text-orange-500 border-2 border-orange-500/50 py-3 rounded-full text-lg uppercase tracking-wider h-auto"
                        >
                            Refresh
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Registration;
